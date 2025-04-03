# Mission Control Interface (LMCC) Frontend for NASA SUITS 2025

Control interface for monitoring the EV Crew.

## System overview

There are three repositories that accompany this interface:

1. **Frontend**: Remix.js application 
2. **Backend Server**: Bun.js application with Hono
3. **TSS Data/Telemetry Stream Server**: JSON stream server (https://github.com/SUITS-Techteam/TSS-2025)

## Tech Stack
Our tech stack is designed for ultra-low latency and real-time data streaming.
- Bun is a fast Javascript runtime that replaces Node.js that runs typescript faster than Node. 
- Hono is a fast HTTP framework for Bun.js that quickly handles API requests with a built-in websocket server. Replaces Express.js. 
- Remix.js is a frontend framework for React that renders UI and handles API requests faster. It fetches data from the server-side first to reduce latency.
- UDP is a fast communication protocol that streams data between the backend server and the TSS server in near real-time.

[insert diagram of tech stack here in the future]

## Setup

- Backend server in terminal 1: ` cd backend && npm install && npm run dev`
- TSS server (clone the repository and run this in the terminal): ` ./server.exe`
- Frontend in terminal 2: ` cd frontend && npm install && npm run dev`
  The backend server will run on http://localhost:3000 and the frontend will run on http://localhost:3000.

