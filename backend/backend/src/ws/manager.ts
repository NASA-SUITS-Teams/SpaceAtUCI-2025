import { WsMessage } from './schema'
class WebSocketManager {
    private websocket: WebSocket;
    private messageHandlers: Map<string, ((data: any) => void)[]> = new Map(); //map each message type to a callback function

    constructor(url: string = "ws://localhost:3000/ws") {
        this.websocket = new WebSocket(url);
        this.setupSocketHandlers();
    }

    // callback functions for websocket events
    private setupSocketHandlers() {
        this.websocket.onopen = () => {
            console.log("Connected to the server")
        }
        
        this.websocket.onmessage = (event) => {
            const message: WsMessage = JSON.parse(event.data)
            console.log(message)
        }
        
        this.websocket.onclose = () => {
            this.websocket.close()
            console.log("Disconnected from the server")
        }
        
        this.websocket.onerror = (error) => {
            console.log(error)
            this.websocket.close()
        }
    }

    // publish data to all clients (ex: frontend ui, hmd, etc) by calling specific callback functions
    // TODO: need to implement callback logic for each client on the frontend
    public publish_all(message: WsMessage, data: any, callback: (data: any) => void) {
        const handlers = this.messageHandlers.get(message.type) || []

        if (!handlers || handlers.length === 0) {
            console.log(`No handlers for message type: ${message.type}`)
            return;
        }
        try {
            handlers.forEach(handler => handler(data)) // attach callback function to data
        } catch (error) {
            console.error(`Error publishing message: ${message.type}`, error)
        }
    }

    // subscribe to a message type
    public subscribe(message: WsMessage, callback: (data: any) => void) {
        const handlers = this.messageHandlers.get(message.type) || [] // get callbacks for a msg type
        handlers.push(callback) // push to a new callback array
        this.messageHandlers.set(message.type, handlers) // set new array to msg type
    }

    // send message to server
    public send(type: string, data: any) {
        const message: WsMessage = {
            type,
            data,
            success: true
        };
        this.websocket.send(JSON.stringify(message));
    }
}

// singleton instance
export const wsManager = new WebSocketManager();