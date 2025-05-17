// Command number to data field mapping based on TSS README
export const COMMAND_MAP: { [key: number]: string } = {
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
  // EVA 1 SPEC (Commands 26-36) - Rock composition data
  26: "eva1_spec_id", // SPEC ID
  27: "eva1_sio2", // SiO2 value
  28: "eva1_tio2", // TiO2 value
  29: "eva1_al2o3", // Al2O3 value
  30: "eva1_feo", // FeO value
  31: "eva1_mno", // MnO value
  32: "eva1_mgo", // MgO value
  33: "eva1_cao", // CaO value
  34: "eva1_k2o", // K2O value
  35: "eva1_p2o3", // P2O3 value
  36: "eva1_rock_other", // Other value
  // EVA 2 SPEC (Commands 37-47) - Rock composition data
  37: "eva2_spec_id", // SPEC ID
  38: "eva2_sio2", // SiO2 value
  39: "eva2_tio2", // TiO2 value
  40: "eva2_al2o3", // Al2O3 value
  41: "eva2_feo", // FeO value
  42: "eva2_mno", // MnO value
  43: "eva2_mgo", // MgO value
  44: "eva2_cao", // CaO value
  45: "eva2_k2o", // K2O value
  46: "eva2_p2o3", // P2O3 value
  47: "eva2_rock_other", // Other value
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
