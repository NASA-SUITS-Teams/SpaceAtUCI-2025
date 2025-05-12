console.log("Starting backend/backend/src/index.ts");
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { wsManager } from "./ws/manager";
import "./polling";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

console.log("Hono app initialized.");

app.get("/api/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    console.log("WebSocket upgrade request received.");
    return {
      onOpen(event, ws) {
        console.log("WebSocket connection opened.");
        if (ws.raw) {
          wsManager.addClient(ws.raw);
        } else {
          console.error("ws.raw is undefined in onOpen");
        }
      },
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
      },
      onClose: (event, ws) => {
        console.log("Connection closed");
        if (ws.raw) {
          wsManager.removeClient(ws.raw);
        } else {
          console.error("ws.raw is undefined in onClose");
        }
      },
      onError: (event, ws) => {
        console.error("WebSocket error:", event);
        if (ws.raw) {
          wsManager.removeClient(ws.raw);
        } else {
          console.error("ws.raw is undefined in onError");
        }
      },
    };
  })
);

const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Starting server on port ${port}...`);

Bun.serve({
  fetch: app.fetch,
  websocket: websocket,
  port: port,
});

console.log(`Server listening on http://localhost:${port}`);

console.log(
  "Finished backend/backend/src/index.ts setup - Server should be running."
);
