const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth');
const { validate, createMessageSchema, getMessagesSchema } = require('../middlewares/validation');

// Fetch messages in a room
router.get('/:roomId', authMiddleware, validate(getMessagesSchema, 'params'), getMessages);

// Send a new message
router.post('/', authMiddleware, validate(createMessageSchema, 'body'), postMessage);

module.exports = router;