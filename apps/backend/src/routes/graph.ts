import type { FastifyInstance } from "fastify";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents, threads, events } from "../db/schema.js";
import type { GraphProjection } from "@eam/shared";

export async function graphRoutes(app: FastifyInstance) {
  app.get<{ Params: { projectId: string } }>("/projects/:projectId/graph/org", async (req): Promise<GraphProjection> => {
    const allAgents = await db.select().from(agents).where(eq(agents.projectId, req.params.projectId));

    const nodes = allAgents.map((a) => ({
      id: a.id,
      type: "agent" as const,
      label: a.name,
      data: { role: a.role, status: a.status, category: a.category, department: a.department },
    }));

    const projectEvents = await db
      .select({ agentId: events.agentId, targetAgentId: events.targetAgentId })
      .from(events)
      .where(and(eq(events.projectId, req.params.projectId), isNotNull(events.targetAgentId)));

    const seen = new Set<string>();
    const edges = projectEvents
      .filter((e) => {
        const key = `${e.agentId}->${e.targetAgentId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((e) => ({
        id: `${e.agentId}->${e.targetAgentId}`,
        source: e.agentId,
        target: e.targetAgentId!,
        type: "event_interaction" as const,
      }));

    return { nodes, edges };
  });

  app.get<{ Params: { projectId: string; threadId: string } }>(
    "/projects/:projectId/graph/thread/:threadId",
    async (req): Promise<GraphProjection> => {
      const threadEvents = await db.select().from(events).where(
        and(eq(events.threadId, req.params.threadId), eq(events.projectId, req.params.projectId))
      );

      const agentIds = [...new Set(threadEvents.flatMap((e) => [e.agentId, e.targetAgentId].filter((id): id is string => id != null)))];
      const allAgents = await db.select().from(agents).where(eq(agents.projectId, req.params.projectId));
      const relevantAgents = allAgents.filter((a) => agentIds.includes(a.id));

      const [thread] = await db.select().from(threads).where(
        and(eq(threads.id, req.params.threadId), eq(threads.projectId, req.params.projectId))
      );

      const nodes = [
        ...(thread ? [{ id: thread.id, type: "thread" as const, label: thread.title, data: { status: thread.status } }] : []),
        ...relevantAgents.map((a) => ({
          id: a.id,
          type: "agent" as const,
          label: a.name,
          data: { role: a.role, status: a.status, category: a.category },
        })),
      ];

      const edges = threadEvents
        .filter((e) => e.targetAgentId != null)
        .map((e) => ({
          id: e.id,
          source: e.agentId,
          target: e.targetAgentId!,
          type: "delegated_to" as const,
        }));

      return { nodes, edges };
    }
  );
}
