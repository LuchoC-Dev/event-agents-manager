import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema.js";
import { broker } from "../ws/broker.js";
import { randomUUID } from "crypto";

export async function projectRoutes(app: FastifyInstance) {
  app.get("/projects", async () => {
    return db.select().from(projects).orderBy(projects.createdAt);
  });

  app.get<{ Params: { id: string } }>("/projects/:id", async (req, reply) => {
    const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!project) return reply.status(404).send({ error: "Project not found" });
    return project;
  });

  app.post<{ Body: { name: string; description?: string } }>("/projects", async (req) => {
    const now = new Date();
    const project = {
      id: randomUUID(),
      name: req.body.name,
      description: req.body.description ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(projects).values(project);
    broker.emit("project:created", project);
    return project;
  });

  app.patch<{ Params: { id: string }; Body: Partial<{ name: string; description: string }> }>(
    "/projects/:id",
    async (req, reply) => {
      const [existing] = await db.select().from(projects).where(eq(projects.id, req.params.id));
      if (!existing) return reply.status(404).send({ error: "Project not found" });
      await db.update(projects).set({ ...req.body, updatedAt: new Date() }).where(eq(projects.id, req.params.id));
      const [project] = await db.select().from(projects).where(eq(projects.id, req.params.id));
      broker.emit("project:updated", project);
      return project;
    }
  );

  app.delete<{ Params: { id: string } }>("/projects/:id", async (req, reply) => {
    const [existing] = await db.select().from(projects).where(eq(projects.id, req.params.id));
    if (!existing) return reply.status(404).send({ error: "Project not found" });
    await db.delete(projects).where(eq(projects.id, req.params.id));
    broker.emit("project:deleted", { id: req.params.id });
    return { ok: true };
  });
}
