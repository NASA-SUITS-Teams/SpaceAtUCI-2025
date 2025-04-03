import { HighFrequencyData, LowFrequencyData, TelemetryData, DataType, PollingRate, TSS_CONFIG } from "./types";
import { wsManager } from "../ws/manager";

/**
 * Fetches data from the TSS at regular intervals and sends to listeners
 */
export class PollingClient {
    private interval: PollingRate;
    private isPolling: boolean = false;
    private listeners: ((data: TelemetryData) => void)[] = [];  // listens for data from tss
    private dataType: keyof typeof TSS_CONFIG.ENDPOINTS; // high-frequency or low-frequency

    // initialize polling rate for each data type
    constructor(dataType: keyof typeof TSS_CONFIG.ENDPOINTS) { // match datatypes to endpoints
        this.dataType = dataType;

        this.interval = dataType === 'high-frequency' 
            ? PollingRate.HIGH_FREQUENCY 
            : PollingRate.LOW_FREQUENCY;
    }

    // get endpoint for each data 
    private getEndpoint(): string {
        const endpoint = TSS_CONFIG.ENDPOINTS[this.dataType];
        return `${TSS_CONFIG.BASE_URL}${endpoint}`; // ex: http://localhost:3000/tss/high
    }

    // polling methods
    public start(): void {
        if (this.isPolling) return;
        this.isPolling = true;
        this.poll(); 
    }

    public stop(): void{
        this.isPolling = false;
    }

    // pull data from tss
    public addListener(callback: (data: TelemetryData) => void): void {
        this.listeners.push(callback);
    }

    // remove the callback function from all listeners
    public removeListener(callback: (data: TelemetryData) => void): void {
        this.listeners = this.listeners.filter(listener => listener != callback);
    }

    // polling loop without returning a value
    private async poll(): Promise<void> {
        while (this.isPolling) {
            try{
                const data = await this.fetchData();

                // broadcasts data to all ws clients (ex: frontend ui, hmd, etc)
                wsManager.publish_all({
                    type: this.dataType,
                    data,
                    success: true
                // callback function sends data to listeners
                }, data, (wsData) => {
                    this.listeners.forEach(listener => listener(wsData));
                    console.log(`${this.dataType} data received and published to listeners`)
                });
            } catch (error) {
                console.error(`Error fetching ${this.dataType} data:`, error);
            }

            // wait for the interval before polling again
            await new Promise(resolve => setTimeout(resolve, this.interval));
        }
    }

    // fetch data from tss
    private async fetchData(): Promise<TelemetryData> {
        // TODO: replace with actual data fetching logic
        try {
            const response = await fetch(this.getEndpoint());
            if (!response.ok) {
                throw new Error(`Failed to fetch ${this.dataType} data: ${response.statusText}`);
            }
            
            const data = await response.json();
            return {
                ...data,
                type: this.dataType
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
        
    }

}