// main polling module
import { PollingClient } from "./client";

const highFrequency = new PollingClient('high-frequency'); // pulls every millisecond
const lowFrequency = new PollingClient('low-frequency'); // pulls every minute

export { highFrequency, lowFrequency };