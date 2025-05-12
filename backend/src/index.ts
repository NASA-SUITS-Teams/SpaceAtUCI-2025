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

// Add test rock data sending
let testInterval: ReturnType<typeof setInterval> | null = null;

app.get("/api/test/start", (c) => {
  if (testInterval) {
    clearInterval(testInterval);
  }

  testInterval = setInterval(() => {
    const testRockData = {
      evaId: 1,
      specId: 123,
      oxygen: 21.5,
      water: 0.5,
      co2: 0.04,
      h2: 0.0,
      n2: 78.0,
      other: 0.0,
      temperature: 25.0,
      pressure: 101325.0,
      humidity: 45.0,
      light: 1000.0,
    };

    wsManager.publish_all(
      {
        type: "rock_data",
        data: testRockData,
        success: true,
      },
      testRockData
    );
  }, 3000); // Send every 3 seconds

  return c.text("Test rock data sending started");
});

app.get("/api/test/stop", (c) => {
  if (testInterval) {
    clearInterval(testInterval);
    testInterval = null;
  }
  return c.text("Test rock data sending stopped");
});

// --- Explicitly start the server ---
const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Starting server on port ${port}...`);

Bun.serve({
  fetch: app.fetch,
  websocket: websocket, // Use the websocket handler from createBunWebSocket
  port: port,
});

console.log(`Server listening on http://localhost:${port}`);

console.log(
  "Finished backend/backend/src/index.ts setup - Server should be running."
); // This line might not be reached if Bun.serve blocks
