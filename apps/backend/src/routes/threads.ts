import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { threads, events } from "../db/schema.js";
import { broker } from "../ws/broker.js";
import { randomUUID } from "crypto";

type ThreadStatus = "open" | "in_progress" | "blocked" | "completed" | "archived";

export async function threadRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/threads", async (req) => {
    return db.select().from(threads).where(eq(threads.projectId, req.params.projectId)).orderBy(threads.createdAt);
  });

  app.get<{ Params: { projectId: string; id: string } }>("/projects/:projectId/threads/:id/events", async (req) => {
    return db.select().from(events)
      .where(and(eq(events.threadId, req.params.id), eq(events.projectId, req.params.projectId)))
      .orderBy(events.createdAt);
  });

  app.post<{
    Params: { projectId: string };
    Body: { title: string; description?: string; ownerAgentId: string; parentThreadId?: string };
  }>("/projects/:projectId/threads", async (req) => {
    const now = new Date();
    const thread = {
      id: randomUUID(),
      projectId: req.params.projectId,
      title: req.body.title,
      description: req.body.description ?? null,
      status: "open" as ThreadStatus,
      ownerAgentId: req.body.ownerAgentId,
      parentThreadId: req.body.parentThreadId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(threads).values(thread);

    const event = {
      id: randomUUID(),
      projectId: req.params.projectId,
      type: "THREAD_CREATED",
      threadId: thread.id,
      agentId: thread.ownerAgentId,
      targetAgentId: null,
      payload: { title: thread.title },
      createdAt: now,
    };
    await db.insert(events).values(event);

    broker.emit("thread:created", thread);
    broker.emit("event:created", event);
    return thread;
  });

  app.patch<{
    Params: { projectId: string; id: string };
    Body: Partial<{ status: ThreadStatus; title: string; description: string }>;
  }>("/projects/:projectId/threads/:id", async (req, reply) => {
    const [existing] = await db.select().from(threads).where(and(eq(threads.id, req.params.id), eq(threads.projectId, req.params.projectId)));
    if (!existing) return reply.status(404).send({ error: "Thread not found" });
    await db.update(threads).set({ ...req.body, updatedAt: new Date() }).where(eq(threads.id, req.params.id));
    const [thread] = await db.select().from(threads).where(eq(threads.id, req.params.id));
    broker.emit("thread:updated", thread);
    return thread;
  });
}
