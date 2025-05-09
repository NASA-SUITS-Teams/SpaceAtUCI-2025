//* handle audio messages from the client (unity app)
//* takes in audio message as input and returns the string transcription

import { ServerWebSocket } from "bun";
import { transcribeAudio } from "../utils/audioTranscription"; // TODO: service to transcribe audio
import { sendMessage } from "../ws/schema";

// data sent from the client and will be used to transcribe into string format
interface TranscriptionSession {
    sessionId: string;
    sampleRate: number;
    channels: number;
    audioChunks: Buffer[]; // array of audio chunks (ex: 100ms of audio as a series of bytes)
}

// store active transcription sessions as a map of sessionId to TranscriptionSession
const activeSessions: Map<string, TranscriptionSession> = new Map();

export async function handleAudioMessage(message: Buffer, ws: ServerWebSocket) {
    // route to appropriate handle based on the message type
    switch (message.type) {        
        case "start_transcription":
            handleStartTranscription(message, ws);
            break;
        // handle receiving message from the client
        case "audio_chunk":
            await handleAudioChunk(message, ws); 
            break;
        case "end_transcription":
            await handleEndTranscription(message, ws);
            break;
        default:
            console.log("Unknown message type");
            break;
    }
}

//----- Handler functions -----
function handleStartTranscription(message: any, ws: ServerWebSocket) {
    // channels is the number of audio channels in the stream (ex: 1 for mono, 2 for stereo)
    const { sessionId, sampleRate, channels } = message;

    if (!sessionId || !sampleRate || !channels) {
        sendMessage(ws, "error", { message: "Invalid start transcription message" }, false);
        return;
    }

    // create a new session
    activeSessions.set(sessionId, {
        sessionId: sessionId,
        sampleRate: sampleRate || 44100,
        channels: channels || 1,
        audioChunks: []
    });

    sendMessage(ws, "start_transcription_response", { sessionId: sessionId }, true);
}