// load environment variables
require('dotenv').config();

const db = require('./config/db');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./socket/index');

async function start() {
  await db.connect();

  const app = express();
  const port = process.env.PORT || 3000;

  // CORS for REST endpoints
  app.use(require('cors')());
  app.use(express.json());

  // Mount routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/opportunities', require('./routes/opportunities'));
  app.use('/api/matches', require('./routes/matches'));
  app.use('/api/chat', require('./routes/chat'));
  app.use('/api/notifications', require('./routes/notification'));
  app.use('/api/pickups', require('./routes/pickups'));
  app.use('/api/waste', require('./routes/waste'));

  app.get('/', (req, res) => {
    res.send('WasteZero Backend is running');
  });

  // Centralized Error Handler - MUST come after routes
  app.use(require('./middlewares/errorHandler'));

  // Create HTTP server and attach Socket.io
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Initialize all socket event handlers
  const onlineUsers = initSocket(io);

  // Expose io + onlineUsers so controllers can push real-time events
  // Usage in any controller: req.app.get('io'), req.app.get('onlineUsers')
  app.set('io', io);
  app.set('onlineUsers', onlineUsers);

  // Start the HTTP server
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Socket.io ready`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});