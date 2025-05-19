import { wsManager } from "../ws/manager";
import {
  RockData,
  SingleEvaTelemetryData,
  CombinedEvaTelemetryPayload,
} from "../ws/schema";
import { shouldPublish } from "./rateLimiter";
import { DEFAULT_ROCK_NAMES } from "./pollingConstants";

export function handleAndPublishUiaData(uiaJson: any) {
  if (!shouldPublish("UIA")) return;

  const rawUiaData = uiaJson?.uia;
  if (!rawUiaData) {
    console.warn("UIA data is missing 'uia' top-level key or is null.");
    return;
  }

  const uiaPayload = {
    emu1_power: rawUiaData.eva1_power ? 1 : 0,
    ev1_supply: rawUiaData.eva1_water_supply ? 1 : 0,
    ev1_waste: rawUiaData.eva1_water_waste ? 1 : 0,
    ev1_oxygen: rawUiaData.eva1_oxy ? 1 : 0,
    emu2_power: rawUiaData.eva2_power ? 1 : 0,
    ev2_supply: rawUiaData.eva2_water_supply ? 1 : 0,
    ev2_waste: rawUiaData.eva2_water_waste ? 1 : 0,
    ev2_oxygen: rawUiaData.eva2_oxy ? 1 : 0,
    o2_vent: rawUiaData.oxy_vent ? 1 : 0,
    depress_pump: rawUiaData.depress ? 1 : 0,
  };

  wsManager.publish_all(
    { type: "uia_data", data: uiaPayload, success: true },
    uiaPayload
  );
}

export function handleAndPublishDcuData(dcuJson: any) {
  if (!shouldPublish("DCU")) return;

  const rawDcuData = dcuJson?.dcu;
  if (!rawDcuData) {
    console.warn("DCU data is missing 'dcu' top-level key or is null.");
    return;
  }

  if (rawDcuData.eva1) {
    const dcuPayloadEva1 = {
      evaId: 1,
      battery: rawDcuData.eva1.batt ? 1 : 0,
      oxygen: rawDcuData.eva1.oxy ? 1 : 0,
      comm: rawDcuData.eva1.comm ? 1 : 0,
      fan: rawDcuData.eva1.fan ? 1 : 0,
      pump: rawDcuData.eva1.pump ? 1 : 0,
      co2: rawDcuData.eva1.co2 ? 1 : 0,
    };
    wsManager.publish_all(
      { type: "dcu_data", data: dcuPayloadEva1, success: true },
      dcuPayloadEva1
    );
  }

  if (rawDcuData.eva2) {
    const dcuPayloadEva2 = {
      evaId: 2,
      battery: rawDcuData.eva2.batt ? 1 : 0,
      oxygen: rawDcuData.eva2.oxy ? 1 : 0,
      comm: rawDcuData.eva2.comm ? 1 : 0,
      fan: rawDcuData.eva2.fan ? 1 : 0,
      pump: rawDcuData.eva2.pump ? 1 : 0,
      co2: rawDcuData.eva2.co2 ? 1 : 0,
    };
    wsManager.publish_all(
      { type: "dcu_data", data: dcuPayloadEva2, success: true },
      dcuPayloadEva2
    );
  }
}

export function handleAndPublishImuData(imuJson: any) {
  if (!shouldPublish("IMU")) return;
  const rawImuData = imuJson?.imu;
  if (!rawImuData) {
    console.warn("IMU data missing 'imu' key or is null.");
    return;
  }

  const imuPayload = {
    eva1: rawImuData.eva1
      ? {
          evaId: 1,
          position: {
            x: rawImuData.eva1.posx ?? 0,
            y: rawImuData.eva1.posy ?? 0,
          },
          heading: rawImuData.eva1.heading ?? 0,
        }
      : undefined,
    eva2: rawImuData.eva2
      ? {
          evaId: 2,
          position: {
            x: rawImuData.eva2.posx ?? 0,
            y: rawImuData.eva2.posy ?? 0,
          },
          heading: rawImuData.eva2.heading ?? 0,
        }
      : undefined,
    timestamp: Date.now(),
  };
  wsManager.publish_all(
    { type: "imu_data", data: imuPayload, success: true },
    imuPayload
  );
}

export function handleAndPublishSpecData(specJson: any) {
  if (!shouldPublish("ROCK")) return;
  const rawSpecData = specJson?.spec;
  if (!rawSpecData) {
    console.warn("SPEC data missing 'spec' key or is null.");
    return;
  }

  const processEvaSpec = (evaSpecData: any, evaId: number) => {
    if (!evaSpecData) return;
    const rockId = evaSpecData.id ?? -1; // SPEC.json uses 'id' for the rock ID
    const rockName =
      evaSpecData.name ??
      DEFAULT_ROCK_NAMES[rockId] ??
      `unknown_rock_${rockId}`;
    const composition = evaSpecData.data ?? {}; // SPEC.json has composition under 'data'

    const rockPayload: RockData = {
      evaId: evaId,
      specId: rockId,
      name: rockName,
      composition: composition,
    };
    wsManager.publish_all(
      { type: "rock_data", data: rockPayload, success: true },
      rockPayload
    );
  };

  processEvaSpec(rawSpecData.eva1, 1);
  processEvaSpec(rawSpecData.eva2, 2);
}

// Helper function to process and publish biometrics for a single EVA
function processAndPublishBiometrics(evaData: any, evaId: number) {
  if (!evaData) return;

  if (shouldPublish("BIOMETRICS")) {
    const biometricsPayload = {
      evaId: evaId,
      heartRate: evaData.heart_rate ?? 0,
      temperature: evaData.temperature ?? 0,
      o2Consumption: evaData.oxy_consumption ?? 0,
      co2Production: evaData.co2_production ?? 0,
      suitPressureTotal: evaData.suit_pressure_total ?? 0,
      helmetCo2: evaData.helmet_pressure_co2 ?? 0,
    };
    wsManager.publish_all(
      { type: "biometrics_data", data: biometricsPayload, success: true },
      biometricsPayload
    );
    // console.log("[Debug] Sent biometrics data:", biometricsPayload); // Optional: if you want to keep this log separate
  }
}

// Helper function to create SingleEvaTelemetryData from raw EVA data
function createSingleEvaTelemetry(
  evaData: any
): SingleEvaTelemetryData | undefined {
  if (!evaData) return undefined;
  return {
    o2TimeLeft: evaData.oxy_time_left ?? 0,
    oxygenPrimaryStorage: evaData.oxy_pri_storage ?? 0,
    oxygenSecondaryStorage: evaData.oxy_sec_storage ?? 0,
    oxygenPrimaryPressure: evaData.oxy_pri_pressure ?? 0,
    oxygenSecondaryPressure: evaData.oxy_sec_pressure ?? 0,
    suitPressureOxygen: evaData.suit_pressure_oxy ?? 0,
    suitPressureCO2: evaData.suit_pressure_co2 ?? 0,
    suitPressureOther: evaData.suit_pressure_other ?? 0,
    suitPressureTotal: evaData.suit_pressure_total ?? 0,
    scrubberAPressure: evaData.scrubber_a_co2_storage ?? 0,
    scrubberBPressure: evaData.scrubber_b_co2_storage ?? 0,
    h2oGasPressure: evaData.coolant_gas_pressure ?? 0,
    h2oLiquidPressure: evaData.coolant_liquid_pressure ?? 0,
    oxygenConsumption: evaData.oxy_consumption ?? 0,
    co2Production: evaData.co2_production ?? 0,
    primaryFanRPM: evaData.fan_pri_rpm ?? 0,
    secondaryFanRPM: evaData.fan_sec_rpm ?? 0,
    helmetCO2Pressure: evaData.helmet_pressure_co2 ?? 0,
    heartRate: evaData.heart_rate ?? 0,
    temperature: evaData.temperature ?? 0,
    coolantLevel: evaData.coolant_ml ?? 0,
    batteryTimeLeft: evaData.batt_time_left ?? 0,
  };
}

export function handleAndPublishEvaAndBiometricsData(telemetryJson: any) {
  const rawTelemetryData = telemetryJson?.telemetry;
  if (!rawTelemetryData) {
    console.warn("Telemetry data missing 'telemetry' key or is null.");
    return;
  }

  // Process and publish biometrics for EVA1 and EVA2 individually
  processAndPublishBiometrics(rawTelemetryData.eva1, 1);
  processAndPublishBiometrics(rawTelemetryData.eva2, 2);

  // Process and publish combined EVA telemetry
  if (shouldPublish("EVA_TELEMETRY")) {
    const eva1Data = createSingleEvaTelemetry(rawTelemetryData.eva1);
    const eva2Data = createSingleEvaTelemetry(rawTelemetryData.eva2);

    // Only send if there's data for at least one EVA
    if (eva1Data || eva2Data) {
      const combinedPayload: CombinedEvaTelemetryPayload = {
        evaTime: rawTelemetryData.eva_time ?? 0,
        timestamp: Date.now(),
        ...(eva1Data && { eva1: eva1Data }),
        ...(eva2Data && { eva2: eva2Data }),
      };

      wsManager.publish_all(
        {
          type: "eva_telemetry_data",
          data: combinedPayload,
          success: true,
        },
        combinedPayload
      );
      console.log("Sent combined eva telemetry data:", combinedPayload); // Updated log
    }
  }
  // The old processEvaData function and its direct calls are now replaced by the logic above.
  // The console.log("eva2", rawTelemetryData.eva2); added by the user is also implicitly handled or can be removed.
}
