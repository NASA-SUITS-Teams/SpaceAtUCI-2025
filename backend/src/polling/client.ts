import {
  TSS_CONFIG,
  POLLING_INTERVAL_MS,
  TEAM_INDEX,
  TSS_BASE_URL,
  ENDPOINTS,
} from "./pollingConstants";
import {
  handleAndPublishUiaData,
  handleAndPublishDcuData,
  handleAndPublishImuData,
  handleAndPublishSpecData,
  handleAndPublishEvaAndBiometricsData,
} from "./dataHandlers";

// Attempt to import wsManager and schemas, paths might need adjustment
// import { wsManager } from "../ws/manager"; // No longer needed here, moved to dataHandlers.ts
// import { RockData, EvaTelemetryPayload } from "../ws/schema"; // No longer needed here, moved to dataHandlers.ts

// const POLLING_INTERVAL_MS = 3000; // Moved to pollingConstants.ts
// const TEAM_INDEX = 0; // Moved to pollingConstants.ts

// // Ensure TSS_CONFIG and its properties are defined, providing defaults if necessary
// const tssIp = TSS_CONFIG?.IP ?? "127.0.0.1"; // Moved to pollingConstants.ts
// const tssPort = TSS_CONFIG?.PORT ?? 14141; // Moved to pollingConstants.ts

// const TSS_BASE_URL = `http://${tssIp}:${tssPort}`; // Moved to pollingConstants.ts

// const ENDPOINTS = [ // Moved to pollingConstants.ts
//   "/json_data/UIA.json",
//   "/json_data/DCU.json",
//   "/json_data/IMU.json",
//   "/json_data/ROVER.json",
//   "/json_data/SPEC.json",
//   "/json_data/COMM.json",
//   "/json_data/ERROR.json",
//   `/json_data/teams/${TEAM_INDEX}/EVA.json`,
//   `/json_data/teams/${TEAM_INDEX}/TELEMETRY.json`,
//   `/json_data/teams/${TEAM_INDEX}/ROVER_TELEMETRY.json`,
// ];

// const DEFAULT_ROCK_NAMES: Record<number, string> = { // Moved to pollingConstants.ts
//   0: "default_rock",
//   1: "mare_basalt",
//   2: "vesicular_basalt",
//   3: "olivine_basalt_1",
//   4: "feldspathic_basalt",
//   5: "pigeonite_basalt",
//   6: "olivine_basalt_2",
//   7: "ilmenite_basalt",
//   8: "ilmenite_basalt", // Note: Duplicate entries in original client.ts
//   9: "ilmenite_basalt", // Note: Duplicate entries in original client.ts
//   10: "brecia_granite",
//   11: "kreep_breccia",
//   12: "ancient_regolith_breccia",
//   13: "vitric_matrix_breccia",
//   14: "ilmenite_basalt",
// };

// --- START: WebSocket Publishing Infrastructure (from old client.ts) --- // Moved to rateLimiter.ts and pollingConstants.ts
// Rate limiter for different data types
// type DataTypeKey = // Moved to pollingConstants.ts
//   | "IMU"
//   | "ROCK"
//   | "DCU"
//   | "UIA"
//   | "BIOMETRICS"
//   | "EVA_TELEMETRY";

// const PUBLISH_INTERVALS: Record<DataTypeKey, number> = { // Moved to pollingConstants.ts
//   IMU: 1000, // IMU data: once per second
//   ROCK: 2000, // Rock data: once every 2 seconds
//   DCU: 1000, // DCU data: once per second
//   UIA: 1000, // UIA data: once per second
//   BIOMETRICS: 2000, // Biometrics: once every 2 seconds
//   EVA_TELEMETRY: 2000, // EVA Telemetry: once every 2 seconds
// };

// // Last publish timestamps
// const lastPublishTimes: Record<DataTypeKey, number> = { // Moved to rateLimiter.ts
//   IMU: 0,
//   ROCK: 0,
//   DCU: 0,
//   UIA: 0,
//   BIOMETRICS: 0,
//   EVA_TELEMETRY: 0,
// };

// // Helper function to check rate limiting
// function shouldPublish(dataType: DataTypeKey): boolean { // Moved to rateLimiter.ts
//   const currentTime = Date.now();
//   const interval = PUBLISH_INTERVALS[dataType];
//   const lastTime = lastPublishTimes[dataType];

//   if (currentTime - lastTime >= interval) {
//     lastPublishTimes[dataType] = currentTime;
//     return true;
//   }
//   return false;
// }
// --- END: WebSocket Publishing Infrastructure ---

async function fetchData(endpoint: string): Promise<any> {
  const url = `${TSS_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        `Error fetching ${url}: ${response.status} ${response.statusText}`
      );
      return null;
    }
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Network error fetching ${url}:`, errorMessage);
    return null;
  }
}

function logRecursive(obj: any, prefix = "") {
  if (typeof obj !== "object" || obj === null) {
    console.log(`${prefix}: ${obj}`);
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null) {
        logRecursive(obj[key], newPrefix);
      } else {
        console.log(`${newPrefix}: ${obj[key]}`);
      }
    }
  }
}

async function pollAllData() {
  // console.log(`Fetching all data from TSS at ${new Date().toISOString()}`); // Reduce console noise
  const allData: Record<string, any> = {};

  const promises = ENDPOINTS.map(async (endpoint) => {
    const data = await fetchData(endpoint);
    const key = endpoint
      .replace("/json_data/", "")
      .replace(".json", "")
      .replace(`teams/${TEAM_INDEX}/`, `team${TEAM_INDEX}_`);
    if (data) {
      allData[key] = data;
    }
  });

  await Promise.all(promises);

  if (Object.keys(allData).length > 0) {
    if (allData.UIA) {
      // console.log("--- UIA Data (Recursive from HTTP) ---");
      // logRecursive(allData.UIA);
      handleAndPublishUiaData(allData.UIA);
    }
    if (allData.DCU) {
      // console.log("--- DCU Data (Recursive from HTTP) ---");
      // logRecursive(allData.DCU);
      handleAndPublishDcuData(allData.DCU);
    }
    if (allData.IMU) {
      handleAndPublishImuData(allData.IMU);
    }
    if (allData.SPEC) {
      handleAndPublishSpecData(allData.SPEC);
    }
    if (allData[`team${TEAM_INDEX}_TELEMETRY`]) {
      handleAndPublishEvaAndBiometricsData(
        allData[`team${TEAM_INDEX}_TELEMETRY`]
      );
    }
  } else {
    // console.log("No data fetched from TSS."); // Reduce console noise
  }
}

export class PollingClient {
  private pollingIntervalId: ReturnType<typeof setInterval> | null = null;
  private isPolling: boolean = false;

  constructor() {
    if (!TSS_CONFIG || !TSS_CONFIG.IP || !TSS_CONFIG.PORT) {
      console.warn(
        "TSS_CONFIG is not properly defined in types.ts. Please ensure IP and PORT are set."
      );
      console.warn(
        `Using default TSS address: ${TSS_BASE_URL} based on potentially missing TSS_CONFIG.`
      );
    }
    console.log(`PollingClient initialized for TSS at: ${TSS_BASE_URL}`);
  }

  public start(): void {
    if (this.isPolling) {
      console.log("Polling is already active.");
      return;
    }
    this.isPolling = true;
    console.log(`Starting TSS HTTP Polling to: ${TSS_BASE_URL}`);
    console.log(`Polling interval: ${POLLING_INTERVAL_MS / 1000} seconds`);

    // Initial fetch
    pollAllData();

    // Set up interval
    this.pollingIntervalId = setInterval(pollAllData, POLLING_INTERVAL_MS);
    console.log("Polling started.");
  }

  public stop(): void {
    if (!this.isPolling || !this.pollingIntervalId) {
      console.log("Polling is not active or already stopped.");
      return;
    }
    clearInterval(this.pollingIntervalId);
    this.pollingIntervalId = null;
    this.isPolling = false;
    console.log("Polling stopped.");
  }
}

// Removed automatic startPolling() call and export {};
