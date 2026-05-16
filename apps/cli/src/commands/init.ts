import { Command } from "commander";
import { readFile, writeFile, mkdir } from "fs/promises";
import { resolve } from "path";
import { post, get, setBaseUrl } from "../api.js";
import { ok, label, fail, handleError } from "../output.js";
import type { Project, Agent } from "@eam/shared";

interface AgentConfig {
  project: { id?: string; name: string; description?: string };
  backend: { url: string };
}

interface Session {
  agentId: string;
  projectId: string;
  role: string;
  backendUrl: string;
}

export function initCommand() {
  const cmd = new Command("init")
    .description("Inicializar agente en el sistema organizacional")
    .option("-r, --role <rol>", "Rol organizacional del agente (ej: 'Frontend Lead')")
    .addHelpText("after", "\nEjemplos:\n  eam init -r \"Tech Lead\"\n  eam init --role \"Backend Developer\" --name \"Backend Dev\"")
    .option("-n, --name <nombre>", "Nombre del agente (por defecto usa el rol)")
    .option("-c, --config <path>", "Path al agent.config.json", "./agent.config.json")
    .action(async (opts) => {
      try {
        // Permitir --role desde el root (eam --role "X" init) o como opción propia (-r / --role)
        const role = opts.role ?? process.env.EAM_ROLE;
        if (!role) {
          fail("Especificá el rol con -r o --role (ej: eam init -r \"Tech Lead\")");
          return;
        }
        opts.role = role;

        // Leer config
        let config: AgentConfig;
        try {
          const raw = await readFile(resolve(opts.config), "utf-8");
          config = JSON.parse(raw);
        } catch {
          fail(`No se pudo leer ${opts.config}. Asegurate de tener un agent.config.json en el root del proyecto.`);
          return;
        }

        setBaseUrl(config.backend.url);

        // Crear proyecto si no existe
        let project: Project;
        if (config.project.id) {
          try {
            project = await get<Project>(`/projects/${config.project.id}`);
          } catch {
            project = await post<Project>("/projects", {
              name: config.project.name,
              description: config.project.description,
            });
            ok(`Proyecto creado: ${project.name}`);
            // Persistir el id generado en agent.config.json
            config.project.id = project.id;
            await writeFile(resolve(opts.config), JSON.stringify(config, null, 2));
          }
        } else {
          project = await post<Project>("/projects", {
            name: config.project.name,
            description: config.project.description,
          });
          ok(`Proyecto creado: ${project.name}`);
          // Persistir el id generado en agent.config.json
          config.project.id = project.id;
          await writeFile(resolve(opts.config), JSON.stringify(config, null, 2));
        }

        // Registrar agente
        const name = opts.name ?? opts.role;
        const agent = await post<Agent>(`/projects/${project.id}/agents`, {
          name,
          role: opts.role,
          category: "permanent",
        });

        ok(`Agente registrado: ${agent.name}`);
        label("Agent ID", agent.id);
        label("Rol", agent.role);
        label("Proyecto", project.id);
        label("Backend", config.backend.url);

        // Guardar sesión en .agents/<role-slug>/session.json (no pisar si ya existe)
        const slug = opts.role.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const sessionDir = resolve(`.agents/${slug}`);
        await mkdir(sessionDir, { recursive: true });

        const sessionPath = resolve(sessionDir, "session.json");
        let session: Session;
        try {
          const existing = JSON.parse(await readFile(sessionPath, "utf-8")) as Session;
          session = existing;
          ok(`Sesión existente recuperada para rol "${opts.role}" (agentId: ${existing.agentId.slice(0, 8)})`);
        } catch {
          session = {
            agentId: agent.id,
            projectId: project.id,
            role: opts.role,
            backendUrl: config.backend.url,
          };
          await writeFile(sessionPath, JSON.stringify(session, null, 2));
        }

        // Descargar e imprimir el protocolo
        console.log("\n" + "─".repeat(60));
        console.log("PROTOCOLO ORGANIZACIONAL");
        console.log("─".repeat(60));
        try {
          const { protocol } = await get<{ protocol: string }>("/protocol");
          console.log(protocol);
        } catch {
          console.log("(No se pudo cargar el protocolo desde el backend)");
        }
        // Marcar como sesión activa
        await writeFile(resolve(".agents/active.json"), JSON.stringify(session, null, 2));

        console.log("─".repeat(60));
        console.log(`\nSesión guardada en .agents/${slug}/session.json`);
        console.log("Sesión activa: " + slug + " (eam session use <rol> para cambiar)");
        console.log("Estás listo para operar organizacionalmente.\n");

      } catch (e) { handleError(e); }
    });

  return cmd;
}
