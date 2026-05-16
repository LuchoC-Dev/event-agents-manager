import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { projectRoutes } from "./routes/projects.js";
import { agentRoutes } from "./routes/agents.js";
import { threadRoutes } from "./routes/threads.js";
import { eventRoutes } from "./routes/events.js";
import { graphRoutes } from "./routes/graph.js";
import { instructionRoutes } from "./routes/instructions.js";
import { readProtocol } from "./protocol.js";
import { broker } from "./ws/broker.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(websocket);

await app.register(projectRoutes, { prefix: "/api" });
await app.register(agentRoutes, { prefix: "/api" });
await app.register(threadRoutes, { prefix: "/api" });
await app.register(eventRoutes, { prefix: "/api" });
await app.register(graphRoutes, { prefix: "/api" });
await app.register(instructionRoutes, { prefix: "/api" });

app.get("/ws", { websocket: true }, (socket) => {
  broker.add(socket);
});

app.get("/health", async () => ({ status: "ok" }));
app.get("/protocol", async () => ({ protocol: await readProtocol() }));

try {
  await app.listen({ port: Number(process.env.PORT ?? 3001), host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
