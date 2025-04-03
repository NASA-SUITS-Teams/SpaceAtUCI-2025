import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import { udpClient } from "~/utils/udpClient";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

app.get("/api/", (c) => {
  return c.text("Hello Hono!");
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onMessage(event, ws) {
        console.log(`Message from client: ${event.data}`);
        ws.send("Hello from server!");
      },
      onClose: () => {
        console.log("Connection closed");
      },
    };
  })
);

/**
 * TODO: 
 * - replace mock data with actual data from the TSS server
 * - implement async request system ( await responses and updates from telemetry data)
 *  */ 
app.get("/api/telemetry", (c) => {
  try {
       // ----- MOCK DATA -----
      const telemetryData = {
        connection: "Connected",
        currentTime: new Date().toLocaleTimeString(),
        elapsedTime: "00:00:00", // Will be calculated
        missionProgress: 0,
        rover: {
          heading: 0,
          speed: 0,
          battery: 0,
          temperature: 0,
        },
        crew: {
          ev1: {
            heartRate: 0,
            oxygenTank: 0,
            bloodPressure: 0,
            temperature: 0,
          },
          ev2: {
            heartRate: 0,
            oxygenTank: 0,
            bloodPressure: 0,
            temperature: 0,
          },
        },
        environmentalReadings: {
          temperature: 0,
          rain: 0,
          humidity: 0,
          visibility: 0,
          windSpeed: 0,
        },
        samples: [],
        uiaData: {
          eva1_power: false,
          eva1_oxy: false,
          eva1_water_waste: false,
          eva1_water_supply: false,
          eva2_power: false,
          eva2_oxy: false,
          eva2_water_waste: false,
          eva2_water_supply: false,
          oxy_vent: false,
          depress: false,
        },
        dcuData: {
          eva1_batt: false,
          eva1_oxy: false,
          eva1_comm: false,
          eva1_fan: false,
          eva1_pump: false,
          eva1_co2: false,
          eva2_batt: false,
          eva2_oxy: false,
          eva2_comm: false,
          eva2_fan: false,
          eva2_pump: false,
          eva2_co2: false,
        }
      };
      // ----- MOCK DATA -----

      // test udp connection
      const teamNumber = 1.0;
      udpClient.sendCommand(58, teamNumber);
      udpClient.sendCommand(23, 0.0); // POSX
      udpClient.sendCommand(24, 0.0); // POSY
      udpClient.sendCommand(25, 0.0); // QR ID
      // Request UIA states (commands 48-57)
      for (let i = 48; i <= 57; i++) {
        udpClient.sendCommand(i, 0.0);
      }
      // Request DCU states (commands 2-13)
      for (let i = 2; i <= 13; i++) {
        udpClient.sendCommand(i, 0.0);
      }

      return c.json(telemetryData);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch telemetry data" }, 500);
  }
});

// get port
const port = process.argv.includes('--port') 
  ? parseInt(process.argv[process.argv.indexOf('--port') + 1]) 
  : 8000;

export default {
  fetch: app.fetch,
  websocket,
  port
};
