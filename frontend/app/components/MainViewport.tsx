type ViewMode = "single" | "grid";

import radio from "/public/icons/radio.svg";
import nav from "/public/icons/nav.svg";
import speed from "/public/icons/speed.svg";
import expand from "/public/icons/expand.svg";
import grid from "/public/icons/grid.svg";
import battery from "/public/icons/battery.svg";
import termometer from "/public/icons/termometer.svg";
import heart from "/public/icons/heart.svg";

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
        <CameraFeed />
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
            <img src={expand} alt="Expand" className="w-4 h-4" /> Single view
          </button>
          <button
            className="flex items-center gap-1 px-3 py-1 rounded hover:bg-gray-700"
            onClick={() => onViewModeChange("grid")}
          >
            <img src={grid} alt="Grid" className="w-4 h-4" /> Grid view
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

function CameraFeed() {
  return (
    <div className="border-b border-gray-700">
      <div className="relative aspect-video bg-black overflow-hidden">
        {/* Time and Progress Bar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="text-xl">12:34:35 AM</div>
          <div className="w-48 h-2 bg-gray-700 rounded-full">
            <div className="w-[78%] h-full bg-white rounded-full"></div>
          </div>
        </div>

        {/* Navigation Timeline */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded">
          <div className="flex items-center gap-2">
            <div className="text-cyan-400">Sample collection</div>
            <div>Navigate 1 km forward</div>
            <div className="text-gray-400">12:32:43 Min</div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {Array(10)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded ${
                    i < 5 ? "bg-cyan-400" : "bg-gray-600"
                  }`}
                />
              ))}
          </div>
        </div>

        {/* Compass */}
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gray-800/80 rounded-full">
          <div className="relative w-full h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
            </div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm">
              N
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm">
              E
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm">
              S
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm">
              W
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-2 bg-gray-900/80 p-2 rounded-lg">
          {/* Oxygen Level */}
          <div className="w-[64px] h-[64px] relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.93"
                strokeDashoffset="28.15"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs">O₂</div>
              <div className="text-xs">84%</div>
            </div>
          </div>

          {/* Heart Rate */}
          <div className="w-[64px] h-[64px] relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.93"
                strokeDashoffset="28.15"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={heart} alt="" className="w-4 h-4" />
              <div className="text-xs">84 bpm</div>
            </div>
          </div>

          {/* Temperature */}
          <div className="w-[64px] h-[64px] relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#EF4444"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.93"
                strokeDashoffset="28.15"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={termometer} alt="" className="w-4 h-4" />
              <div className="text-xs">84°C</div>
            </div>
          </div>

          {/* Battery Level */}
          <div className="w-[64px] h-[64px] relative">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#EAB308"
                strokeWidth="4"
                fill="none"
                strokeDasharray="175.93"
                strokeDashoffset="28.15"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img src={battery} alt="" className="w-4 h-4" />
              <div className="text-xs">84%</div>
            </div>
          </div>
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
          <img src={radio} alt="Radio" className="w-4 h-4" /> Turn on radio
        </button>
        <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2">
          <img src={nav} alt="Navigation" className="w-4 h-4" /> Navigation
        </button>
        <button className="text-sm px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center gap-2">
          <img src={speed} alt="Speed" className="w-4 h-4" /> Adjust speed
        </button>
      </div>
    </div>
  );
}
