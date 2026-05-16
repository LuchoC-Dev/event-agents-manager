import { Command } from "commander";
import { get, post, loadSession } from "../api.js";
import { table, ok, label, fail, handleError, info } from "../output.js";
import type { Instruction, Agent, AgentEvent } from "@eam/shared";

async function requireSession() {
  const session = await loadSession();
  if (!session) fail("No hay sesión activa. Ejecutá: eam init --role <rol>");
  return session!;
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    created: "⬜", received: "🔵", accepted: "🟡", in_progress: "🟠",
    responded: "🟣", completed: "🟢", rejected: "🔴", error: "❌", cancelled: "⚫",
  };
  return (colors[status] ?? "❓") + " " + status;
}

export function instructionCommand() {
  const cmd = new Command("instruction").description("Gestionar instrucciones organizacionales");

  // INBOX
  cmd
    .command("inbox")
    .description("Ver instrucciones recibidas (soy el receiver)")
    .option("--status <status>", "Filtrar por status")
    .action(async (opts) => {
      try {
        const session = await requireSession();
        const agents = await get<Agent[]>(`/projects/${session.projectId}/agents`);
        const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

        const qs = new URLSearchParams({ receiverAgentId: session.agentId });
        if (opts.status) qs.set("status", opts.status);

        const instructions = await get<Instruction[]>(`/projects/${session.projectId}/instructions?${qs}`);
        if (!instructions.length) { info("No hay instrucciones en tu inbox."); return; }

        table(
          ["ID", "De", "Status", "Body", "Fecha"],
          instructions.map((i) => [
            i.id.slice(0, 8),
            agentMap[i.senderAgentId] ?? i.senderAgentId.slice(0, 8),
            statusColor(i.status),
            i.body.slice(0, 50) + (i.body.length > 50 ? "..." : ""),
            new Date(i.createdAt).toLocaleString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  // OUTBOX
  cmd
    .command("outbox")
    .description("Ver instrucciones enviadas (soy el sender)")
    .option("--status <status>", "Filtrar por status")
    .action(async (opts) => {
      try {
        const session = await requireSession();
        const agents = await get<Agent[]>(`/projects/${session.projectId}/agents`);
        const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

        const qs = new URLSearchParams({ senderAgentId: session.agentId });
        if (opts.status) qs.set("status", opts.status);

        const instructions = await get<Instruction[]>(`/projects/${session.projectId}/instructions?${qs}`);
        if (!instructions.length) { info("No hay instrucciones en tu outbox."); return; }

        table(
          ["ID", "Para", "Status", "Body", "Fecha"],
          instructions.map((i) => [
            i.id.slice(0, 8),
            agentMap[i.receiverAgentId] ?? i.receiverAgentId.slice(0, 8),
            statusColor(i.status),
            i.body.slice(0, 50) + (i.body.length > 50 ? "..." : ""),
            new Date(i.createdAt).toLocaleString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  // CREATE
  cmd
    .command("create")
    .description("Crear una instrucción hacia otro agente")
    .requiredOption("--to <agentId>", "ID del agente receptor")
    .requiredOption("--body <texto>", "Cuerpo de la instrucción")
    .option("--thread <threadId>", "ID del thread")
    .option("--parent <instructionId>", "ID de instrucción padre")
    .action(async (opts) => {
      try {
        const session = await requireSession();
        const inst = await post<Instruction>(`/projects/${session.projectId}/instructions`, {
          senderAgentId: session.agentId,
          receiverAgentId: opts.to,
          body: opts.body,
          threadId: opts.thread,
          parentInstructionId: opts.parent,
        });
        ok(`Instrucción creada`);
        label("ID", inst.id);
        label("Para", inst.receiverAgentId.slice(0, 8));
        label("Status", inst.status);
      } catch (e) { handleError(e); }
    });

  // SHOW
  cmd
    .command("show <instructionId>")
    .description("Ver detalle de una instrucción con su historial de eventos")
    .action(async (id, opts) => {
      try {
        const session = await requireSession();
        const inst = await get<Instruction & { events: AgentEvent[]; relations: unknown[] }>(
          `/projects/${session.projectId}/instructions/${id}`
        );
        const agents = await get<Agent[]>(`/projects/${session.projectId}/agents`);
        const agentMap = Object.fromEntries(agents.map((a) => [a.id, a.name]));

        console.log("\n" + "─".repeat(50));
        label("ID", inst.id);
        label("De", agentMap[inst.senderAgentId] ?? inst.senderAgentId);
        label("Para", agentMap[inst.receiverAgentId] ?? inst.receiverAgentId);
        label("Status", statusColor(inst.status));
        if (inst.substatus) label("Substatus", inst.substatus);
        if (inst.threadId) label("Thread", inst.threadId.slice(0, 8));
        console.log("\nBody:");
        console.log(inst.body);

        if (inst.events.length) {
          console.log("\nEventos:");
          table(
            ["#", "Tipo", "Agente", "Fecha"],
            inst.events.map((e) => [
              String(e.sequenceNumber),
              e.type,
              agentMap[e.agentId] ?? e.agentId.slice(0, 8),
              new Date(e.createdAt).toLocaleString(),
            ])
          );
        }
        console.log("─".repeat(50) + "\n");
      } catch (e) { handleError(e); }
    });

  // ACCEPT
  cmd
    .command("accept <instructionId>")
    .description("Aceptar una instrucción")
    .action(async (id) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/accept`, { agentId: session.agentId });
        ok(`Instrucción ${id.slice(0, 8)} aceptada`);
      } catch (e) { handleError(e); }
    });

  // REJECT
  cmd
    .command("reject <instructionId>")
    .description("Rechazar una instrucción")
    .option("--reason <texto>", "Motivo del rechazo")
    .action(async (id, opts) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/reject`, { agentId: session.agentId, reason: opts.reason });
        ok(`Instrucción ${id.slice(0, 8)} rechazada`);
      } catch (e) { handleError(e); }
    });

  // RESPOND
  cmd
    .command("respond <instructionId>")
    .description("Responder una instrucción (parcialmente)")
    .requiredOption("--body <texto>", "Contenido de la respuesta")
    .action(async (id, opts) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/respond`, { agentId: session.agentId, body: opts.body });
        ok(`Instrucción ${id.slice(0, 8)} respondida`);
      } catch (e) { handleError(e); }
    });

  // COMPLETE
  cmd
    .command("complete <instructionId>")
    .description("Completar una instrucción")
    .option("--body <texto>", "Resultado o resumen del trabajo completado")
    .action(async (id, opts) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/complete`, { agentId: session.agentId, body: opts.body });
        ok(`Instrucción ${id.slice(0, 8)} completada`);
      } catch (e) { handleError(e); }
    });

  // CANCEL
  cmd
    .command("cancel <instructionId>")
    .description("Cancelar una instrucción")
    .action(async (id) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/cancel`, { agentId: session.agentId });
        ok(`Instrucción ${id.slice(0, 8)} cancelada`);
      } catch (e) { handleError(e); }
    });

  // REVIEW REQUEST
  cmd
    .command("review-request <instructionId>")
    .description("Solicitar revisión de una instrucción")
    .requiredOption("--reviewer <agentId>", "ID del agente revisor")
    .action(async (id, opts) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/review-request`, { agentId: session.agentId, reviewerAgentId: opts.reviewer });
        ok(`Revisión solicitada para ${id.slice(0, 8)}`);
      } catch (e) { handleError(e); }
    });

  // RETRY
  cmd
    .command("retry <instructionId>")
    .description("Marcar una instrucción para reintento")
    .action(async (id) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${id}/retry`, { agentId: session.agentId });
        ok(`Reintento solicitado para ${id.slice(0, 8)}`);
      } catch (e) { handleError(e); }
    });

  // RELATE
  cmd
    .command("relate <fromId> <toId>")
    .description("Relacionar dos instrucciones")
    .requiredOption("--type <tipo>", "Tipo: clarification_of | retry_of | review_of | child_of | related_to")
    .action(async (fromId, toId, opts) => {
      try {
        const session = await requireSession();
        await post(`/projects/${session.projectId}/instructions/${fromId}/relations`, {
          toInstructionId: toId,
          relationType: opts.type,
        });
        ok(`Relación creada: ${fromId.slice(0, 8)} → ${toId.slice(0, 8)} (${opts.type})`);
      } catch (e) { handleError(e); }
    });

  return cmd;
}
