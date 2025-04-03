# Mission Control Interface (LMCC) Frontend for NASA SUITS 2025

Control interface for monitoring the EV Crew.

## System overview

There are three repositories that accompany this interface:

1. **Frontend**: Remix.js application (https://github.com/space-at-uci/frontend)
2. **Backend Server**: Express.js application (https://github.com/space-at-uci/backend)
3. **TSS Data/Telemetry Stream Server**: JSON stream server (https://github.com/SUITS-Techteam/TSS-2025)

We use a UDP Client to poll data in near real-time from the TSS server.

## Setup

First, clone all repositories. Then run the following commands in the root directory:

- Backend server: `npm install && npm run dev`
- TSS server: `./server.exe`
- Frontend: `npm install && npm run dev`
  The server will run on http://localhost:8000 and the frontend will run on http://localhost:3000.
