import { TSS_CONFIG as imported_TSS_CONFIG } from "./types";

export const TSS_CONFIG = imported_TSS_CONFIG;

export const POLLING_INTERVAL_MS = 3000;
export const TEAM_INDEX = 0; // Default team index

// Ensure TSS_CONFIG and its properties are defined, providing defaults if necessary
export const tssIp = TSS_CONFIG?.IP ?? "192.168.51.110";
export const tssPort = TSS_CONFIG?.PORT ?? 14141;

export const TSS_BASE_URL = `http://${tssIp}:${tssPort}`;

export const ENDPOINTS = [
  "/json_data/UIA.json",
  "/json_data/DCU.json",
  "/json_data/IMU.json",
  "/json_data/ROVER.json",
  "/json_data/SPEC.json",
  "/json_data/COMM.json",
  "/json_data/ERROR.json",
  `/json_data/teams/${TEAM_INDEX}/EVA.json`,
  `/json_data/teams/${TEAM_INDEX}/TELEMETRY.json`,
  `/json_data/teams/${TEAM_INDEX}/ROVER_TELEMETRY.json`,
];

export const DEFAULT_ROCK_NAMES: Record<number, string> = {
  0: "default_rock",
  1: "mare_basalt",
  2: "vesicular_basalt",
  3: "olivine_basalt_1",
  4: "feldspathic_basalt",
  5: "pigeonite_basalt",
  6: "olivine_basalt_2",
  7: "ilmenite_basalt",
  8: "ilmenite_basalt",
  9: "ilmenite_basalt",
  10: "brecia_granite",
  11: "kreep_breccia",
  12: "ancient_regolith_breccia",
  13: "vitric_matrix_breccia",
  14: "ilmenite_basalt",
};

// Rate limiter for different data types
export type DataTypeKey =
  | "IMU"
  | "ROCK"
  | "DCU"
  | "UIA"
  | "BIOMETRICS"
  | "EVA_TELEMETRY";

export const PUBLISH_INTERVALS: Record<DataTypeKey, number> = {
  IMU: 1000, // IMU data: once per second
  ROCK: 2000, // Rock data: once every 2 seconds
  DCU: 1000, // DCU data: once per second
  UIA: 1000, // UIA data: once per second
  BIOMETRICS: 2000, // Biometrics: once every 2 seconds
  EVA_TELEMETRY: 2000, // EVA Telemetry: once every 2 seconds
};
