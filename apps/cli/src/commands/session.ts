import { Command } from "commander";
import { readFile, writeFile, readdir, mkdir } from "fs/promises";
import { resolve } from "path";
import { loadSession } from "../api.js";
import { label, info, ok, fail, handleError } from "../output.js";

export function sessionCommand() {
  const cmd = new Command("session")
    .description("Gestionar sesión activa del agente");

  // Ver sesión activa
  cmd
    .command("show", { isDefault: true })
    .description("Ver sesión activa")
    .action(async () => {
      try {
        const session = await loadSession();
        if (!session) {
          info("No hay sesión activa. Ejecutá: evam init --role <rol>");
          return;
        }
        label("Agent ID", session.agentId);
        label("Proyecto", session.projectId);
        label("Rol", session.role);
        label("Backend", session.backendUrl);
      } catch (e) { handleError(e); }
    });

  // Listar sesiones disponibles
  cmd
    .command("list")
    .description("Listar todas las sesiones disponibles en .agents/")
    .action(async () => {
      try {
        const dirs = await readdir(resolve(".agents")).catch(() => [] as string[]);
        if (!dirs.length) { info("No hay sesiones guardadas en .agents/"); return; }
        for (const dir of dirs) {
          try {
            const raw = await readFile(resolve(`.agents/${dir}/session.json`), "utf-8");
            const s = JSON.parse(raw);
            console.log(`  ${dir.padEnd(30)} agentId: ${s.agentId.slice(0, 8)}  rol: ${s.role}`);
          } catch { /* skip dirs sin session.json */ }
        }
      } catch (e) { handleError(e); }
    });

  // Cambiar sesión activa escribiendo un symlink lógico en .agents/session.json
  cmd
    .command("use <role>")
    .description("Cambiar la sesión activa a otro rol (ej: evam session use backend-developer)")
    .action(async (role) => {
      try {
        const slug = role.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const sessionPath = resolve(`.agents/${slug}/session.json`);
        let raw: string;
        try {
          raw = await readFile(sessionPath, "utf-8");
        } catch {
          fail(`No existe sesión para "${slug}". Revisá evam session list.`);
          return;
        }
        // Escribir la sesión activa en .agents/active.json
        await mkdir(resolve(".agents"), { recursive: true });
        await writeFile(resolve(".agents/active.json"), raw);
        const s = JSON.parse(raw);
        ok(`Sesión activa cambiada a "${s.role}"`);
        label("Agent ID", s.agentId);
        label("Proyecto", s.projectId);
      } catch (e) { handleError(e); }
    });

  return cmd;
}
