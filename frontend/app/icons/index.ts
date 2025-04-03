// Placeholder icons for the application
// These would normally be actual SVG files

// Import SVG icons from public directory

// Helper function to import SVG files
const importSvg = (path: string): string => {
  // In a production environment, this would be the path to the SVG file
  // For development, we're constructing the URL to the public directory
  return `/icons/${path}`;
};

// Export icon paths
export const radioIcon = importSvg("radio.svg");
export const navIcon = importSvg("nav.svg");
export const speedIcon = importSvg("speed.svg");
export const expandIcon = importSvg("expand.svg");
export const gridIcon = importSvg("grid.svg");
export const batteryIcon = importSvg("battery.svg");
export const thermometerIcon = importSvg("termometer.svg"); // Note: file is named "termometer.svg" (missing 'h')
export const heartIcon = importSvg("heart.svg");
export const sunIcon = importSvg("sun.svg");
export const rainIcon = importSvg("rain.svg");
export const windIcon = importSvg("wind.svg");
export const humidIcon = importSvg("humid.svg");
export const visibleIcon = importSvg("visible.svg");
