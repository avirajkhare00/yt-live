import express from "express";
import type { Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";

const PORT: string | number = process.env.PORT || 8000;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Store connected clients
interface Client {
  ws: WebSocket;
  id: string;
  type: 'streamer' | 'watcher';
}

const clients: Map<string, Client> = new Map();
const streamers: Set<string> = new Set();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));

app.get('/stream', async (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'stream.html'));
})

app.get('/watch', async (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'watch.html'));
});

app.get('/ping', async (_: Request, res: Response) => {
  res.json({ "status": "pong" });
});

// WebSocket signaling server
wss.on('connection', (ws: WebSocket) => {
  const clientId = generateId();
  console.log(`Client ${clientId} connected`);

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received from ${clientId}:`, data.type);

      switch (data.type) {
        case 'join':
          handleJoin(ws, clientId, data);
          break;
        case 'offer':
          handleOffer(clientId, data);
          break;
        case 'answer':
          handleAnswer(clientId, data);
          break;
        case 'ice-candidate':
          handleIceCandidate(clientId, data);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(clientId);
    streamers.delete(clientId);

    // Notify other clients about disconnection
    broadcast({
      type: 'user-disconnected',
      clientId
    }, clientId);
  });
});

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function handleJoin(ws: WebSocket, clientId: string, data: any) {
  const clientType = data.clientType || 'watcher';

  clients.set(clientId, {
    ws,
    id: clientId,
    type: clientType
  });

  if (clientType === 'streamer' && streamers.size < 2) {
    streamers.add(clientId);
    console.log(`Streamer ${clientId} joined. Total streamers: ${streamers.size}`);

    // Notify all clients about new streamer
    broadcast({
      type: 'streamer-joined',
      clientId,
      streamersCount: streamers.size
    }, clientId);

    // Tell this new streamer to create offers to all existing watchers
    clients.forEach((client, id) => {
      if (client.type === 'watcher') {
        ws.send(JSON.stringify({
          type: 'create-offer',
          targetId: id
        }));
      }
    });

    // If this is the second streamer, initiate connection
    if (streamers.size === 2) {
      const streamerIds = Array.from(streamers);
      const [firstStreamer, secondStreamer] = streamerIds;

      // Tell first streamer to create offer to second streamer
      const firstClient = clients.get(firstStreamer);
      if (firstClient) {
        firstClient.ws.send(JSON.stringify({
          type: 'create-offer',
          targetId: secondStreamer
        }));
      }
    }
  } else if (clientType === 'watcher') {
    console.log(`Watcher ${clientId} joined`);

    // Tell all streamers to create offers to this new watcher
    streamers.forEach(streamerId => {
      const streamerClient = clients.get(streamerId);
      if (streamerClient) {
        streamerClient.ws.send(JSON.stringify({
          type: 'create-offer',
          targetId: clientId
        }));
      }
    });

    // Send current streamers list to new watcher
    ws.send(JSON.stringify({
      type: 'streamers-list',
      streamers: Array.from(streamers)
    }));
  }

  ws.send(JSON.stringify({
    type: 'joined',
    clientId,
    clientType
  }));
}

function handleOffer(senderId: string, data: any) {
  const targetClient = clients.get(data.targetId);
  if (targetClient) {
    targetClient.ws.send(JSON.stringify({
      type: 'offer',
      offer: data.offer,
      senderId
    }));
  }
}

function handleAnswer(senderId: string, data: any) {
  const targetClient = clients.get(data.targetId);
  if (targetClient) {
    targetClient.ws.send(JSON.stringify({
      type: 'answer',
      answer: data.answer,
      senderId
    }));
  }
}

function handleIceCandidate(senderId: string, data: any) {
  const targetClient = clients.get(data.targetId);
  if (targetClient) {
    targetClient.ws.send(JSON.stringify({
      type: 'ice-candidate',
      candidate: data.candidate,
      senderId
    }));
  }
}

function broadcast(message: any, excludeId?: string) {
  clients.forEach((client, id) => {
    if (id !== excludeId) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
