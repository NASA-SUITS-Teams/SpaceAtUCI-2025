type Task = {
  label: string;
  duration: string;
  risk: string;
  status: "active" | "complete" | "pending";
};

export function RightSidebar() {
  const tasks: Task[] = [
    {
      label: "EV1 and EV2 connect UIA and DCU umbilical",
      duration: "23 seconds",
      risk: "Low risk",
      status: "active",
    },
    {
      label: "Turn on depress pump power",
      duration: "23 seconds",
      risk: "Low risk",
      status: "complete",
    },
    {
      label: "Check battery level of UMB is nominal",
      duration: "23 seconds",
      risk: "Low risk",
      status: "complete",
    },
    {
      label: "EV1 and EV2 turn power on",
      duration: "23 seconds",
      risk: "Low risk",
      status: "complete",
    },
  ];

  return (
    <div className="bg-[#2d2a2b] border border-gray-700 p-4 rounded-lg h-fit">
      <h2 className="font-bold mb-4 text-sm">Connect UIA to DCU</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">ETA</span>
          <span>3:34 min</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Risk</span>
          <span>Medium</span>
        </div>

        <div className="relative mt-8">
          {/* Vertical line connecting the circles */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-600" />

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <TaskItem key={index} {...task} />
            ))}
          </div>
        </div>
      </div>

      <button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded text-sm">
        Send commands
      </button>
    </div>
  );
}

function TaskItem({ label, duration, risk, status }: Task) {
  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return {
          circle: "bg-cyan-500 ring-2 ring-cyan-300 ring-opacity-50",
          card: "ring-2 ring-cyan-500 ring-opacity-50",
        };
      case "complete":
        return {
          circle: "bg-gray-500",
          card: "",
        };
      default:
        return {
          circle: "bg-gray-600",
          card: "",
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className="relative flex gap-4">
      <div
        className={`w-5 h-5 rounded-full ${styles.circle} flex items-center justify-center flex-shrink-0`}
      >
        {status === "complete" && (
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
        )}
      </div>
      <div className={`flex-grow p-3 bg-gray-700 rounded ${styles.card}`}>
        <div className="flex items-center gap-2 text-sm">
          <span>{label}</span>
        </div>
        <div className="mt-2 text-sm text-gray-400 flex gap-4">
          <span>{duration}</span>
          <span>{risk}</span>
        </div>
      </div>
    </div>
  );
}
