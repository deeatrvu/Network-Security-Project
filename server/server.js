const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const { sequelize, connectDB } = require('./config/db');
const WebSocket = require('ws');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const votingRoutes = require('./routes/voting');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/votes', votingRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to broadcast messages to all connected clients
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = { broadcast }; 