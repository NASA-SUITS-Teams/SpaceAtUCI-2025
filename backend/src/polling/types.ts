// Define polling rates
export const POLLING_RATES = {
  HIGH_FREQUENCY: 100, // 100ms
  LOW_FREQUENCY: 1000, // 1000ms
} as const;

// Define data types
export const DATA_TYPES = {
  HIGH_FREQUENCY: "high-frequency",
  LOW_FREQUENCY: "low-frequency",
} as const;

export type DataType = (typeof DATA_TYPES)[keyof typeof DATA_TYPES];
export type PollingRate = (typeof POLLING_RATES)[keyof typeof POLLING_RATES];

// define data structures
export type DataTypeMap = {
  HIGH_FREQUENCY: HighFrequencyData;
  LOW_FREQUENCY: LowFrequencyData;
};

export interface TelemetryData {
  timestamp: number;
  [key: string]: any; // Allow arbitrary key-value pairs for different data points
}

export interface HighFrequencyData extends TelemetryData {
  type: "high-frequency";
  // EVA1 DCU (Commands 2-7)
  eva1_batt?: number;
  eva1_oxy?: number;
  eva1_comm?: number;
  eva1_fan?: number;
  eva1_pump?: number;
  eva1_co2?: number;
  // EVA1 IMU (Commands 17-19)
  eva1_imu_posx?: number;
  eva1_imu_posy?: number;
  eva1_imu_heading?: number;
  // EVA2 IMU (Commands 20-22)
  eva2_imu_posx?: number;
  eva2_imu_posy?: number;
  eva2_imu_heading?: number;
  // ROVER (Commands 23-25)
  rover_posx?: number;
  rover_posy?: number;
  rover_qr_id?: number;
}

export interface LowFrequencyData extends TelemetryData {
  type: "low-frequency";
  // EVA2 DCU (Commands 8-13)
  eva2_batt?: number;
  eva2_oxy?: number;
  eva2_comm?: number;
  eva2_fan?: number;
  eva2_pump?: number;
  eva2_co2?: number;
  // Error States (Commands 14-16)
  o2_error?: number;
  pump_error?: number;
  fan_error?: number;
  // EVA 1 SPEC (Commands 26-36)
  eva1_spec_id?: number;
  eva1_spec_oxy?: number;
  eva1_spec_water?: number;
  eva1_spec_co2?: number;
  eva1_spec_h2?: number;
  eva1_spec_n2?: number;
  eva1_spec_other?: number;
  eva1_spec_temp?: number;
  eva1_spec_pres?: number;
  eva1_spec_humid?: number;
  eva1_spec_light?: number;
  // EVA 2 SPEC (Commands 37-47)
  eva2_spec_id?: number;
  eva2_spec_oxy?: number;
  eva2_spec_water?: number;
  eva2_spec_co2?: number;
  eva2_spec_h2?: number;
  eva2_spec_n2?: number;
  eva2_spec_other?: number;
  eva2_spec_temp?: number;
  eva2_spec_pres?: number;
  eva2_spec_humid?: number;
  eva2_spec_light?: number;
  // UIA (Commands 48-57)
  uia_emu1_power?: number;
  uia_ev1_supply?: number;
  uia_ev1_waste?: number;
  uia_ev1_oxygen?: number;
  uia_emu2_power?: number;
  uia_ev2_supply?: number;
  uia_ev2_waste?: number;
  uia_ev2_oxygen?: number;
  uia_o2_vent?: number;
  uia_depress_pump?: number;
  // TELEMETRY / EVA (Commands 58-118)
  eva_time?: number;
  // EVA1 Telemetry (Commands 59-80)
  eva1_batt_time_left?: number;
  eva1_oxy_pri_storage?: number;
  eva1_oxy_sec_storage?: number;
  eva1_oxy_pri_pressure?: number;
  eva1_oxy_sec_pressure?: number;
  eva1_suit_pressure_oxy?: number;
  eva1_suit_pressure_co2?: number;
  eva1_suit_pressure_other?: number;
  eva1_suit_pressure_total?: number;
  eva1_scrubber_a_pressure?: number;
  eva1_scrubber_b_pressure?: number;
  eva1_h2o_gas_pressure?: number;
  eva1_h2o_liquid_pressure?: number;
  eva1_oxy_consumption?: number;
  eva1_co2_production?: number;
  eva1_fan_pri_rpm?: number;
  eva1_fan_sec_rpm?: number;
  eva1_helmet_pressure_co2?: number;
  eva1_heart_rate?: number;
  eva1_temperature?: number;
  eva1_coolant_gas_pressure?: number;
  eva1_coolant_liquid_pressure?: number;
  // EVA2 Telemetry (Commands 81-102)
  eva2_batt_time_left?: number;
  eva2_oxy_pri_storage?: number;
  eva2_oxy_sec_storage?: number;
  eva2_oxy_pri_pressure?: number;
  eva2_oxy_sec_pressure?: number;
  eva2_suit_pressure_oxy?: number;
  eva2_suit_pressure_co2?: number;
  eva2_suit_pressure_other?: number;
  eva2_suit_pressure_total?: number;
  eva2_scrubber_a_pressure?: number;
  eva2_scrubber_b_pressure?: number;
  eva2_h2o_gas_pressure?: number;
  eva2_h2o_liquid_pressure?: number;
  eva2_oxy_consumption?: number;
  eva2_co2_production?: number;
  eva2_fan_pri_rpm?: number;
  eva2_fan_sec_rpm?: number;
  eva2_helmet_pressure_co2?: number;
  eva2_heart_rate?: number;
  eva2_temperature?: number;
  eva2_coolant_gas_pressure?: number;
  eva2_coolant_liquid_pressure?: number;
  // Generic EVA States (Commands 103-118)
  eva_state_103?: number;
  eva_state_104?: number;
  eva_state_105?: number;
  eva_state_106?: number;
  eva_state_107?: number;
  eva_state_108?: number;
  eva_state_109?: number;
  eva_state_110?: number;
  eva_state_111?: number;
  eva_state_112?: number;
  eva_state_113?: number;
  eva_state_114?: number;
  eva_state_115?: number;
  eva_state_116?: number;
  eva_state_117?: number;
  eva_state_118?: number;
  // Pressurized Rover Telemetry (Commands 119-166)
  pr_telemetry_119?: number;
  pr_telemetry_120?: number;
  pr_telemetry_121?: number;
  pr_telemetry_122?: number;
  pr_telemetry_123?: number;
  pr_telemetry_124?: number;
  pr_telemetry_125?: number;
  pr_telemetry_126?: number;
  pr_telemetry_127?: number;
  pr_telemetry_128?: number;
  pr_telemetry_129?: number;
  pr_telemetry_130?: number;
  pr_telemetry_131?: number;
  pr_telemetry_132?: number;
  pr_telemetry_133?: number;
  pr_telemetry_134?: number;
  pr_telemetry_135?: number;
  pr_telemetry_136?: number;
  pr_telemetry_137?: number;
  pr_telemetry_138?: number;
  pr_telemetry_139?: number;
  pr_telemetry_140?: number;
  pr_telemetry_141?: number;
  pr_telemetry_142?: number;
  pr_telemetry_143?: number;
  pr_telemetry_144?: number;
  pr_telemetry_145?: number;
  pr_telemetry_146?: number;
  pr_telemetry_147?: number;
  pr_telemetry_148?: number;
  pr_telemetry_149?: number;
  pr_telemetry_150?: number;
  pr_telemetry_151?: number;
  pr_telemetry_152?: number;
  pr_telemetry_153?: number;
  pr_telemetry_154?: number;
  pr_telemetry_155?: number;
  pr_telemetry_156?: number;
  pr_telemetry_157?: number;
  pr_telemetry_158?: number;
  pr_telemetry_159?: number;
  pr_telemetry_160?: number;
  pr_telemetry_161?: number;
  pr_telemetry_162?: number;
  pr_telemetry_163?: number;
  pr_telemetry_164?: number;
  pr_telemetry_165?: number;
  pr_telemetry_166?: number;
  // Pressurized Rover LIDAR (Command 167)
  pr_lidar?: number; // Currently only parses first float value
}

// define endpoints for tss
export const TSS_CONFIG = {
  IP: process.env.TSS_IP || "127.0.0.1", // Use loopback since server is local
  PORT: parseInt(process.env.TSS_PORT || "14141", 10),
} as const; // type safety
