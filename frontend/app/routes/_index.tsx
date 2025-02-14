import type { MetaFunction } from "@remix-run/node";
import { useState } from "react";
import { StatusBar } from "~/components/StatusBar";
import { LeftSidebar } from "~/components/LeftSidebar";
import { MainViewport } from "~/components/MainViewport";
import { RightSidebar } from "~/components/RightSidebar";

export const meta: MetaFunction = () => {
  return [
    { title: "Lunar Rover Control Interface" },
    {
      name: "description",
      content: "Mission control interface for lunar rover operations",
    },
  ];
};

// Mock data moved to a separate file in a real application
const mockTelemetry = {
  connection: "Stable",
  currentTime: "12:45:23",
  elapsedTime: "3:43:23",
  missionProgress: 78,
  rover: {
    heading: 45,
    speed: 2.5,
    battery: 78,
    temperature: 91,
  },
  crew: {
    ev1: {
      heartRate: 45,
      oxygenTank: 89,
      bloodPressure: 89,
      temperature: 98,
    },
    ev2: {
      heartRate: 98,
      oxygenTank: 93,
      bloodPressure: 91,
      temperature: 100,
    },
  },
  environmentalReadings: {
    temperature: 84,
    rain: 0,
    humidity: 2,
    visibility: 12,
    windSpeed: 3,
  },
  samples: [
    {
      id: "08123",
      properties: ["Fine-grained", "low silica", "glassy"],
    },
    {
      id: "32412",
      properties: ["Coarse-grained", "high silica"],
    },
  ],
};

export default function Index() {
  const [viewMode, setViewMode] = useState<"single" | "grid">("single");

  return (
    <div className="min-h-screen bg-[#131617] text-gray-100">
      <StatusBar environmentalReadings={mockTelemetry.environmentalReadings} />

      <div className="grid grid-cols-[250px_1fr_220px] gap-2 p-2">
        <LeftSidebar
          rover={mockTelemetry.rover}
          crew={mockTelemetry.crew}
          samples={mockTelemetry.samples}
        />

        <MainViewport
          connection={mockTelemetry.connection}
          currentTime={mockTelemetry.currentTime}
          elapsedTime={mockTelemetry.elapsedTime}
          missionProgress={mockTelemetry.missionProgress}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <RightSidebar />
      </div>
    </div>
  );
}
