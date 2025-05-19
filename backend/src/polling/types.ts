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
  // EVA1 DCU (Commands 2-7)
  eva1_batt?: number;
  eva1_oxy?: number;
  eva1_comm?: number;
  eva1_fan?: number;
  eva1_pump?: number;
  eva1_co2?: number;
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
  // ROVER (Commands 23-25)
  rover_posx?: number;
  rover_posy?: number;
  rover_qr_id?: number; // Deprecated by README but kept for now
  // EVA 1 SPEC (Commands 31-41)
  eva1_spec_id?: number;
  eva1_sio2?: number;
  eva1_tio2?: number;
  eva1_al2o3?: number;
  eva1_feo?: number;
  eva1_mno?: number;
  eva1_mgo?: number;
  eva1_cao?: number;
  eva1_k2o?: number;
  eva1_p2o3?: number;
  eva1_rock_other?: number;
  // EVA 2 SPEC (Commands 42-52)
  eva2_spec_id?: number;
  eva2_sio2?: number;
  eva2_tio2?: number;
  eva2_al2o3?: number;
  eva2_feo?: number;
  eva2_mno?: number;
  eva2_mgo?: number;
  eva2_cao?: number;
  eva2_k2o?: number;
  eva2_p2o3?: number;
  eva2_rock_other?: number;
  // UIA (Commands 53-62)
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
  // TELEMETRY / EVA (Base command 63)
  eva_time?: number; // UI: EVA Time

  // EVA1 Telemetry (Commands 64-85) - Mapped to UI field names based on observed values
  eva1_batt_time_left?: number; // Placeholder from server_data.c, cmd 64
  eva1_ui_heart_rate?: number; // UI: Heart Rate (bpm)
  eva1_placeholder_cmd66?: number; // Placeholder for cmd 66
  eva1_ui_pri_o2_pressure?: number; // UI: Primary O2 Pressure (psi)
  eva1_ui_suit_o2_pressure?: number; // UI: Suit O2 Pressure (psi)
  eva1_ui_suit_co2_pressure?: number; // UI: Suit CO2 Pressure (psi)
  eva1_ui_suit_other_pressure?: number; // UI: Suit Other Pressure (psi)
  eva1_ui_suit_total_pressure?: number; // UI: Suit Total Pressure (psi)
  eva1_ui_helmet_co2_pressure?: number; // UI: Helmet CO2 Pressure (psi)
  eva1_ui_o2_consumption?: number; // UI: O2 Consumption (psi/min)
  eva1_ui_co2_production?: number; // UI: CO2 Production (psi/min)
  eva1_ui_fan_pri_rpm?: number; // UI: Primary Fan (rpm)
  eva1_ui_fan_sec_rpm?: number; // UI: Secondary Fan (rpm)
  eva1_ui_temperature?: number; // UI: Temperature (deg F)
  eva1_ui_coolant_ml?: number; // UI: Coolant (ml)
  eva1_placeholder_cmd79?: number; // Placeholder for cmd 79
  eva1_ui_scrubber_a_pressure?: number; // UI: Scrubber A Pressure (psi)
  eva1_ui_scrubber_b_pressure?: number; // UI: Scrubber B Pressure (psi)
  eva1_placeholder_cmd82?: number; // Placeholder for cmd 82
  eva1_ui_o2_time_left?: number; // UI: O2 Time Left (seconds total)
  eva1_ui_h2o_gas_pressure?: number; // UI: H2O Gas Pressure (psi)
  eva1_ui_h2o_liquid_pressure?: number; // UI: H2O Liquid Pressure (psi)

  // EVA2 Telemetry (Commands 86-107) - Mirrored UI-centric names
  eva2_batt_time_left?: number;
  eva2_ui_heart_rate?: number;
  eva2_placeholder_cmd88?: number;
  eva2_ui_pri_o2_pressure?: number;
  eva2_ui_suit_o2_pressure?: number;
  eva2_ui_suit_co2_pressure?: number;
  eva2_ui_suit_other_pressure?: number;
  eva2_ui_suit_total_pressure?: number;
  eva2_ui_helmet_co2_pressure?: number;
  eva2_ui_o2_consumption?: number;
  eva2_ui_co2_production?: number;
  eva2_ui_fan_pri_rpm?: number;
  eva2_ui_fan_sec_rpm?: number;
  eva2_ui_temperature?: number;
  eva2_ui_coolant_ml?: number;
  eva2_placeholder_cmd101?: number;
  eva2_ui_scrubber_a_pressure?: number;
  eva2_ui_scrubber_b_pressure?: number;
  eva2_placeholder_cmd104?: number;
  eva2_ui_o2_time_left?: number;
  eva2_ui_h2o_gas_pressure?: number;
  eva2_ui_h2o_liquid_pressure?: number;

  // Generic EVA States (Commands 108-123)
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
