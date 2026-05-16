import { Command } from "commander";
import { get, post } from "../api.js";
import { table, ok, label, handleError } from "../output.js";
import type { AgentTemplate } from "@eam/shared";

export function templateCommand() {
  const cmd = new Command("template").description("Gestionar templates de agentes");

  cmd
    .command("list")
    .description("Listar templates de un proyecto")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .action(async (opts) => {
      try {
        const templates = await get<AgentTemplate[]>(`/projects/${opts.project}/templates`);
        if (templates.length === 0) {
          console.log("No hay templates en este proyecto.");
          return;
        }
        table(
          ["ID", "Nombre", "Rol", "Dept", "Skills"],
          templates.map((t) => [
            t.id.slice(0, 8),
            t.name,
            t.role,
            t.department ?? "—",
            (t.skills as string[]).join(", ") || "—",
          ])
        );
      } catch (e) { handleError(e); }
    });

  cmd
    .command("create")
    .description("Crear un template de agente")
    .requiredOption("-p, --project <id>", "ID del proyecto")
    .requiredOption("-n, --name <nombre>", "Nombre del template")
    .requiredOption("-r, --role <rol>", "Rol del agente")
    .option("-d, --department <dept>", "Departamento")
    .option("--prompt <texto>", "System prompt base")
    .option("--skills <lista>", "Skills separadas por coma (ej: typescript,testing)")
    .action(async (opts) => {
      try {
        const skills = opts.skills
          ? opts.skills.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

        const template = await post<AgentTemplate>(`/projects/${opts.project}/templates`, {
          name: opts.name,
          role: opts.role,
          department: opts.department,
          systemPrompt: opts.prompt,
          skills,
        });

        ok(`Template creado: ${template.name}`);
        label("ID", template.id);
        label("Rol", template.role);
        if (template.skills.length > 0) label("Skills", (template.skills as string[]).join(", "));
      } catch (e) { handleError(e); }
    });

  return cmd;
}
