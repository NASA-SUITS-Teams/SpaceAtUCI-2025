// connects with the udpClient on the backend server to receive messages
import { createSocket } from 'dgram';

interface UDPClientProps {
    port: number;
    address: string;
    onMessage: (data: unknown) => void;
    onError?: (error: Error) => void;
}

export class UDPClient {
    private socket: ReturnType<typeof createSocket> | null = null;
    private props: UDPClientProps;
    private isConnected: boolean = false;

    constructor(props: UDPClientProps) {
        this.props = props;
    }

    // functions to facilitate message handling
    connect() : void {
        if (this.isConnected) return;

        try {
            this.socket = createSocket('udp4');

            // make sure the socket is listening to the port and address
            this.socket.on('listening', () => {
                console.log('udp client connected');
                this.isConnected = true;
            })

            // receive messages from the backend server
            this.socket.on('message', (message) => {
                try {
                    const data = JSON.parse(message.toString());
                    this.props.onMessage(data);
                    console.log('received message: ', data); 
                } catch (error) {
                    console.error('Error parsing message: ', error);
                }
            });

            // catch errors
            this.socket.on('error', (error) => {
                console.error('udp client error: ', error);
                if(this.props.onError) this.props.onError(error);
                this.close();
            });

            // bind the socket if there is no error
            this.socket.bind(this.props.port, this.props.address);
        } catch (error) {
            console.error('Error connecting to udp client: ', error);
        }
    }
    // additional status functions
    close() : void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
            console.log('udp client disconnected');
        }
    }
    isActive(): boolean {
        return this.isConnected;
    }
}