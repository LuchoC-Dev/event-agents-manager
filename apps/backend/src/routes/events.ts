import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, agents, threads } from "../db/schema.js";
import { broker } from "../ws/broker.js";
import { randomUUID } from "crypto";

export async function eventRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/events", async (req) => {
    return db.select().from(events).where(eq(events.projectId, req.params.projectId)).orderBy(events.createdAt);
  });

  app.post<{
    Params: { projectId: string };
    Body: {
      type: string;
      threadId: string;
      agentId: string;
      targetAgentId?: string;
      payload?: Record<string, unknown>;
    };
  }>("/projects/:projectId/events", async (req, reply) => {
    const [agent] = await db.select().from(agents).where(and(eq(agents.id, req.body.agentId), eq(agents.projectId, req.params.projectId)));
    if (!agent) return reply.status(400).send({ error: "Agent not found in this project" });

    const [thread] = await db.select().from(threads).where(and(eq(threads.id, req.body.threadId), eq(threads.projectId, req.params.projectId)));
    if (!thread) return reply.status(400).send({ error: "Thread not found in this project" });

    const event = {
      id: randomUUID(),
      projectId: req.params.projectId,
      type: req.body.type,
      threadId: req.body.threadId,
      agentId: req.body.agentId,
      targetAgentId: req.body.targetAgentId ?? null,
      payload: req.body.payload ?? {},
      createdAt: new Date(),
    };
    await db.insert(events).values(event);
    broker.emit("event:created", event);
    return event;
  });
}
