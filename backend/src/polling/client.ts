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
} from "./types";
import { wsManager } from "../ws/manager";
import { RockData } from "../ws/schema";

// Command number to data field mapping based on TSS README
const COMMAND_MAP: { [key: number]: string } = {
  // EVA1 DCU (Commands 2-7)
  2: "eva1_batt", // SUIT BATT / UMBILICAL POWER
  3: "eva1_oxy", // PRI TANK / SEC TANK
  4: "eva1_comm", // Channel A / Channel B
  5: "eva1_fan", // PRI FAN / SEC FAN
  6: "eva1_pump", // OPEN / CLOSED
  7: "eva1_co2", // Scrubber A / Scrubber B
  // EVA2 DCU (Commands 8-13)
  8: "eva2_batt",
  9: "eva2_oxy",
  10: "eva2_comm",
  11: "eva2_fan",
  12: "eva2_pump",
  13: "eva2_co2",
  // Error States (Commands 14-16) - Names assumed based on UI
  14: "o2_error",
  15: "pump_error",
  16: "fan_error",
  // EVA1 IMU (Commands 17-19)
  17: "eva1_imu_posx",
  18: "eva1_imu_posy",
  19: "eva1_imu_heading",
  // EVA2 IMU (Commands 20-22)
  20: "eva2_imu_posx",
  21: "eva2_imu_posy",
  22: "eva2_imu_heading",
  // ROVER (Commands 23-25)
  23: "rover_posx",
  24: "rover_posy",
  25: "rover_qr_id",
  // EVA 1 SPEC (Commands 26-36, excluding 'name') - Names are generic
  26: "eva1_spec_id", // SPEC ID
  27: "eva1_spec_oxy", // Example: Assuming first data point relates to Oxygen
  28: "eva1_spec_water", // Example: Assuming second data point relates to Water
  29: "eva1_spec_co2",
  30: "eva1_spec_h2",
  31: "eva1_spec_n2",
  32: "eva1_spec_other", // Generic names for remaining SPEC data
  33: "eva1_spec_temp",
  34: "eva1_spec_pres",
  35: "eva1_spec_humid",
  36: "eva1_spec_light", // Last SPEC data point
  // EVA 2 SPEC (Commands 37-47, excluding 'name') - Names are generic
  37: "eva2_spec_id", // SPEC ID
  38: "eva2_spec_oxy",
  39: "eva2_spec_water",
  40: "eva2_spec_co2",
  41: "eva2_spec_h2",
  42: "eva2_spec_n2",
  43: "eva2_spec_other",
  44: "eva2_spec_temp",
  45: "eva2_spec_pres",
  46: "eva2_spec_humid",
  47: "eva2_spec_light",
  // UIA (Commands 48-57)
  48: "uia_emu1_power", // ON / OFF
  49: "uia_ev1_supply", // OPEN / CLOSED
  50: "uia_ev1_waste", // OPEN / CLOSED
  51: "uia_ev1_oxygen", // OPEN / CLOSED
  52: "uia_emu2_power", // ON / OFF
  53: "uia_ev2_supply", // OPEN / CLOSED
  54: "uia_ev2_waste", // OPEN / CLOSED
  55: "uia_ev2_oxygen", // OPEN / CLOSED
  56: "uia_o2_vent", // OPEN / CLOSED
  57: "uia_depress_pump", // ON / OFF
  // TELEMETRY / EVA (Commands 58-118) - Ignoring team number dependency for now
  58: "eva_time", // Current EVA time
  // EVA1 Telemetry (Commands 59-80) - Names based on UI screenshot where possible
  59: "eva1_batt_time_left", // Primary O2 Storage / O2 Time Left? - Name Uncertain
  60: "eva1_oxy_pri_storage", // Primary O2 Storage
  61: "eva1_oxy_sec_storage", // Secondary O2 Storage
  62: "eva1_oxy_pri_pressure", // Primary O2 Pressure
  63: "eva1_oxy_sec_pressure", // Secondary O2 Pressure
  64: "eva1_suit_pressure_oxy", // Suit O2 Pressure
  65: "eva1_suit_pressure_co2", // Suit CO2 Pressure
  66: "eva1_suit_pressure_other", // Suit Other Pressure
  67: "eva1_suit_pressure_total", // Suit Total Pressure
  68: "eva1_scrubber_a_pressure", // Scrubber A Pressure
  69: "eva1_scrubber_b_pressure", // Scrubber B Pressure
  70: "eva1_h2o_gas_pressure", // H2O Gas Pressure
  71: "eva1_h2o_liquid_pressure", // H2O Liquid Pressure
  72: "eva1_oxy_consumption", // O2 Consumption
  73: "eva1_co2_production", // CO2 Production
  74: "eva1_fan_pri_rpm", // Primary Fan RPM
  75: "eva1_fan_sec_rpm", // Secondary Fan RPM
  76: "eva1_helmet_pressure_co2", // Helmet CO2 Pressure
  77: "eva1_heart_rate", // Heart Rate
  78: "eva1_temperature", // Temperature
  79: "eva1_coolant_gas_pressure", // Coolant (Gas Pressure?) - Name Uncertain
  80: "eva1_coolant_liquid_pressure", // Coolant (Liquid Pressure?) - Name Uncertain
  // EVA2 Telemetry (Commands 81-102) - Names based on UI screenshot where possible
  81: "eva2_batt_time_left",
  82: "eva2_oxy_pri_storage",
  83: "eva2_oxy_sec_storage",
  84: "eva2_oxy_pri_pressure",
  85: "eva2_oxy_sec_pressure",
  86: "eva2_suit_pressure_oxy",
  87: "eva2_suit_pressure_co2",
  88: "eva2_suit_pressure_other",
  89: "eva2_suit_pressure_total",
  90: "eva2_scrubber_a_pressure",
  91: "eva2_scrubber_b_pressure",
  92: "eva2_h2o_gas_pressure",
  93: "eva2_h2o_liquid_pressure",
  94: "eva2_oxy_consumption",
  95: "eva2_co2_production",
  96: "eva2_fan_pri_rpm",
  97: "eva2_fan_sec_rpm",
  98: "eva2_helmet_pressure_co2",
  99: "eva2_heart_rate",
  100: "eva2_temperature",
  101: "eva2_coolant_gas_pressure", // Name Uncertain
  102: "eva2_coolant_liquid_pressure", // Name Uncertain
  // Generic EVA States (Commands 103-118) - Names are generic placeholders
  103: "eva_state_103",
  104: "eva_state_104",
  105: "eva_state_105",
  106: "eva_state_106",
  107: "eva_state_107",
  108: "eva_state_108",
  109: "eva_state_109",
  110: "eva_state_110",
  111: "eva_state_111",
  112: "eva_state_112",
  113: "eva_state_113",
  114: "eva_state_114",
  115: "eva_state_115",
  116: "eva_state_116",
  117: "eva_state_117",
  118: "eva_state_118",
  // Pressurized Rover Telemetry (Commands 119-166) - Names are generic placeholders
  119: "pr_telemetry_119",
  120: "pr_telemetry_120",
  // ... continuing pattern ...
  166: "pr_telemetry_166",
  // Pressurized Rover LIDAR (Command 167) - Special case, returns 13 floats
  167: "pr_lidar", // Placeholder name, actual parsing not implemented
};

// Generate generic names for range 121-165 for PR Telemetry
for (let i = 120; i <= 166; i++) {
  if (!COMMAND_MAP[i]) {
    COMMAND_MAP[i] = `pr_telemetry_${i}`;
  }
}

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
          if (this.dataType === DATA_TYPES.LOW_FREQUENCY) {
            this.handleLowFrequencyData(data as LowFrequencyData);
          }
          wsManager.publish_all(
            {
              type: this.dataType,
              data,
              success: true,
            },
            data,
            (wsData) => {
              this.listeners.forEach((listener) => listener(wsData));
            }
          );
        }
      } catch (error) {}

      await new Promise((resolve) => setTimeout(resolve, this.interval));
    }
  }

  private getCommandsForDataType(): number[] {
    if (this.dataType === DATA_TYPES.HIGH_FREQUENCY) {
      // EVA1 DCU, All IMU, Rover Pos/QR
      return [
        2,
        3,
        4,
        5,
        6,
        7, // EVA1 DCU
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
      // EVA2 DCU, Errors, SPEC, UIA, Telemetry, EVA States, PR Telemetry, LIDAR
      const lowFreqCommands: number[] = [];
      for (let i = 8; i <= 16; i++) lowFreqCommands.push(i); // EVA2 DCU, Errors
      for (let i = 26; i <= 167; i++) lowFreqCommands.push(i); // SPEC, UIA, TELEM, EVA, PR, LIDAR
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
      buffer,
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
        // SPEC IDs (Int)
        return msg.readInt32BE(8);
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

  private handleLowFrequencyData(data: LowFrequencyData) {
    console.log(
      "Processing low frequency data:",
      JSON.stringify(data, null, 2)
    );

    // Handle rock data for EVA 1
    if (data.eva1_spec_id !== undefined) {
      const eva1RockData: RockData = {
        evaId: 1,
        specId: data.eva1_spec_id,
        oxygen: data.eva1_spec_oxy || 0,
        water: data.eva1_spec_water || 0,
        co2: data.eva1_spec_co2 || 0,
        h2: data.eva1_spec_h2 || 0,
        n2: data.eva1_spec_n2 || 0,
        other: data.eva1_spec_other || 0,
        temperature: data.eva1_spec_temp || 0,
        pressure: data.eva1_spec_pres || 0,
        humidity: data.eva1_spec_humid || 0,
        light: data.eva1_spec_light || 0,
      };
      console.log(
        "Sending EVA 1 rock data:",
        JSON.stringify(eva1RockData, null, 2)
      );
      wsManager.publish_all(
        { type: "rock_data", data: eva1RockData, success: true },
        eva1RockData
      );
    }

    // Handle rock data for EVA 2
    if (data.eva2_spec_id !== undefined) {
      const eva2RockData: RockData = {
        evaId: 2,
        specId: data.eva2_spec_id,
        oxygen: data.eva2_spec_oxy || 0,
        water: data.eva2_spec_water || 0,
        co2: data.eva2_spec_co2 || 0,
        h2: data.eva2_spec_h2 || 0,
        n2: data.eva2_spec_n2 || 0,
        other: data.eva2_spec_other || 0,
        temperature: data.eva2_spec_temp || 0,
        pressure: data.eva2_spec_pres || 0,
        humidity: data.eva2_spec_humid || 0,
        light: data.eva2_spec_light || 0,
      };
      console.log(
        "Sending EVA 2 rock data:",
        JSON.stringify(eva2RockData, null, 2)
      );
      wsManager.publish_all(
        { type: "rock_data", data: eva2RockData, success: true },
        eva2RockData
      );
    }
  }
}
