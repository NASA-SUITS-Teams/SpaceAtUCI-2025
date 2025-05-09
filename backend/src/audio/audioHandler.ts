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
// handles incoming audio chunks from the client
// audio chunks are added to the active session
function handleAudioChunk(message: any, ws: ServerWebSocket) {
    const { sessionId, chunk } = message;

    if (!sessionId || !chunk) {
        sendMessage(ws, "error", { message: "Invalid audio chunk message" }, false);
        return;
    }
    // get the current session from the session ID
    const session = activeSessions.get(sessionId);
    if (!session) {
        sendMessage(ws, "error", { message: "Session not found" }, false);
        return;
    }

    // turn base64 audio chunk into a buffer of bytes
    // this will be used to transcribe the audio
    // base64 is easier to send over the network while bytes is easier to process
    const audioBuffer = Buffer.from(chunk, "base64");

    // store the byte representation of the chunk to the session list 
    session.audioChunks.push(audioBuffer);

    // transcribe each chunk as it comes in
    // transcribe every 3 chunks at a time
    // combined chunks into a single buffer
    // prepares the transcription to send back to the client
    if (session.audioChunks.length % 3 === 0) {
        const recentChunks = session.audioChunks.slice(-3);
        const combinedAudio = Buffer.concat(recentChunks); 
        const transcription = await transcribeAudio(combinedAudio, session.sampleRate, session.channels);
        sendMessage(ws, "transcription_result", { transcription: transcription }, true);
    }
}

async function handleEndTranscription(message: any, ws: ServerWebSocket) {
    const { sessionId } = message;

    if (!sessionId) {
        sendMessage(ws, "error", { message: "Invalid end transcription message" }, false);
        return;
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
        sendMessage(ws, "error", { message: "Session not found" }, false);
        return;
    }

    // combine all audio chunks
    const combinedAudio = Buffer.concat(session.audioChunks);
    const finalTranscription = await transcribeAudio(combinedAudio, session.sampleRate, session.channels);
    
    // send transcription to client via websocket
    sendMessage(ws, "transcription_complete", {
        sessionId: sessionId,
        transcription: finalTranscription
    }, true);

    // clear the session
    activeSessions.delete(sessionId);
    console.log("Session cleared");
}