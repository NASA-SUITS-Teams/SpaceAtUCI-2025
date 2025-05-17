import { ServerWebSocket } from "bun";

export type WsMessage = {
  type: string;
  data: any;
  success: boolean;
  error?: {
    message: string;
    code: number;
    details?: Record<string, unknown>;
  };
};

export function sendMessage(
  ws: ServerWebSocket,
  type: string,
  data: any,
  success: boolean = true,
  error?: {
    message: string;
    code: number;
    details?: Record<string, unknown>;
  }
) {
  const message: WsMessage = {
    type,
    data,
    success,
    ...(error ? { error } : {}),
  };
  ws.send(JSON.stringify(message));
}

export function sendError(
  ws: ServerWebSocket,
  type: string,
  data: any,
  message: string,
  code: number = 0,
  details?: Record<string, unknown>
) {
  sendMessage(ws, type, data, false, { message, code, details });
}

export type RockData = {
  evaId: number;
  specId: number;
  name: string;
  composition: { [key: string]: number };
};
