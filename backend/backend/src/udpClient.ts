
// connects with the frontend server to send messages and commands and receive the result
import * as dgram from "node:dgram"
class UDPClient {
    private client: dgram.Socket;
    private TSS_PORT = 14141;
    private TSS_IP = '172.31.130.188:14141';

    constructor() {
        this.client = dgram.createSocket('udp4');
        this.setUpEventHandlers();
    }

    private setUpEventHandlers() {
        this.client.on('error', (err: any) => {
            console.error(`server error:\n${err.stack}`);
            this.client.close();
        });
    
        this.client.on("message", (message, remote) => {
            console.log(`UDP message received from: ${remote.address}:${remote.port} - ${message}`);
            this.parseMessage(message);
        });
    }

    // public startListening() {
    //     try {
    //         this.client.bind(this.TSS_PORT, () => {
    //             console.log(`UDP server listening on port ${this.TSS_PORT}`);
    //         })
    //     } catch (error) {
    //         console.error(`UDP server bind error:`, error);
    //     }
    // }

    public sendMessage(message: string, host: string)  {
        this.client.send(message, 0, message.length, this.TSS_PORT, host, (err) => {
            if (err) {
                console.error(`UDP message send error:`, err);
            } else {
                console.log(`UDP message sent to ${host}:${this.TSS_PORT}`);
            }
        }); 
    };

    private parseMessage(message: Buffer) {
        const timestamp = message.readUInt32BE(0);
        const command = message.readInt32BE(4);
        const data  = message.slice(8).toString('utf-8');

        console.log(`Timestamp: ${timestamp}, Command: ${command}, Data: ${data}`);

        try {
            const jsonData = JSON.parse(data);
            console.log(`Parsed JSON: ${jsonData}`);
        } catch (error) {
            console.error(`Error parsing JSON: ${error}`);
        } 
    }

    public sendCommand(command: number, value: number) {
        /**
         * command corresponds to the command id (ex: set speed)
         * value corresponds to the number to set the command to (ex: 8 m/s)
         */
        // buffer to store the command in numbers
        const buffer = Buffer.alloc(12); 
        const timestamp = Math.floor(Date.now() / 1000);

        // write to buffer
        buffer.writeUInt32BE(timestamp, 0);
        buffer.writeUInt32BE(command, 4);
        buffer.writeFloatBE(value, 8);

        // send the buffer to the port
        this.client.send(buffer, 0, buffer.length, this.TSS_PORT, this.TSS_IP, (err) =>{
            if (err) {
                console.error(`UDP message send error:`, err);
            } else {
                console.log(`Command sent to ${this.TSS_IP}:${this.TSS_PORT}`);
            }
        })

    }
}

export const udpClient = new UDPClient();

//* tests
// udpClient.startListening(); 
udpClient.sendMessage('Test message', 'localhost');
udpClient.sendCommand(16, 0.0); // get dcu data
