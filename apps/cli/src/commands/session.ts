import { Command } from "commander";
import { loadSession } from "../api.js";
import { label, info, handleError } from "../output.js";

export function sessionCommand() {
  const cmd = new Command("session")
    .description("Ver sesión activa del agente")
    .action(async () => {
      try {
        const session = await loadSession();
        if (!session) {
          info("No hay sesión activa. Ejecutá: eam init --role <rol>");
          return;
        }
        label("Agent ID", session.agentId);
        label("Proyecto", session.projectId);
        label("Rol", session.role);
        label("Backend", session.backendUrl);
      } catch (e) { handleError(e); }
    });

  return cmd;
}
