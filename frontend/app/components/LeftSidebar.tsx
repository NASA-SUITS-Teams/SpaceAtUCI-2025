type CrewMember = {
  heartRate: number;
  oxygenTank: number;
  bloodPressure: number;
  temperature: number;
};

type RoverStats = {
  heading: number;
  speed: number;
  battery: number;
  temperature: number;
};

type ScienceSample = {
  id: string;
  properties: string[];
};

export function LeftSidebar({
  rover,
  crew,
  samples,
}: {
  rover: RoverStats;
  crew: {
    ev1: CrewMember;
    ev2: CrewMember;
  };
  samples: ScienceSample[];
}) {
  return (
    <div className="space-y-2">
      <div className="bg-[#2d2a2b] border border-gray-700 p-4 rounded-lg">
        <h2 className="font-bold text-sm">LTV</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Heading</div>
              <div className="text-lg">{rover.heading}°</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Speed</div>
              <div className="text-lg">{rover.speed} km/h</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Battery</div>
              <div className="text-lg">{rover.battery}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Temperature</div>
              <div className="text-lg">{rover.temperature}°F</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d2a2b] border border-gray-700 p-4 rounded-lg">
        <h2 className="font-bold">Crew</h2>
        <div className="space-y-4">
          <CrewStatus label="EV1" stats={crew.ev1} />
          <CrewStatus label="EV2" stats={crew.ev2} />
        </div>
      </div>

      <div className="bg-[#2d2a2b] border border-gray-700 p-4 rounded-lg">
        <h2 className="font-bold mb-2">Science</h2>
        <div className="space-y-2">
          {samples.map((sample) => (
            <div
              key={sample.id}
              className="p-3 bg-gray-700 rounded flex items-center space-x-3"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <div>
                <div className="font-medium">Sample {sample.id}</div>
                <div className="text-sm text-gray-400">
                  {sample.properties.join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrewStatus({ label, stats }: { label: string; stats: CrewMember }) {
  return (
    <div className="">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-300">👤</span>
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-400 text-sm">Nominal</span>
          <button className="text-gray-400 hover:text-white">
            {label === "EV1" ? "▼" : "▶"}
          </button>
        </div>
      </div>

      {label === "EV1" ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Heart rate</span>
            <div className="flex items-center gap-2">
              <span>{stats.heartRate} BPM</span>
              <svg className="w-20 h-6" viewBox="0 0 100 24">
                <path
                  d="M 0,12 L 10,12 L 20,4 L 30,20 L 40,12 L 50,12"
                  stroke="rgb(34, 211, 238)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Oxygen tank</span>
            <div className="flex items-center gap-2">
              <span>{stats.oxygenTank}%</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-4 ${
                      i <= stats.oxygenTank / 20 ? "bg-cyan-400" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Blood pressure</div>
              <div>{stats.bloodPressure} spO2</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Temperature</div>
              <div>{stats.temperature}°F</div>
            </div>
          </div>

          <div className="relative aspect-video bg-gray-900 rounded overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-600">Camera Feed</span>
            </div>
            <div className="absolute bottom-2 right-2 flex gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 text-xs">1</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 text-xs">2</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-400 text-xs">3</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">O₂</span>
              <span>{stats.oxygenTank}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">♡</span>
              <span>{stats.heartRate} BPM</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-cyan-400">🌡️</span>
              <span>{stats.temperature}°F</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
