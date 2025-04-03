import { useEffect, useRef, useState } from "react";
import { batteryIcon, thermometerIcon, heartIcon } from "../icons";

interface CameraFeedProps {
  serverUrl?: string;
}

export default function CameraFeed({
  serverUrl = "ws://localhost:8000/ws/camera-stream",
}: CameraFeedProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    // Clean up previous connection if exists
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    // Set up event handlers
    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Failed to connect to camera stream");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle error messages
        if (data.error) {
          setError(data.error);
          return;
        }

        // Update image with new frame
        if (data.frame && imageRef.current) {
          imageRef.current.src = `data:image/jpeg;base64,${data.frame}`;

          // Calculate FPS
          const now = performance.now();
          frameCountRef.current++;

          if (lastFrameTimeRef.current) {
            const delta = now - lastFrameTimeRef.current;
            if (delta >= 1000) {
              setFps(Math.round((frameCountRef.current * 1000) / delta));
              frameCountRef.current = 0;
              lastFrameTimeRef.current = now;
            }
          } else {
            lastFrameTimeRef.current = now;
          }
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
      }
    };
  }, [serverUrl]);

  return (
    <div className="border-b border-gray-700">
      <div className="relative aspect-video bg-black overflow-hidden">
        {/* Camera Feed */}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : !isConnected ? (
          <div className="absolute inset-0 flex items-center justify-center">
            Connecting to camera...
          </div>
        ) : (
          <img
            ref={imageRef}
            className="w-full h-full object-cover"
            alt="Camera Feed"
          />
        )}

        {/* Time and FPS */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="text-xl">{new Date().toLocaleTimeString()}</div>
          <div className="text-sm">FPS: {fps}</div>
          <div className="w-48 h-2 bg-gray-700 rounded-full">
            <div className="w-[78%] h-full bg-white rounded-full"></div>
          </div>
        </div>

        {/* Navigation Timeline */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded">
          <div className="flex items-center gap-2">
            <div className="text-cyan-400">YOLOv8 Detection</div>
            <div>Bounding Boxes + Segmentation</div>
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

        {/* Detection Info */}
        <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-2 rounded text-xs">
          <div className="text-cyan-400 mb-1">Object Detection</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span>Bounding Boxes:</span>
              <span className="text-green-400">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Segmentation:</span>
              <span className="text-green-400">Contours Only</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Model:</span>
              <span className="text-white">YOLOv8n-seg</span>
            </div>
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
              <img src={heartIcon} alt="Heart rate" className="w-4 h-4" />
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
              <img
                src={thermometerIcon}
                alt="Temperature"
                className="w-4 h-4"
              />
              <div className="text-xs">72°F</div>
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
              <img src={batteryIcon} alt="Battery" className="w-4 h-4" />
              <div className="text-xs">85%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
