import sun from "/public/icons/sun.svg";
import wind from "/public/icons/wind.svg";
import rain from "/public/icons/rain.svg";
import humid from "/public/icons/humid.svg";
import visible from "/public/icons/visible.svg";
export function StatusBar({
  environmentalReadings,
}: {
  environmentalReadings: {
    temperature: number;
    windSpeed: number;
    rain: number;
    humidity: number;
    visibility: number;
  };
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-[#2d2a2b] border-b border-gray-700">
      <div className="flex items-center gap-4 px-2">
        <span className="text-sm">Rover camera feed</span>
        <span className="text-red-500 text-sm">● Live</span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-1">
          <img src={sun} alt="Temperature" className="w-4 h-4 text-white" />
          {environmentalReadings.temperature}°
        </span>
        <span className="flex items-center gap-1">
          <img src={wind} alt="Wind" className="w-4 h-4 " />
          {environmentalReadings.windSpeed}mph
        </span>
        <span className="flex items-center gap-1">
          <img src={rain} alt="Rain" className="w-4 h-4 " />
          {environmentalReadings.rain}mm
        </span>
        <span className="flex items-center gap-1">
          <img src={humid} alt="Humidity" className="w-4 h-4 " />
          {environmentalReadings.humidity}% humid
        </span>
        <span className="flex items-center gap-1">
          <img src={visible} alt="Visibility" className="w-4 h-4 " />
          {environmentalReadings.visibility}mi visible
        </span>
      </div>
    </div>
  );
}
