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
  // ROVER (Commands 23-25 in old map, README 23-30 - keeping 23-25 for now due to ambiguity)
  23: "rover_posx",
  24: "rover_posy",
  25: "rover_qr_id", // This was command 25. README rover is 23-30.
  // server_data.c references ROVER.json which has posx, posy, poi_1_x, poi_1_y, poi_2_x, poi_2_y, poi_3_x, poi_3_y, ping
  // udp_get_rover in server_data.c uses offset from 23.
  // Keeping 23, 24, 25 as is due to lack of direct 1-to-1 mapping for 23-30 from README text to existing field names.
  // EVA 1 SPEC (Commands 31-41 in README)
  31: "eva1_spec_id", // Was 26
  32: "eva1_sio2", // Was 27
  33: "eva1_tio2", // Was 28
  34: "eva1_al2o3", // Was 29
  35: "eva1_feo", // Was 30
  36: "eva1_mno", // Was 31
  37: "eva1_mgo", // Was 32
  38: "eva1_cao", // Was 33
  39: "eva1_k2o", // Was 34
  40: "eva1_p2o3", // Was 35
  41: "eva1_rock_other", // Was 36
  // EVA 2 SPEC (Commands 42-52 in README)
  42: "eva2_spec_id", // Was 37
  43: "eva2_sio2", // Was 38
  44: "eva2_tio2", // Was 39
  45: "eva2_al2o3", // Was 40
  46: "eva2_feo", // Was 41
  47: "eva2_mno", // Was 42
  48: "eva2_mgo", // Was 43
  49: "eva2_cao", // Was 44
  50: "eva2_k2o", // Was 45
  51: "eva2_p2o3", // Was 46
  52: "eva2_rock_other", // Was 47
  // UIA (Commands 53-62 in README)
  53: "uia_emu1_power", // Was 48
  54: "uia_ev1_supply", // Was 49
  55: "uia_ev1_waste", // Was 50
  56: "uia_ev1_oxygen", // Was 51
  57: "uia_emu2_power", // Was 52
  58: "uia_ev2_supply", // Was 53
  59: "uia_ev2_waste", // Was 54
  60: "uia_ev2_oxygen", // Was 55
  61: "uia_o2_vent", // Was 56
  62: "uia_depress_pump", // Was 57
  // TELEMETRY / EVA (Base command 63 in README)
  63: "eva_time", // UI: EVA Time
  // EVA1 Telemetry (Commands 64-85) - Mapped to UI based on observed values in console log
  64: "eva1_batt_time_left", // Placeholder, no direct UI value match in console log, but command 64 is batt_time in server_data.c
  65: "eva1_ui_heart_rate", // UI: Heart Rate (90.00 bpm) - Console eva1_oxy_pri_storage (cmd 65) has 90.
  66: "eva1_placeholder_cmd66", // Placeholder - console eva1_oxy_sec_storage (cmd 66) is 0. UI Secondary O2 Storage is 15%.
  67: "eva1_ui_pri_o2_pressure", // UI: Primary O2 Pressure (0.00 psi) - Console eva1_oxy_pri_pressure (cmd 67) has 0.
  68: "eva1_ui_suit_o2_pressure", // UI: Suit O2 Pressure (3.07 psi) - Console eva1_oxy_sec_pressure (cmd 68) has 3.0722.
  69: "eva1_ui_suit_co2_pressure", // UI: Suit CO2 Pressure (0.01 psi) - Console eva1_oxy_time_left (cmd 69) has 0.0059.
  70: "eva1_ui_suit_other_pressure", // UI: Suit Other Pressure (11.55 psi) - Console eva1_heart_rate (cmd 70) has 11.554.
  71: "eva1_ui_suit_total_pressure", // UI: Suit Total Pressure (14.63 psi) - Console eva1_oxy_consumption (cmd 71) has 14.63.
  72: "eva1_ui_helmet_co2_pressure", // UI: Helmet CO2 Pressure (0.00 psi) - Console eva1_co2_production (cmd 72) has 0.
  73: "eva1_ui_o2_consumption", // UI: O2 Consumption (0.00 psi/min) - Console eva1_suit_pressure_oxy (cmd 73) has 0.
  74: "eva1_ui_co2_production", // UI: CO2 Production (0.00 psi/min) - Console eva1_suit_pressure_co2 (cmd 74) has 0.
  75: "eva1_ui_fan_pri_rpm", // UI: Primary Fan (0 rpm) - Console eva1_suit_pressure_other (cmd 75) has 0.
  76: "eva1_ui_fan_sec_rpm", // UI: Secondary Fan (0 rpm) - Console eva1_suit_pressure_total (cmd 76) has 0.
  77: "eva1_ui_temperature", // UI: Temperature (70.00 deg F) - Console eva1_fan_pri_rpm (cmd 77) has 70.
  78: "eva1_ui_coolant_ml", // UI: Coolant (20.51 ml) - Console eva1_fan_sec_rpm (cmd 78) has 20.508.
  79: "eva1_placeholder_cmd79", // Placeholder - Console eva1_helmet_pressure_co2 (cmd 79) is 0. No remaining UI field needing 0 unless it is one of the scrubbers.
  80: "eva1_ui_scrubber_a_pressure", // UI: Scrubber A Pressure (0.00 psi) - Console eva1_scrubber_a_co2_storage (cmd 80) has 0.
  81: "eva1_ui_scrubber_b_pressure", // UI: Scrubber B Pressure (0.00 psi) - Console eva1_scrubber_b_co2_storage (cmd 81) has a large value (3384), UI wants 0. Assuming TSS will send 0.
  82: "eva1_placeholder_cmd82", // Placeholder - Console eva1_temperature (cmd 82) has 24.231. No UI match.
  83: "eva1_ui_o2_time_left", // UI: O2 Time Left (01:10:38) - Mapped to eva1_coolant_ml (cmd 83 from server_data.c). Assume TSS sends total seconds here.
  84: "eva1_ui_h2o_gas_pressure", // UI: H2O Gas Pressure (0.00 psi) - Console eva1_coolant_gas_pressure (cmd 84) has 0.
  85: "eva1_ui_h2o_liquid_pressure", // UI: H2O Liquid Pressure (0.00 psi) - Console eva1_coolant_liquid_pressure (cmd 85) has 0.
  // EVA2 Telemetry (Commands 86-107) - Will mirror EVA1 UI mapping logic
  86: "eva2_batt_time_left", // Placeholder
  87: "eva2_ui_heart_rate", // UI: Heart Rate
  88: "eva2_placeholder_cmd88", // Placeholder
  89: "eva2_ui_pri_o2_pressure", // UI: Primary O2 Pressure
  90: "eva2_ui_suit_o2_pressure", // UI: Suit O2 Pressure
  91: "eva2_ui_suit_co2_pressure", // UI: Suit CO2 Pressure
  92: "eva2_ui_suit_other_pressure", // UI: Suit Other Pressure
  93: "eva2_ui_suit_total_pressure", // UI: Suit Total Pressure
  94: "eva2_ui_helmet_co2_pressure", // UI: Helmet CO2 Pressure
  95: "eva2_ui_o2_consumption", // UI: O2 Consumption
  96: "eva2_ui_co2_production", // UI: CO2 Production
  97: "eva2_ui_fan_pri_rpm", // UI: Primary Fan
  98: "eva2_ui_fan_sec_rpm", // UI: Secondary Fan
  99: "eva2_ui_temperature", // UI: Temperature
  100: "eva2_ui_coolant_ml", // UI: Coolant ml
  101: "eva2_placeholder_cmd101", // Placeholder
  102: "eva2_ui_scrubber_a_pressure", // UI: Scrubber A Pressure
  103: "eva2_ui_scrubber_b_pressure", // UI: Scrubber B Pressure
  104: "eva2_placeholder_cmd104", // Placeholder
  105: "eva2_ui_o2_time_left", // UI: O2 Time Left
  106: "eva2_ui_h2o_gas_pressure", // UI: H2O Gas Pressure
  107: "eva2_ui_h2o_liquid_pressure", // UI: H2O Liquid Pressure
  // Generic EVA States (Commands 108-123 in README)
  108: "eva_state_108", // Was 103
  109: "eva_state_109", // Was 104
  110: "eva_state_110", // Was 105
  111: "eva_state_111", // Was 106
  112: "eva_state_112", // Was 107
  113: "eva_state_113", // Was 108
  114: "eva_state_114", // Was 109
  115: "eva_state_115", // Was 110
  116: "eva_state_116", // Was 111
  117: "eva_state_117", // Was 112
  118: "eva_state_118", // Was 113
  119: "eva_state_119", // Was 114
  120: "eva_state_120", // Was 115
  121: "eva_state_121", // Was 116
  122: "eva_state_122", // Was 117
  123: "eva_state_123", // Was 118
  // Pressurized Rover Telemetry (Commands 124-171 in README)
  // The loop below will handle 125-171. Command 124 needs to be explicit.
  124: "pr_telemetry_124", // Was 119
  // Pressurized Rover LIDAR (Command 172 in README)
  172: "pr_lidar", // Was 167. Placeholder name, actual parsing not implemented
};

// Generate generic names for range 125-171 for PR Telemetry (README 124-171)
// Old range was 120-166. New is 124-171. Loop from 124.
for (let i = 124; i <= 171; i++) {
  if (!COMMAND_MAP[i]) {
    COMMAND_MAP[i] = `pr_telemetry_${i}`;
  }
}
