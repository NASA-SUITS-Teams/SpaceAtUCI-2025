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
