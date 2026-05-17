#!/usr/bin/env node
import { program } from "commander";
import { projectCommand } from "./commands/project.js";
import { agentCommand } from "./commands/agent.js";
import { threadCommand } from "./commands/thread.js";
import { eventCommand } from "./commands/event.js";
import { templateCommand } from "./commands/template.js";
import { initCommand } from "./commands/init.js";
import { instructionCommand } from "./commands/instruction.js";
import { sessionCommand } from "./commands/session.js";

program
  .name("evam")
  .description("Event Agent Manager CLI")
  .version("0.1.0")
  .option("--role <rol>", "Rol del agente activo (override de sesión, ej: evam --role 'Tech Lead' instruction inbox)")
  .hook("preAction", (thisCommand) => {
    const role = thisCommand.opts().role as string | undefined;
    if (role) process.env.EAM_ROLE = role;
  });

program.addCommand(initCommand());
program.addCommand(instructionCommand());
program.addCommand(sessionCommand());
program.addCommand(projectCommand());
program.addCommand(agentCommand());
program.addCommand(threadCommand());
program.addCommand(eventCommand());
program.addCommand(templateCommand());

program.parse();
