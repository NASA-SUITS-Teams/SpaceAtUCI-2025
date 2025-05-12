import type { ServerWebSocket } from "bun"; // Added Bun type
import { WsMessage } from "./schema";

class WebSocketManager {
  // Removed: private websocket: WebSocket;
  // Removed: private messageHandlers ... (Subscribing logic needs rethink for server-side)
  private clients: Set<ServerWebSocket> = new Set(); // Store active server connections

  constructor() {
    // Removed constructor logic that created a client WebSocket
    console.log("WebSocketManager (Server-Side) initialized.");
  }

  // Method for Hono to add a client when it connects
  public addClient(ws: ServerWebSocket): void {
    console.log("Adding client to WebSocketManager");
    this.clients.add(ws);
  }

  // Method for Hono to remove a client when it disconnects
  public removeClient(ws: ServerWebSocket): void {
    console.log("Removing client from WebSocketManager");
    this.clients.delete(ws);
  }

  // Publish data to all connected clients
  public publish_all(
    message: WsMessage,
    data: any,
    callback?: (data: any) => void
  ) {
    if (message.type === "low_frequency" || message.type === "rock_data") {
      console.log(
        `Sending ${message.type} data:`,
        JSON.stringify(message, null, 2)
      );
    }

    this.clients.forEach((client) => {
      try {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        } else {
          console.warn("Attempted to send message to non-open socket.");
        }
      } catch (error) {
        console.error("Error sending message to client:", error);
      }
    });

    if (callback) {
      callback(data);
    }
  }

  // Removed subscribe method - Server doesn't subscribe to its own broadcasts
  // Removed send method - Server uses publish_all or sends directly via ws instance
}

// singleton instance
export const wsManager = new WebSocketManager();
