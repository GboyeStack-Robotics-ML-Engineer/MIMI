require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GeminiLiveBridge = require('./services/GeminiLiveBridge');

const app = express();
app.use(cors());

// Health Check / Root Route
app.get('/', (req, res) => {
    res.send('MIMI Server is Running 🚀');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Initialize Gemini Bridge for this user
    const gemini = new GeminiLiveBridge(socket);
    gemini.connect();

    socket.emit('status', { status: 'connected', message: 'Gemini Live Ready' });

    // Handle Audio Stream from Client (PCM)
    let audioChunkCount = 0;
    socket.on('audio-input', (data) => {
        audioChunkCount++;
        if (audioChunkCount % 50 === 0) { // Log every 50th chunk to avoid spam
            console.log(`Audio chunks received: ${audioChunkCount} (last size: ${data.byteLength} bytes)`);
        }
        gemini.sendAudioInput(Buffer.from(data));
    });

    // Handle Text Input from Client
    socket.on('text-input', (textMessage) => {
        console.log('📝 Text message received:', textMessage);
        gemini.sendTextInput(textMessage);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Clean up Gemini connection if needed
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
