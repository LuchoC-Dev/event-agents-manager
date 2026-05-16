import { Command } from "commander";
import { get, post } from "../api.js";
import { table, ok, label, handleError } from "../output.js";
import type { AgentEvent, Agent } from "@eam/shared";

const EVENT_TYPES = [
  "TASK_ASSIGNED", "TASK_STARTED", "TASK_COMPLETED", "DELEGATED",
  "AGENT_SPAWNED", "AGENT_ARCHIVED", "SUMMARY_CREATED", "BLOCKED", "UNBLOCKED", "ERROR",
];

export function eventCommand() {
  const cmd = new Command("event").description("Gestionar eventos");

  cmd
    .command("list")
    .description("Listar eventos de un proyecto o thread")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .option("-t, --thread <id>", "Filtrar por thread")
    .action(async (opts) => {
      try {
        const agents = await get<Agent[]>(`/projects/${opts.project}/agents`);
        const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

        const url = opts.thread
          ? `/projects/${opts.project}/threads/${opts.thread}/events`
          : `/projects/${opts.project}/events`;

        const events = await get<AgentEvent[]>(url);
        if (events.length === 0) { console.log("No hay eventos."); return; }

        table(
          ["Tipo", "Agente", "→ Destino", "Thread", "Fecha"],
          events.map((e) => [
            e.type,
            agentMap[e.agentId] ?? e.agentId.slice(0, 8),
            e.targetAgentId ? (agentMap[e.targetAgentId] ?? e.targetAgentId.slice(0, 8)) : "—",
            e.threadId?.slice(0, 8) ?? "—",
            new Date(e.createdAt).toLocaleString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  cmd
    .command("add")
    .description(`Registrar un evento. Tipos: ${EVENT_TYPES.join(", ")}`)
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .requiredOption("-t, --thread <id>", "ID del thread")
    .requiredOption("-a, --agent <id>", "ID del agente origen")
    .requiredOption("--type <tipo>", "Tipo de evento")
    .option("--target <id>", "ID del agente destino (para delegaciones)")
    .option("--payload <json>", "Payload JSON adicional", "{}")
    .action(async (opts) => {
      try {
        let payload: Record<string, unknown> = {};
        try { payload = JSON.parse(opts.payload); } catch {
          console.error("Error: --payload debe ser JSON válido");
          process.exit(1);
        }

        const event = await post<AgentEvent>(`/projects/${opts.project}/events`, {
          type: opts.type,
          threadId: opts.thread,
          agentId: opts.agent,
          targetAgentId: opts.target,
          payload,
        });

        ok(`Evento registrado: ${event.type}`);
        label("ID", event.id);
        if (event.threadId) label("Thread", event.threadId.slice(0, 8));
      } catch (e) { handleError(e); }
    });

  return cmd;
}
