import { Command } from "commander";
import { get, post, patch } from "../api.js";
import { table, ok, label, handleError } from "../output.js";
import type { Agent } from "@eam/shared";

export function agentCommand() {
  const cmd = new Command("agent").description("Gestionar agentes");

  cmd
    .command("list")
    .description("Listar agentes de un proyecto")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (opts) => {
      try {
        const agents = await get<Agent[]>(`/projects/${opts.project}/agents`);
        if (agents.length === 0) {
          console.log("No hay agentes en este proyecto.");
          return;
        }
        table(
          ["ID", "Nombre", "Rol", "Categoría", "Status", "Dept"],
          agents.map((a) => [
            a.id.slice(0, 8),
            a.name,
            a.role,
            a.category,
            a.status,
            a.department ?? "—",
          ])
        );
      } catch (e) { handleError(e); }
    });

  cmd
    .command("create")
    .description("Crear un agente")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .requiredOption("-n, --name <nombre>", "Nombre del agente")
    .requiredOption("-r, --role <rol>", "Rol del agente")
    .option("-c, --category <cat>", "Categoría: permanent | temporary", "permanent")
    .option("-d, --department <dept>", "Departamento")
    .option("--parent <id>", "ID del agente manager/superior")
    .option("--prompt <texto>", "System prompt del agente")
    .action(async (opts) => {
      try {
        const agent = await post<Agent>(`/projects/${opts.project}/agents`, {
          name: opts.name,
          role: opts.role,
          category: opts.category,
          department: opts.department,
          parentId: opts.parent,
          systemPrompt: opts.prompt,
        });
        ok(`Agente creado: ${agent.name}`);
        label("ID", agent.id);
        label("Rol", agent.role);
        label("Categoría", agent.category);
      } catch (e) { handleError(e); }
    });

  cmd
    .command("status <agentId> <status>")
    .description("Cambiar el status de un agente (idle|working|blocked|completed|archived)")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (agentId, status, opts) => {
      try {
        const agent = await patch<Agent>(`/projects/${opts.project}/agents/${agentId}`, { status });
        ok(`Status actualizado: ${agent.name} → ${agent.status}`);
      } catch (e) { handleError(e); }
    });

  cmd
    .command("edit <agentId>")
    .description("Editar nombre, rol o system prompt de un agente")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .option("-n, --name <nombre>", "Nuevo nombre")
    .option("-r, --role <rol>", "Nuevo rol")
    .option("--prompt <texto>", "Nuevo system prompt")
    .action(async (agentId, opts) => {
      try {
        const body: Partial<{ name: string; role: string; systemPrompt: string }> = {};
        if (opts.name) body.name = opts.name;
        if (opts.role) body.role = opts.role;
        if (opts.prompt !== undefined) body.systemPrompt = opts.prompt;

        if (Object.keys(body).length === 0) {
          console.error("Error: especificá al menos un campo para editar (--name, --role, --prompt)");
          process.exit(1);
        }

        const agent = await patch<Agent>(`/projects/${opts.project}/agents/${agentId}`, body);
        ok(`Agente actualizado: ${agent.name}`);
        label("Rol", agent.role);
        label("System prompt", agent.systemPrompt || "(vacío)");
      } catch (e) { handleError(e); }
    });

  return cmd;
}
