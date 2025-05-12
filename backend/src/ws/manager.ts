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
    // Removed old handler logic
    console.log(
      `Publishing message type ${message.type} to ${this.clients.size} clients`
    );
    const messageString = JSON.stringify(message); // Use the message passed in

    this.clients.forEach((client) => {
      try {
        // Check readyState before sending (optional but good practice)
        if (client.readyState === WebSocket.OPEN) {
          // Use WebSocket global for readyState const
          client.send(messageString);
        } else {
          console.warn("Attempted to send message to non-open socket.");
          // Optionally remove client if state is closed/closing
          // this.removeClient(client);
        }
      } catch (error) {
        console.error("Error sending message to client:", error);
        // Optionally remove the faulty client
        // this.removeClient(client);
      }
    });

    // The server-side callback doesn't make as much sense here
    // Callbacks are usually for *receiving* messages
    // Kept optional callback signature for compatibility with PollingClient for now
    if (callback) {
      // This callback was previously used to notify listeners *within* the server
      // Keep this behaviour if needed by PollingClient logic
      callback(data);
    }
  }

  // Removed subscribe method - Server doesn't subscribe to its own broadcasts
  // Removed send method - Server uses publish_all or sends directly via ws instance
}

// singleton instance
export const wsManager = new WebSocketManager();
