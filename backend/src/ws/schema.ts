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

export type SingleEvaTelemetryData = {
  o2TimeLeft?: number;
  oxygenPrimaryStorage?: number;
  oxygenSecondaryStorage?: number;
  oxygenPrimaryPressure?: number;
  oxygenSecondaryPressure?: number;
  suitPressureOxygen?: number;
  suitPressureCO2?: number;
  suitPressureOther?: number;
  suitPressureTotal?: number;
  scrubberAPressure?: number;
  scrubberBPressure?: number;
  h2oGasPressure?: number;
  h2oLiquidPressure?: number;
  oxygenConsumption?: number;
  co2Production?: number;
  primaryFanRPM?: number;
  secondaryFanRPM?: number;
  helmetCO2Pressure?: number;
  heartRate?: number;
  temperature?: number;
  coolantLevel?: number;
  batteryTimeLeft?: number;
};

export type CombinedEvaTelemetryPayload = {
  evaTime?: number;
  timestamp: number;
  eva1?: SingleEvaTelemetryData;
  eva2?: SingleEvaTelemetryData;
};
