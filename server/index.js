const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-streamer-room', (streamerId) => {
        socket.join(streamerId);
        console.log(`User ${socket.id} joined room: ${streamerId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Basic Route
app.get('/', (req, res) => {
    res.send('WaveTipz API is running...');
});

// Routes
app.use('/api/profile', require('./routes/profile'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export io to be used in controllers
module.exports = { io };
