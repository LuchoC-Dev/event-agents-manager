import { Command } from "commander";
import { get, post, patch } from "../api.js";
import { table, ok, label, handleError } from "../output.js";
import type { Thread, Agent } from "@eam/shared";

export function threadCommand() {
  const cmd = new Command("thread").description("Gestionar threads");

  cmd
    .command("list")
    .description("Listar threads de un proyecto")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (opts) => {
      try {
        const threads = await get<Thread[]>(`/projects/${opts.project}/threads`);
        if (threads.length === 0) {
          console.log("No hay threads en este proyecto.");
          return;
        }
        table(
          ["ID", "Título", "Status", "Creado"],
          threads.map((t) => [
            t.id.slice(0, 8),
            t.title,
            t.status,
            new Date(t.createdAt).toLocaleDateString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  cmd
    .command("create")
    .description("Crear un thread")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .requiredOption("-t, --title <titulo>", "Título del thread")
    .requiredOption("-o, --owner <agentId>", "ID del agente responsable")
    .option("-d, --description <desc>", "Descripción")
    .option("--parent <threadId>", "ID del thread padre")
    .action(async (opts) => {
      try {
        const thread = await post<Thread>(`/projects/${opts.project}/threads`, {
          title: opts.title,
          description: opts.description,
          ownerAgentId: opts.owner,
          parentThreadId: opts.parent,
        });
        ok(`Thread creado: ${thread.title}`);
        label("ID", thread.id);
        label("Status", thread.status);
      } catch (e) { handleError(e); }
    });

  cmd
    .command("status <threadId> <status>")
    .description("Cambiar el status de un thread (open|in_progress|blocked|completed|archived)")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (threadId, status, opts) => {
      try {
        const thread = await patch<Thread>(`/projects/${opts.project}/threads/${threadId}`, { status });
        ok(`Status actualizado: ${thread.title} → ${thread.status}`);
      } catch (e) { handleError(e); }
    });

  cmd
    .command("show <threadId>")
    .description("Ver detalle de un thread con su timeline de eventos")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (threadId, opts) => {
      try {
        const [threads, agents, events] = await Promise.all([
          get<Thread[]>(`/projects/${opts.project}/threads`),
          get<Agent[]>(`/projects/${opts.project}/agents`),
          get<Array<{ id: string; type: string; agentId: string; targetAgentId?: string; payload: Record<string, unknown>; createdAt: string }>>(
            `/projects/${opts.project}/threads/${threadId}/events`
          ),
        ]);

        const thread = threads.find((t) => t.id === threadId || t.id.startsWith(threadId));
        if (!thread) { console.log("Thread no encontrado."); return; }

        const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

        label("Título", thread.title);
        label("Status", thread.status);
        if (thread.description) label("Descripción", thread.description);
        console.log("");

        if (events.length === 0) {
          console.log("Sin eventos.");
          return;
        }

        table(
          ["Tipo", "Agente", "→ Destino", "Hora"],
          events.map((e) => [
            e.type,
            agentMap[e.agentId] ?? e.agentId.slice(0, 8),
            e.targetAgentId ? (agentMap[e.targetAgentId] ?? e.targetAgentId.slice(0, 8)) : "—",
            new Date(e.createdAt).toLocaleTimeString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  return cmd;
}
