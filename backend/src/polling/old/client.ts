import * as dgram from "dgram";
import {
  HighFrequencyData,
  LowFrequencyData,
  TelemetryData,
  DataType,
  DataTypeMap,
  PollingRate,
  POLLING_RATES,
  DATA_TYPES,
  TSS_CONFIG,
} from "../types";
import { wsManager } from "../../ws/manager";
import { RockData, EvaTelemetryPayload } from "../../ws/schema";
import { COMMAND_MAP } from "../commandMap";

const DEFAULT_ROCK_NAMES: Record<number, string> = {
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
type DataTypeKey =
  | "IMU"
  | "ROCK"
  | "DCU"
  | "UIA"
  | "BIOMETRICS"
  | "EVA_TELEMETRY";

const PUBLISH_INTERVALS: Record<DataTypeKey, number> = {
  IMU: 1000, // IMU data: once per second
  ROCK: 2000, // Rock data: once every 2 seconds
  DCU: 1000, // DCU data: once per second
  UIA: 1000, // UIA data: once per second
  BIOMETRICS: 2000, // Biometrics: once every 2 seconds
  EVA_TELEMETRY: 2000, // EVA Telemetry: once every 2 seconds
};

// Last publish timestamps
const lastPublishTimes: Record<DataTypeKey, number> = {
  IMU: 0,
  ROCK: 0,
  DCU: 0,
  UIA: 0,
  BIOMETRICS: 0,
  EVA_TELEMETRY: 0,
};

// Helper function to check rate limiting
function shouldPublish(dataType: DataTypeKey): boolean {
  const currentTime = Date.now();
  const interval = PUBLISH_INTERVALS[dataType];
  const lastTime = lastPublishTimes[dataType];

  if (currentTime - lastTime >= interval) {
    lastPublishTimes[dataType] = currentTime;
    return true;
  }
  return false;
}

// Rate limiter for IMU data (1 second)
const IMU_PUBLISH_INTERVAL = 1000; // 1 second in milliseconds
let lastImuPublishTime = 0;

/**
 * Fetches data from the TSS via UDP at regular intervals and sends to listeners
 */
export class PollingClient {
  private interval: PollingRate;
  private isPolling: boolean = false;
  private listeners: ((data: TelemetryData) => void)[] = []; // listens for data from tss
  private dataType: DataType; // high-frequency or low-frequency
  private socket: dgram.Socket;
  private messageQueue: {
    command: number;
    resolve: (value: number | null) => void;
    reject: (reason?: any) => void;
  }[] = [];
  private isProcessing: boolean = false;

  // initialize polling rate for each data type
  constructor(dataType: DataType) {
    this.dataType = dataType;

    this.interval =
      dataType === DATA_TYPES.HIGH_FREQUENCY
        ? POLLING_RATES.HIGH_FREQUENCY
        : POLLING_RATES.LOW_FREQUENCY;

    this.socket = dgram.createSocket("udp4");
    this.socket.on("error", (err) => {
      this.socket.close();
    });

    this.socket.on("message", (msg, rinfo) => {
      if (rinfo.address !== TSS_CONFIG.IP || rinfo.port !== TSS_CONFIG.PORT) {
        return;
      }
      this.handleResponseMessage(msg);
    });
  }

  // polling methods
  public start(): void {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  public stop(): void {
    this.isPolling = false;
  }

  // pull data from tss
  public addListener(callback: (data: TelemetryData) => void): void {
    this.listeners.push(callback);
  }

  // remove the callback function from all listeners
  public removeListener(callback: (data: TelemetryData) => void): void {
    this.listeners = this.listeners.filter((listener) => listener != callback);
  }

  // polling loop without returning a value
  private async poll(): Promise<void> {
    while (this.isPolling) {
      try {
        const data = await this.fetchData();
        if (data) {
          // Process data based on type
          if (this.dataType === DATA_TYPES.LOW_FREQUENCY) {
            this.handleLowFrequencyData(data as LowFrequencyData);
          } else if (this.dataType === DATA_TYPES.HIGH_FREQUENCY) {
            this.handleHighFrequencyData(data);
          }

          // Don't send raw data anymore - all data is now sent through specialized handlers
          // with rate limiting
        }
      } catch (error) {}

      await new Promise((resolve) => setTimeout(resolve, this.interval));
    }
  }

  private getCommandsForDataType(): number[] {
    if (this.dataType === DATA_TYPES.HIGH_FREQUENCY) {
      // All IMU, Rover Pos/QR (removing EVA1 DCU)
      return [
        17,
        18,
        19, // EVA1 IMU
        20,
        21,
        22, // EVA2 IMU
        23,
        24,
        25, // ROVER
      ];
    } else {
      // EVA1 DCU, EVA2 DCU, Errors, SPEC, UIA, Telemetry, EVA States
      const lowFreqCommands: number[] = [];
      for (let i = 2; i <= 16; i++) lowFreqCommands.push(i); // EVA1 DCU, EVA2 DCU, Errors
      for (let i = 26; i <= 118; i++) lowFreqCommands.push(i); // SPEC, UIA, TELEM, EVA
      // Removed PR Telemetry (119-166) and PR LIDAR (167)
      return lowFreqCommands;
    }
  }

  private async fetchData(): Promise<TelemetryData | null> {
    const commands = this.getCommandsForDataType();
    if (commands.length === 0) {
      return null;
    }

    const results: TelemetryData = {
      timestamp: Date.now(), // Use local timestamp for simplicity
      type: this.dataType,
    };

    const promises = commands.map((command) => this.sendUdpRequest(command));

    try {
      const values = await Promise.all(promises);
      commands.forEach((command, index) => {
        const fieldName = COMMAND_MAP[command];
        if (fieldName) {
          results[fieldName] = values[index];
        }
      });
      return results;
    } catch (error) {
      return null; // Return null or partial data if needed
    }
  }

  private sendUdpRequest(command: number): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const timestamp = Math.floor(Date.now() / 1000); // UNIX timestamp
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32BE(timestamp, 0);
      buffer.writeUInt32BE(command, 4);

      // Add to queue
      this.messageQueue.push({ command, resolve, reject });
      this.processQueue(); // Start processing if not already

      // Timeout for the request
      setTimeout(() => {
        // Remove from queue if still pending and reject
        const index = this.messageQueue.findIndex(
          (item) => item.command === command && item.resolve === resolve
        );
        if (index !== -1) {
          this.messageQueue.splice(index, 1);
          reject(
            new Error(`Timeout waiting for response for command ${command}`)
          );
        }
        this.isProcessing = this.messageQueue.length > 0; // Update processing state
      }, 2000); // 2-second timeout, adjust as needed
    });
  }

  private processQueue(): void {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }
    this.isProcessing = true;

    const { command } = this.messageQueue[0]; // Peek at the next message
    const timestamp = Math.floor(Date.now() / 1000);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(timestamp, 0);
    buffer.writeUInt32BE(command, 4);

    this.socket.send(
      new Uint8Array(buffer),
      0,
      buffer.length,
      TSS_CONFIG.PORT,
      TSS_CONFIG.IP,
      (err) => {
        if (err) {
          // Reject the corresponding promise and remove from queue
          const request = this.messageQueue.shift(); // Remove the failed request
          request?.reject(err);
          this.isProcessing = false; // Allow next message to be processed
          this.processQueue(); // Try processing next in queue
        }
      }
    );
  }

  private parseDataValue(msg: Buffer, command: number): number | null {
    try {
      // Handle LIDAR specific case (returns array, but we only take first value for now)
      if (command === 167) {
        if (msg.length >= 12) {
          // Need at least timestamp, command, and one float
          // TODO: Implement parsing for all 13 floats if needed
          return msg.readFloatBE(8); // Read only the first float
        } else {
          return null;
        }
      }

      // Determine expected data type based on command
      if (
        (command >= 2 && command <= 16) || // DCU, ERROR
        (command >= 48 && command <= 57) || // UIA
        command === 25 // Rover QR ID
      ) {
        // Integer Type Commands
        return msg.readInt32BE(8);
      } else if (
        (command >= 17 && command <= 24) || // IMU, ROVER (excluding QR ID)
        (command >= 27 && command <= 36) || // EVA1 SPEC Data
        (command >= 38 && command <= 47) || // EVA2 SPEC Data
        (command >= 58 && command <= 166) // TELEM, EVA States, PR TELEM
      ) {
        // Float Type Commands
        return msg.readFloatBE(8);
      } else if (command === 26 || command === 37) {
        // SPEC IDs (TSS sends as Float like 3.0, needs to be Int for map lookup)
        const floatVal = msg.readFloatBE(8);
        return floatVal !== null ? Math.round(floatVal) : null;
      } else {
        // Default or Unknown command - attempt float read
        return msg.readFloatBE(8);
      }
    } catch (e) {
      return null;
    }
  }

  private handleResponseMessage(msg: Buffer): void {
    const expectedLidarLength = 60; // 4(ts) + 4(cmd) + 13 * 4(floats)
    const minimumStandardLength = 12; // 4(ts) + 4(cmd) + 4(data)

    // Peek at command first
    let receivedCommand: number | null = null;
    if (msg.length >= 8) {
      receivedCommand = msg.readUInt32BE(4);
    } else {
      if (!this.isProcessing) {
        this.isProcessing = false;
        this.processQueue();
      }
      return;
    }

    // Validate length based on command
    // Note: LIDAR length check is approximate here as full parsing isn't done
    if (receivedCommand === 167 && msg.length < 12) {
      this.isProcessing = false;
      this.processQueue();
      return;
    } else if (receivedCommand !== 167 && msg.length < minimumStandardLength) {
      this.isProcessing = false;
      this.processQueue();
      return;
    }

    // Find corresponding request in the queue
    const requestIndex = this.messageQueue.findIndex(
      (item) => item.command === receivedCommand
    );

    if (requestIndex === -1) {
      this.isProcessing = false;
      this.processQueue();
      return;
    }

    // Dequeue before parsing
    const { resolve } = this.messageQueue.splice(requestIndex, 1)[0];

    // Parse data based on command
    const value = this.parseDataValue(msg, receivedCommand);

    // Resolve the promise for sendUdpRequest
    // Value can be null if parsing failed
    resolve(value);

    // Allow the next message in the queue to be sent
    this.isProcessing = false;
    this.processQueue();
  }

  private handleHighFrequencyData(data: TelemetryData) {
    // Process IMU data
    this.handleImuData(data);
  }

  private handleLowFrequencyData(data: LowFrequencyData) {
    // console.log(
    //   "Processing low frequency data:",
    //   JSON.stringify(data, null, 2)
    // );

    // Handle different types of data
    this.handleRockData(data);
    this.handleDcuData(data);
    this.handleUiaData(data);
    this.handleBiometricsData(data);
    this.handleEvaTelemetryData(data);
  }

  private handleImuData(data: TelemetryData) {
    // Skip if rate limited
    if (!shouldPublish("IMU")) return;

    // Check if it's time to publish IMU data (once per second)
    const currentTime = Date.now();
    if (currentTime - lastImuPublishTime < IMU_PUBLISH_INTERVAL) {
      return; // Skip if we haven't reached the publish interval
    }

    // Update last publish time
    lastImuPublishTime = currentTime;

    // Create EVA1 IMU data object
    const eva1ImuData = {
      evaId: 1,
      position: {
        x: data.eva1_imu_posx || 0,
        y: data.eva1_imu_posy || 0,
      },
      heading: data.eva1_imu_heading || 0,
    };

    // Create EVA2 IMU data object
    const eva2ImuData = {
      evaId: 2,
      position: {
        x: data.eva2_imu_posx || 0,
        y: data.eva2_imu_posy || 0,
      },
      heading: data.eva2_imu_heading || 0,
    };

    // Send combined IMU data
    const imuData = {
      eva1: eva1ImuData,
      eva2: eva2ImuData,
      timestamp: currentTime,
    };

    // console.log(
    //   "Sending IMU data (rate limited):",
    //   JSON.stringify(imuData, null, 2)
    // );
    wsManager.publish_all(
      { type: "imu_data", data: imuData, success: true },
      imuData
    );
  }

  private handleBiometricsData(data: LowFrequencyData) {
    // Skip if rate limited
    if (!shouldPublish("BIOMETRICS")) return;

    // Create EVA1 biometrics data
    const eva1BiometricsData = {
      evaId: 1,
      heartRate: data.eva1_heart_rate || 0,
      temperature: data.eva1_temperature || 0,
      o2Consumption: data.eva1_oxy_consumption || 0,
      co2Production: data.eva1_co2_production || 0,
      suitPressureTotal: data.eva1_suit_pressure_total || 0,
      helmetCo2: data.eva1_helmet_pressure_co2 || 0,
    };

    // Create EVA2 biometrics data
    const eva2BiometricsData = {
      evaId: 2,
      heartRate: data.eva2_heart_rate || 0,
      temperature: data.eva2_temperature || 0,
      o2Consumption: data.eva2_oxy_consumption || 0,
      co2Production: data.eva2_co2_production || 0,
      suitPressureTotal: data.eva2_suit_pressure_total || 0,
      helmetCo2: data.eva2_helmet_pressure_co2 || 0,
    };

    // Send biometrics data for EVA1 if available
    if (
      data.eva1_heart_rate !== undefined ||
      data.eva1_temperature !== undefined
    ) {
      // console.log(
      //   "Sending EVA1 biometrics data (rate limited):",
      //   JSON.stringify(eva1BiometricsData, null, 2)
      // );
      wsManager.publish_all(
        { type: "biometrics_data", data: eva1BiometricsData, success: true },
        eva1BiometricsData
      );
    }

    // Send biometrics data for EVA2 if available
    if (
      data.eva2_heart_rate !== undefined ||
      data.eva2_temperature !== undefined
    ) {
      // console.log(
      //   "Sending EVA2 biometrics data (rate limited):",
      //   JSON.stringify(eva2BiometricsData, null, 2)
      // );
      wsManager.publish_all(
        { type: "biometrics_data", data: eva2BiometricsData, success: true },
        eva2BiometricsData
      );
    }
  }

  private handleRockData(data: LowFrequencyData) {
    // Skip if rate limited
    if (!shouldPublish("ROCK")) return;

    // Handle rock data for EVA 1
    if (data.eva1_spec_id !== undefined) {
      const specId = data.eva1_spec_id; // Correctly parsed and rounded ID
      const rockName = DEFAULT_ROCK_NAMES[specId] || `unknown_rock_${specId}`;

      // Build composition directly from telemetry data using new field names
      const eva1Composition: { [key: string]: number } = {};
      if (data.eva1_sio2 !== undefined)
        eva1Composition["SiO2"] = data.eva1_sio2;
      if (data.eva1_al2o3 !== undefined)
        eva1Composition["Al2O3"] = data.eva1_al2o3;
      if (data.eva1_mno !== undefined) eva1Composition["MnO"] = data.eva1_mno;
      if (data.eva1_cao !== undefined) eva1Composition["CaO"] = data.eva1_cao;
      if (data.eva1_p2o3 !== undefined)
        eva1Composition["P2O3"] = data.eva1_p2o3;
      if (data.eva1_tio2 !== undefined)
        eva1Composition["TiO2"] = data.eva1_tio2;
      if (data.eva1_feo !== undefined) eva1Composition["FeO"] = data.eva1_feo;
      if (data.eva1_mgo !== undefined) eva1Composition["MgO"] = data.eva1_mgo;
      if (data.eva1_k2o !== undefined) eva1Composition["K2O"] = data.eva1_k2o;
      if (data.eva1_rock_other !== undefined)
        eva1Composition["Other"] = data.eva1_rock_other;

      const eva1RockData: RockData = {
        evaId: 1,
        specId: specId,
        name: rockName,
        composition: eva1Composition,
      };
      console.log(
        "Sending EVA 1 rock data (composition from telemetry):",
        JSON.stringify(eva1RockData, null, 2)
      );
      wsManager.publish_all(
        { type: "rock_data", data: eva1RockData, success: true },
        eva1RockData
      );
    }

    // Handle rock data for EVA 2
    if (data.eva2_spec_id !== undefined) {
      const specId = data.eva2_spec_id; // Correctly parsed and rounded ID
      const rockName = DEFAULT_ROCK_NAMES[specId] || `unknown_rock_${specId}`;

      // Build composition directly from telemetry data using new field names
      const eva2Composition: { [key: string]: number } = {};
      if (data.eva2_sio2 !== undefined)
        eva2Composition["SiO2"] = data.eva2_sio2;
      if (data.eva2_al2o3 !== undefined)
        eva2Composition["Al2O3"] = data.eva2_al2o3;
      if (data.eva2_mno !== undefined) eva2Composition["MnO"] = data.eva2_mno;
      if (data.eva2_cao !== undefined) eva2Composition["CaO"] = data.eva2_cao;
      if (data.eva2_p2o3 !== undefined)
        eva2Composition["P2O3"] = data.eva2_p2o3;
      if (data.eva2_tio2 !== undefined)
        eva2Composition["TiO2"] = data.eva2_tio2;
      if (data.eva2_feo !== undefined) eva2Composition["FeO"] = data.eva2_feo;
      if (data.eva2_mgo !== undefined) eva2Composition["MgO"] = data.eva2_mgo;
      if (data.eva2_k2o !== undefined) eva2Composition["K2O"] = data.eva2_k2o;
      if (data.eva2_rock_other !== undefined)
        eva2Composition["Other"] = data.eva2_rock_other;

      const eva2RockData: RockData = {
        evaId: 2,
        specId: specId,
        name: rockName,
        composition: eva2Composition,
      };
      console.log(
        "Sending EVA 2 rock data (composition from telemetry):",
        JSON.stringify(eva2RockData, null, 2)
      );
      wsManager.publish_all(
        { type: "rock_data", data: eva2RockData, success: true },
        eva2RockData
      );
    }
  }

  private handleDcuData(data: TelemetryData) {
    // Skip if rate limited
    if (!shouldPublish("DCU")) return;

    // Log raw DCU field values to debug the issue
    // console.log("Raw DCU data from TSS:", {
    //   eva1_batt: data.eva1_batt,
    //   eva1_oxy: data.eva1_oxy,
    //   eva1_comm: data.eva1_comm,
    //   eva1_fan: data.eva1_fan,
    //   eva1_pump: data.eva1_pump,
    //   eva1_co2: data.eva1_co2,
    //   eva2_batt: data.eva2_batt,
    //   eva2_oxy: data.eva2_oxy,
    //   eva2_comm: data.eva2_comm,
    //   eva2_fan: data.eva2_fan,
    //   eva2_pump: data.eva2_pump,
    //   eva2_co2: data.eva2_co2,
    // });

    // Extract DCU data for EVA1
    const eva1DcuData = {
      evaId: 1,
      battery: data.eva1_batt || 0,
      oxygen: data.eva1_oxy || 0,
      comm: data.eva1_comm || 0,
      fan: data.eva1_fan || 0,
      pump: data.eva1_pump || 0,
      co2: data.eva1_co2 || 0,
    };

    // Always send DCU data for EVA1
    // console.log(
    //   "Sending EVA1 DCU data (rate limited):",
    //   JSON.stringify(eva1DcuData, null, 2)
    // );
    wsManager.publish_all(
      { type: "dcu_data", data: eva1DcuData, success: true },
      eva1DcuData
    );

    // Extract DCU data for EVA2
    const eva2DcuData = {
      evaId: 2,
      battery: data.eva2_batt || 0,
      oxygen: data.eva2_oxy || 0,
      comm: data.eva2_comm || 0,
      fan: data.eva2_fan || 0,
      pump: data.eva2_pump || 0,
      co2: data.eva2_co2 || 0,
    };

    // Always send DCU data for EVA2
    // console.log(
    //   "Sending EVA2 DCU data (rate limited):",
    //   JSON.stringify(eva2DcuData, null, 2)
    // );
    wsManager.publish_all(
      { type: "dcu_data", data: eva2DcuData, success: true },
      eva2DcuData
    );
  }

  private handleUiaData(data: LowFrequencyData) {
    // Skip if rate limited
    if (!shouldPublish("UIA")) return;

    // Extract UIA data
    const uiaData = {
      emu1_power: data.uia_emu1_power || 0,
      ev1_supply: data.uia_ev1_supply || 0,
      ev1_waste: data.uia_ev1_waste || 0,
      ev1_oxygen: data.uia_ev1_oxygen || 0,
      emu2_power: data.uia_emu2_power || 0,
      ev2_supply: data.uia_ev2_supply || 0,
      ev2_waste: data.uia_ev2_waste || 0,
      ev2_oxygen: data.uia_ev2_oxygen || 0,
      o2_vent: data.uia_o2_vent || 0,
      depress_pump: data.uia_depress_pump || 0,
    };

    // console.log(
    //   "Sending UIA data (rate limited):",
    //   JSON.stringify(uiaData, null, 2)
    // );
    wsManager.publish_all(
      { type: "uia_data", data: uiaData, success: true },
      uiaData
    );
  }

  private handleEvaTelemetryData(data: LowFrequencyData) {
    // Skip if rate limited
    if (!shouldPublish("EVA_TELEMETRY")) return;

    // Construct EVA1 Telemetry Payload using UI-centric field names from LowFrequencyData
    const eva1Telemetry: EvaTelemetryPayload = {
      evaId: 1,
      evaTime: data.eva_time, // UI: EVA Time (Cmd 63)
      o2TimeLeft: data.eva1_ui_o2_time_left, // UI: O2 Time Left (Cmd 83)
      oxygenPrimaryStorage: data.eva1_placeholder_cmd66, // UI: Primary O2 Storage (24%) - data.eva1_placeholder_cmd66 (Cmd 66) is placeholder. No direct match for 24%.
      oxygenSecondaryStorage: data.eva1_placeholder_cmd66, // UI: Secondary O2 Storage (15%) - data.eva1_placeholder_cmd66 (Cmd 66) is placeholder. No direct match for 15%.
      oxygenPrimaryPressure: data.eva1_ui_pri_o2_pressure, // UI: Primary O2 Pressure (Cmd 67)
      oxygenSecondaryPressure: data.eva1_placeholder_cmd82, // UI: Secondary O2 Pressure (0.00 psi) - data.eva1_placeholder_cmd82 (Cmd 82) is placeholder. No direct match for 0.
      suitPressureOxygen: data.eva1_ui_suit_o2_pressure, // UI: Suit O2 Pressure (Cmd 68)
      suitPressureCO2: data.eva1_ui_suit_co2_pressure, // UI: Suit CO2 Pressure (Cmd 69)
      suitPressureOther: data.eva1_ui_suit_other_pressure, // UI: Suit Other Pressure (Cmd 70)
      suitPressureTotal: data.eva1_ui_suit_total_pressure, // UI: Suit Total Pressure (Cmd 71)
      scrubberAPressure: data.eva1_ui_scrubber_a_pressure, // UI: Scrubber A Pressure (Cmd 80)
      scrubberBPressure: data.eva1_ui_scrubber_b_pressure, // UI: Scrubber B Pressure (Cmd 81)
      h2oGasPressure: data.eva1_ui_h2o_gas_pressure, // UI: H2O Gas Pressure (Cmd 84)
      h2oLiquidPressure: data.eva1_ui_h2o_liquid_pressure, // UI: H2O Liquid Pressure (Cmd 85)
      oxygenConsumption: data.eva1_ui_o2_consumption, // UI: O2 Consumption (Cmd 73)
      co2Production: data.eva1_ui_co2_production, // UI: CO2 Production (Cmd 74)
      primaryFanRPM: data.eva1_ui_fan_pri_rpm, // UI: Primary Fan RPM (Cmd 75)
      secondaryFanRPM: data.eva1_ui_fan_sec_rpm, // UI: Secondary Fan RPM (Cmd 76)
      helmetCO2Pressure: data.eva1_ui_helmet_co2_pressure, // UI: Helmet CO2 Pressure (Cmd 72)
      heartRate: data.eva1_ui_heart_rate, // UI: Heart Rate (Cmd 65)
      temperature: data.eva1_ui_temperature, // UI: Temperature (Cmd 77)
      coolantLevel: data.eva1_ui_coolant_ml, // UI: Coolant ml (Cmd 78)
    };

    // Construct EVA2 Telemetry Payload using UI-centric field names from LowFrequencyData
    const eva2Telemetry: EvaTelemetryPayload = {
      evaId: 2,
      evaTime: data.eva_time, // UI: EVA Time (Cmd 63)
      o2TimeLeft: data.eva2_ui_o2_time_left, // UI: O2 Time Left (Cmd 105)
      oxygenPrimaryStorage: data.eva2_placeholder_cmd88, // Placeholder
      oxygenSecondaryStorage: data.eva2_placeholder_cmd88, // Placeholder
      oxygenPrimaryPressure: data.eva2_ui_pri_o2_pressure, // UI: Primary O2 Pressure (Cmd 89)
      oxygenSecondaryPressure: data.eva2_placeholder_cmd104, // Placeholder
      suitPressureOxygen: data.eva2_ui_suit_o2_pressure, // UI: Suit O2 Pressure (Cmd 90)
      suitPressureCO2: data.eva2_ui_suit_co2_pressure, // UI: Suit CO2 Pressure (Cmd 91)
      suitPressureOther: data.eva2_ui_suit_other_pressure, // UI: Suit Other Pressure (Cmd 92)
      suitPressureTotal: data.eva2_ui_suit_total_pressure, // UI: Suit Total Pressure (Cmd 93)
      scrubberAPressure: data.eva2_ui_scrubber_a_pressure, // UI: Scrubber A Pressure (Cmd 102)
      scrubberBPressure: data.eva2_ui_scrubber_b_pressure, // UI: Scrubber B Pressure (Cmd 103)
      h2oGasPressure: data.eva2_ui_h2o_gas_pressure, // UI: H2O Gas Pressure (Cmd 106)
      h2oLiquidPressure: data.eva2_ui_h2o_liquid_pressure, // UI: H2O Liquid Pressure (Cmd 107)
      oxygenConsumption: data.eva2_ui_o2_consumption, // UI: O2 Consumption (Cmd 95)
      co2Production: data.eva2_ui_co2_production, // UI: CO2 Production (Cmd 96)
      primaryFanRPM: data.eva2_ui_fan_pri_rpm, // UI: Primary Fan RPM (Cmd 97)
      secondaryFanRPM: data.eva2_ui_fan_sec_rpm, // UI: Secondary Fan RPM (Cmd 98)
      helmetCO2Pressure: data.eva2_ui_helmet_co2_pressure, // UI: Helmet CO2 Pressure (Cmd 94)
      heartRate: data.eva2_ui_heart_rate, // UI: Heart Rate (Cmd 87)
      temperature: data.eva2_ui_temperature, // UI: Temperature (Cmd 99)
      coolantLevel: data.eva2_ui_coolant_ml, // UI: Coolant ml (Cmd 100)
    };

    // Send EVA1 Telemetry data
    console.log(
      "Sending EVA1 Telemetry data (rate limited):",
      JSON.stringify(eva1Telemetry, null, 2)
    );
    wsManager.publish_all(
      { type: "eva_telemetry_data", data: eva1Telemetry, success: true },
      eva1Telemetry
    );

    // Send EVA2 Telemetry data
    console.log(
      "Sending EVA2 Telemetry data (rate limited):",
      JSON.stringify(eva2Telemetry, null, 2)
    );
    wsManager.publish_all(
      { type: "eva_telemetry_data", data: eva2Telemetry, success: true },
      eva2Telemetry
    );
  }
}
