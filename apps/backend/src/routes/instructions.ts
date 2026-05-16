import type { FastifyInstance } from "fastify";
import { eq, and, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { instructions, instructionRelations, events, agents } from "../db/schema.js";
import { broker } from "../ws/broker.js";
import { randomUUID } from "crypto";

type InstructionStatus =
  | "created" | "received" | "accepted" | "in_progress"
  | "responded" | "completed" | "rejected" | "error" | "cancelled";

type InstructionSubstatus = "waiting_review" | "waiting_external" | "retry_requested" | null;

async function emitEvent(
  projectId: string,
  type: string,
  agentId: string,
  instructionId: string,
  targetAgentId: string | null,
  threadId: string | null,
  payload: Record<string, unknown> = {}
) {
  const event = {
    id: randomUUID(),
    projectId,
    type,
    instructionId,
    threadId,
    agentId,
    targetAgentId,
    payload,
    createdAt: new Date(),
  };
  await db.insert(events).values(event);
  broker.emit("event:created", event);
  return event;
}

async function updateInstruction(id: string, updates: Partial<{ status: InstructionStatus; substatus: InstructionSubstatus }>) {
  await db.update(instructions).set({ ...updates, updatedAt: new Date() }).where(eq(instructions.id, id));
  const [inst] = await db.select().from(instructions).where(eq(instructions.id, id));
  broker.emit("instruction:updated", inst);
  return inst;
}

export async function instructionRoutes(app: FastifyInstance) {
  // List instructions for project (inbox/outbox filter)
  app.get<{
    Params: { projectId: string };
    Querystring: { status?: string; receiverAgentId?: string; senderAgentId?: string; threadId?: string };
  }>("/projects/:projectId/instructions", async (req) => {
    const { projectId } = req.params;
    const { status, receiverAgentId, senderAgentId, threadId } = req.query;

    let query = db.select().from(instructions).where(eq(instructions.projectId, projectId));

    const rows = await db.select().from(instructions).where(
      and(
        eq(instructions.projectId, projectId),
        status ? eq(instructions.status, status as InstructionStatus) : undefined,
        receiverAgentId ? eq(instructions.receiverAgentId, receiverAgentId) : undefined,
        senderAgentId ? eq(instructions.senderAgentId, senderAgentId) : undefined,
        threadId ? eq(instructions.threadId, threadId) : undefined,
      )
    );
    return rows;
  });

  // Get single instruction with events and relations
  app.get<{ Params: { projectId: string; id: string } }>(
    "/projects/:projectId/instructions/:id",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(
        and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId))
      );
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const instEvents = await db.select().from(events)
        .where(eq(events.instructionId, req.params.id))
        .orderBy(events.sequenceNumber);

      const relations = await db.select().from(instructionRelations).where(
        or(
          eq(instructionRelations.fromInstructionId, req.params.id),
          eq(instructionRelations.toInstructionId, req.params.id)
        )
      );

      return { ...inst, events: instEvents, relations };
    }
  );

  // Create instruction
  app.post<{
    Params: { projectId: string };
    Body: {
      threadId?: string;
      senderAgentId: string;
      receiverAgentId: string;
      parentInstructionId?: string;
      body: string;
    };
  }>("/projects/:projectId/instructions", async (req, reply) => {
    const { projectId } = req.params;
    const { threadId, senderAgentId, receiverAgentId, parentInstructionId, body } = req.body;

    const [sender] = await db.select().from(agents).where(and(eq(agents.id, senderAgentId), eq(agents.projectId, projectId)));
    if (!sender) return reply.status(400).send({ error: "Sender agent not found in project" });

    const [receiver] = await db.select().from(agents).where(and(eq(agents.id, receiverAgentId), eq(agents.projectId, projectId)));
    if (!receiver) return reply.status(400).send({ error: "Receiver agent not found in project" });

    const now = new Date();
    const inst = {
      id: randomUUID(),
      projectId,
      threadId: threadId ?? null,
      senderAgentId,
      receiverAgentId,
      parentInstructionId: parentInstructionId ?? null,
      body,
      status: "created" as InstructionStatus,
      substatus: null as InstructionSubstatus,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(instructions).values(inst);
    broker.emit("instruction:created", inst);

    await emitEvent(projectId, "INSTRUCTION_CREATED", senderAgentId, inst.id, receiverAgentId, threadId ?? null, { body });

    return inst;
  });

  // Accept
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string } }>(
    "/projects/:projectId/instructions/:id/accept",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "accepted" });
      await emitEvent(req.params.projectId, "INSTRUCTION_ACCEPTED", req.body.agentId, inst.id, null, inst.threadId, {});
      return updated;
    }
  );

  // Reject
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string; reason?: string } }>(
    "/projects/:projectId/instructions/:id/reject",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "rejected" });
      await emitEvent(req.params.projectId, "INSTRUCTION_REJECTED", req.body.agentId, inst.id, null, inst.threadId, { reason: req.body.reason });
      return updated;
    }
  );

  // Respond
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string; body: string } }>(
    "/projects/:projectId/instructions/:id/respond",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "responded" });
      await emitEvent(req.params.projectId, "INSTRUCTION_RESPONDED", req.body.agentId, inst.id, null, inst.threadId, { body: req.body.body });
      return updated;
    }
  );

  // Complete
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string; body?: string } }>(
    "/projects/:projectId/instructions/:id/complete",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "completed" });
      await emitEvent(req.params.projectId, "INSTRUCTION_COMPLETED", req.body.agentId, inst.id, null, inst.threadId, { body: req.body.body });
      return updated;
    }
  );

  // Cancel
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string } }>(
    "/projects/:projectId/instructions/:id/cancel",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "cancelled" });
      await emitEvent(req.params.projectId, "INSTRUCTION_CANCELLED", req.body.agentId, inst.id, null, inst.threadId, {});
      return updated;
    }
  );

  // Request review
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string; reviewerAgentId: string } }>(
    "/projects/:projectId/instructions/:id/review-request",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { substatus: "waiting_review" });
      await emitEvent(req.params.projectId, "REVIEW_REQUESTED", req.body.agentId, inst.id, req.body.reviewerAgentId, inst.threadId, {});
      return updated;
    }
  );

  // Retry
  app.post<{ Params: { projectId: string; id: string }; Body: { agentId: string } }>(
    "/projects/:projectId/instructions/:id/retry",
    async (req, reply) => {
      const [inst] = await db.select().from(instructions).where(and(eq(instructions.id, req.params.id), eq(instructions.projectId, req.params.projectId)));
      if (!inst) return reply.status(404).send({ error: "Instruction not found" });

      const updated = await updateInstruction(inst.id, { status: "in_progress", substatus: "retry_requested" });
      await emitEvent(req.params.projectId, "RETRY_REQUESTED", req.body.agentId, inst.id, null, inst.threadId, {});
      return updated;
    }
  );

  // Add relation
  app.post<{
    Params: { projectId: string; id: string };
    Body: { toInstructionId: string; relationType: string };
  }>("/projects/:projectId/instructions/:id/relations", async (req, reply) => {
    const relation = {
      id: randomUUID(),
      fromInstructionId: req.params.id,
      toInstructionId: req.body.toInstructionId,
      relationType: req.body.relationType as "clarification_of" | "retry_of" | "review_of" | "child_of" | "related_to",
      createdAt: new Date(),
    };
    await db.insert(instructionRelations).values(relation);
    return relation;
  });

  // Get events for instruction
  app.get<{ Params: { projectId: string; id: string } }>(
    "/projects/:projectId/instructions/:id/events",
    async (req) => {
      return db.select().from(events)
        .where(eq(events.instructionId, req.params.id))
        .orderBy(events.sequenceNumber);
    }
  );

}
