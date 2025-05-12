console.log(">>> Executing polling/index.ts...");
// main polling module
import { PollingClient } from "./client";

let highFrequency: PollingClient | {} = {}; // Declare outside
let lowFrequency: PollingClient | {} = {}; // Declare outside

try {
  console.log("Attempting to create PollingClient instances...");
  highFrequency = new PollingClient("high-frequency");
  lowFrequency = new PollingClient("low-frequency");
  console.log("PollingClient instances created.");

  console.log("Attempting to start polling...");
  // Type assertion needed because TS doesn't know they are initialized inside try
  (highFrequency as PollingClient).start();
  (lowFrequency as PollingClient).start();
  console.log("Polling started.");
} catch (error) {
  console.error(
    "CRITICAL ERROR during polling client initialization/start:",
    error
  );
  // Keep them as empty objects if initialization fails
  highFrequency = {};
  lowFrequency = {};
}

// Export at top level
export { highFrequency, lowFrequency };
