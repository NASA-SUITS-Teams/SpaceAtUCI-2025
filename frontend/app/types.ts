// generated based on the TSS data structures.

// UIA Data Structure
export interface UIAData {
    eva1_power: boolean;
    eva1_oxy: boolean;
    eva1_water_waste: boolean;
    eva1_water_supply: boolean;
    eva2_power: boolean;
    eva2_oxy: boolean;
    eva2_water_waste: boolean;
    eva2_water_supply: boolean;
    oxy_vent: boolean;
    depress: boolean;
  }
  
  // DCU Data Structure
  export interface DCUData {
    eva1_batt: boolean;
    eva1_oxy: boolean;
    eva1_comm: boolean;
    eva1_fan: boolean;
    eva1_pump: boolean;
    eva1_co2: boolean;
    eva2_batt: boolean;
    eva2_oxy: boolean;
    eva2_comm: boolean;
    eva2_fan: boolean;
    eva2_pump: boolean;
    eva2_co2: boolean;
  }
  
  // More interfaces for other data types...
  
  // Command numbers enum
  export enum CommandNumbers {
    // EVA1 DCU switch states
    EVA1_BATT = 2,
    EVA1_OXY = 3,
    // ... more command numbers
  }
  
  // UDP message format
  export interface UDPRequest {
    timestamp: number; // uint32
    command: CommandNumbers; // uint32
  }
  
  export interface UDPResponse {
    timestamp: number; // uint32
    command: CommandNumbers; // uint32
    data: number; // int32 or float
  }