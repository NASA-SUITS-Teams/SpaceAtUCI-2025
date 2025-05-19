import { DataTypeKey, PUBLISH_INTERVALS } from "./pollingConstants";

const lastPublishTimes: Record<DataTypeKey, number> = {
  IMU: 0,
  ROCK: 0,
  DCU: 0,
  UIA: 0,
  BIOMETRICS: 0,
  EVA_TELEMETRY: 0,
};

export function shouldPublish(dataType: DataTypeKey): boolean {
  const currentTime = Date.now();
  const interval = PUBLISH_INTERVALS[dataType];
  const lastTime = lastPublishTimes[dataType];

  if (currentTime - lastTime >= interval) {
    lastPublishTimes[dataType] = currentTime;
    return true;
  }
  return false;
}
