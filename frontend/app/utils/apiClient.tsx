// fetch data from the backend server
import { useState, useEffect } from 'react';
import { UIAData, DCUData } from '../types';

// primary interface for telemetry data
interface TelemetryData {
    connection: string;
    currentTime: string;
    elapsedTime: string;
    missionProgress: number;
    rover: {
        heading: number;
        speed: number;
        battery: number;
        temperature: number;
    };
    crew: {
        ev1: {
          heartRate: number;
          oxygenTank: number;
          bloodPressure: number;
          temperature: number;
        };
        ev2: {
          heartRate: number;
          oxygenTank: number;
          bloodPressure: number;
          temperature: number;
        };
      };
      environmentalReadings: {
        temperature: number;
        rain: number;
        humidity: number;
        visibility: number;
        windSpeed: number;
      };
      samples: {
        id: string;
        properties: string[];
      }[];
      uiaData?: UIAData;
      dcuData?: DCUData;
}

// fetch telemetry (ex: rover and crew data)
export function useTelemetry(pollingInterval = 1000): {
    data: TelemetryData | null;
    loading: boolean;
    error: Error | null;
} {
    const [data, setData] = useState<TelemetryData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true; // check that component is on the page
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/telemetry');
                if (!response.ok) {throw new Error('Failed to fetch telemetry data');}
                const result = await response.json(); // parse response from JSON
                if (isMounted) {
                    setData(result);
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {   
                    setError(error as Error);
                    setLoading(false);
                }
            }
        };
        fetchData();
        const intervalId = setInterval(fetchData, pollingInterval);
        return () => {
            isMounted = false;
            clearInterval(intervalId); // clear interval when component is not on the page
        }
    }, [pollingInterval]);

    return { data, loading, error };
}

// fetch DCU data (ex: battery of the display control unit)

// fetch UIA data (ex: battery of the user interface and audio unit)

// function to send commands