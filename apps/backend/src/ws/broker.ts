import type { SocketStream } from "@fastify/websocket";

type WS = SocketStream["socket"];

const clients = new Set<WS>();

export const broker = {
  add(connection: SocketStream) {
    const ws = connection.socket;
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  },

  emit(event: string, data: unknown) {
    const msg = JSON.stringify({ event, data });
    for (const client of clients) {
      if (client.readyState === 1) client.send(msg);
    }
  },
};
