// sample data types
export enum PollingRate {
    HIGH_FREQUENCY = 1000, // every millisecond
    LOW_FREQUENCY = 60000 // every minute
}

// define data structures
export type DataType = {
    HIGH_FREQUENCY: HighFrequencyData;
    LOW_FREQUENCY: LowFrequencyData;
}
export interface TelemetryData {
    timestamp: number;
    data: any;
    value: number;
}

export interface HighFrequencyData extends TelemetryData {
    type: 'high-frequency';
    // TODO: replace with actual data types
    data: {
        heartRate: number | null;
        oxygenSaturation: number | null;
        respiratoryRate: number | null;
        temperature: number | null;
    }
}

export interface LowFrequencyData extends TelemetryData {
    type: 'low-frequency';
    // TODO: replace with actual data types
    data: {
        rockSample: Array<{
            id: string;
            location: string;
            timestamp: number;
            data: any;
        }>
    }
}

// define endpoints for tss
export const TSS_CONFIG = {
    BASE_URL: process.env.TSS_URL || 'http://localhost:3000', // testing on localhost
    ENDPOINTS: {
        // TODO: replace with actual endpoints
        'high-frequency': '/tss/high',
        'low-frequency': '/tss/low'
    }
} as const; // type safety