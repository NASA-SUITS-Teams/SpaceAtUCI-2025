type ViewMode = "single" | "grid";

import { radioIcon, navIcon, speedIcon, expandIcon, gridIcon } from "../icons";
import CameraFeed from "./CameraFeed";

export function MainViewport({
  connection,
  currentTime,
  elapsedTime,
  missionProgress,
  viewMode,
  onViewModeChange,
}: {
  connection: string;
  currentTime: string;
  elapsedTime: string;
  missionProgress: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="space-y-4 h-fit">
      <div className="bg-[#2d2a2b] border border-gray-700 rounded-lg h-full flex flex-col ">
        <MissionStatus
          connection={connection}
          currentTime={currentTime}
          elapsedTime={elapsedTime}
          missionProgress={missionProgress}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <CameraFeed serverUrl="ws://localhost:8000/ws/camera-stream" />
        <ManualControl />
      </div>
    </div>
  );
}

function MissionStatus({
  connection,
  currentTime,
  elapsedTime,
  missionProgress,
  onViewModeChange,
}: {
  connection: string;
  currentTime: string;
  elapsedTime: string;
  missionProgress: number;
  viewMode?: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="p-2 px-4 border-b border-gray-700">
      <div className="flex justify-between items-center mb-2 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <span>Connection:</span>
          <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
            {connection}
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-700"
            onClick={() => onViewModeChange("single")}
          >
            <img src={expandIcon} alt="Single view" className="w-4 h-4" />
            Single view
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-700"
            onClick={() => onViewModeChange("grid")}
          >
            <img src={gridIcon} alt="Grid view" className="w-4 h-4" />
            Grid view
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 text-center text-sm">
        <div>
          <div className="text-gray-400">Current time</div>
          <div className="text-3xl">{currentTime}</div>
        </div>
        <div>
          <div className="text-gray-400">Elapsed time</div>
          <div className="text-3xl">{elapsedTime}</div>
        </div>
        <div>
          <div className="text-gray-400">Mission progress</div>
          <div className="text-3xl">{missionProgress}%</div>
        </div>
      </div>
    </div>
  );
}

function ManualControl() {
  return (
    <div className="p-4">
      <div className="text-sm text-gray-400 mb-2">Manual control</div>
      <div className="flex gap-2">
        <button className="text-sm px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          ⚠ Abort commands
        </button>
        <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2">
          <img src={radioIcon} alt="Radio" className="w-4 h-4" />
          Turn on radio
        </button>
        <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2">
          <img src={navIcon} alt="Navigation" className="w-4 h-4" />
          Navigation
        </button>
        <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2">
          <img src={speedIcon} alt="Speed" className="w-4 h-4" />
          Adjust speed
        </button>
      </div>
    </div>
  );
}
