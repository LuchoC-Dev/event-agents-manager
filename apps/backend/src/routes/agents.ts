import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents, agentTemplates } from "../db/schema.js";
import { broker } from "../ws/broker.js";
import { randomUUID } from "crypto";

type AgentStatus = "idle" | "working" | "blocked" | "completed" | "archived";
type AgentCategory = "permanent" | "temporary";

export async function agentRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/agents", async (req) => {
    return db.select().from(agents).where(eq(agents.projectId, req.params.projectId)).orderBy(agents.createdAt);
  });

  app.post<{
    Params: { projectId: string };
    Body: {
      name: string;
      role: string;
      category?: AgentCategory;
      department?: string;
      parentId?: string;
      templateId?: string;
      systemPrompt?: string;
    };
  }>("/projects/:projectId/agents", async (req) => {
    const now = new Date();
    const agent = {
      id: randomUUID(),
      projectId: req.params.projectId,
      name: req.body.name,
      role: req.body.role,
      category: (req.body.category ?? "permanent") as AgentCategory,
      status: "idle" as AgentStatus,
      department: req.body.department ?? null,
      parentId: req.body.parentId ?? null,
      templateId: req.body.templateId ?? null,
      systemPrompt: req.body.systemPrompt ?? "",
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(agents).values(agent);
    broker.emit("agent:created", agent);
    return agent;
  });

  app.patch<{
    Params: { projectId: string; id: string };
    Body: Partial<{ status: AgentStatus; name: string; role: string; systemPrompt: string }>;
  }>("/projects/:projectId/agents/:id", async (req, reply) => {
    const [existing] = await db.select().from(agents).where(and(eq(agents.id, req.params.id), eq(agents.projectId, req.params.projectId)));
    if (!existing) return reply.status(404).send({ error: "Agent not found" });
    await db.update(agents).set({ ...req.body, updatedAt: new Date() }).where(eq(agents.id, req.params.id));
    const [agent] = await db.select().from(agents).where(eq(agents.id, req.params.id));
    broker.emit("agent:updated", agent);
    return agent;
  });

  // Templates
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/templates", async (req) => {
    return db.select().from(agentTemplates).where(eq(agentTemplates.projectId, req.params.projectId)).orderBy(agentTemplates.createdAt);
  });

  app.post<{
    Params: { projectId: string };
    Body: { name: string; role: string; department?: string; systemPrompt?: string; skills?: string[] };
  }>("/projects/:projectId/templates", async (req) => {
    const now = new Date();
    const template = {
      id: randomUUID(),
      projectId: req.params.projectId,
      name: req.body.name,
      role: req.body.role,
      department: req.body.department ?? null,
      systemPrompt: req.body.systemPrompt ?? "",
      skills: req.body.skills ?? [],
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(agentTemplates).values(template);
    return template;
  });
}
