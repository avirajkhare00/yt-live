## yt-live

### Overview

A simple WebRTC-based live streaming proof-of-concept that allows users to stream their webcam and microphone. Built with Node.js, Express, WebSocket, and WebRTC.

### Features

- **Stream your webcam and microphone** via WebRTC
- **Watch streams** from multiple participants
- **Supports 2 streamers** connecting to each other via WebRTC
- **Multiple viewers** can watch both participant streams simultaneously
- **Real-time signaling** via WebSocket
- **Simple, clean UI** with connection status indicators

### Architecture

1. **Client 1 and Client 2** connect to the server first
2. They establish **peer-to-peer WebRTC connections** with each other
3. **Client 3 (and more)** can watch both participants' streams
4. **WebSocket server** handles signaling for WebRTC connections

### Installation

```bash
git clone https://github.com/avirajkhare00/yt-live
cd yt-live
npm install
```

### Usage

#### Development Mode

```bash
npm run dev
```

#### Docker

```bash
docker-compose up
```

The server will run on `http://localhost:8000`

#### Testing the Application

1. **Start 2 streamers:**
   - Open `http://localhost:8000/stream` in two different browser tabs/windows
   - Click "Start Streaming" in both tabs
   - Allow camera/microphone access when prompted
   - They should automatically connect to each other

2. **Add viewers:**
   - Open `http://localhost:8000/watch` in additional browser tabs
   - Click "Connect" to start watching
   - You should see both streamers' video feeds

#### Endpoints

- `/stream` - Streaming interface for participants
- `/watch` - Viewing interface for watchers
- `/ping` - Health check endpoint

### Tech Stack

- **Backend:** Node.js, Express, WebSocket (ws)
- **Frontend:** Vanilla JavaScript, WebRTC API
- **Signaling:** WebSocket for offer/answer/ICE candidate exchange
- **Containerization:** Docker

### Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Camera and microphone permissions required for streaming
- HTTPS recommended for production (required for camera access on some browsers)

### Limitations

- This is a **proof-of-concept** - keep it simple!
- Supports **2 primary streamers** maximum
- No authentication or room management
- No recording or persistent storage
- Basic error handling

### TODO

- [x] Complete README
- [x] Add MIT License
- [x] Add /ping api endpoint
- [x] Add `Dockerfile`
- [x] Add `docker-compose.yml` file
- [x] Create `/stream` endpoint and serve static page
- [x] Create `/watch` endpoint and serve static page
- [x] Implement WebRTC streaming functionality
- [x] Add WebSocket signaling server
- [x] Support multiple viewers
