import { Command } from "commander";
import { get, post, del } from "../api.js";
import { table, ok, label, handleError } from "../output.js";
import type { Project } from "@eam/shared";

export function projectCommand() {
  const cmd = new Command("project").description("Gestionar proyectos");

  cmd
    .command("list")
    .description("Listar todos los proyectos")
    .action(async () => {
      try {
        const projects = await get<Project[]>("/projects");
        if (projects.length === 0) {
          console.log("No hay proyectos. Creá uno con: eam project create <nombre>");
          return;
        }
        table(
          ["ID", "Nombre", "Descripción", "Creado"],
          projects.map((p) => [
            p.id.slice(0, 8),
            p.name,
            p.description ?? "—",
            new Date(p.createdAt).toLocaleDateString(),
          ])
        );
      } catch (e) { handleError(e); }
    });

  cmd
    .command("create <nombre>")
    .description("Crear un nuevo proyecto")
    .option("-d, --description <desc>", "Descripción del proyecto")
    .action(async (nombre, opts) => {
      try {
        const project = await post<Project>("/projects", {
          name: nombre,
          description: opts.description,
        });
        ok(`Proyecto creado: ${project.name}`);
        label("ID", project.id);
      } catch (e) { handleError(e); }
    });

  cmd
    .command("show <id>")
    .description("Ver detalle de un proyecto")
    .action(async (id) => {
      try {
        const project = await get<Project>(`/projects/${id}`);
        label("ID", project.id);
        label("Nombre", project.name);
        label("Descripción", project.description ?? "—");
        label("Creado", new Date(project.createdAt).toLocaleString());
      } catch (e) { handleError(e); }
    });

  cmd
    .command("delete <id>")
    .description("Eliminar un proyecto")
    .action(async (id) => {
      try {
        await del(`/projects/${id}`);
        ok("Proyecto eliminado");
      } catch (e) { handleError(e); }
    });

  return cmd;
}
