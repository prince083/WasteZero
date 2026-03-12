const express = require('express');
const router = express.Router();
const { getMessages, postMessage, getConversations } = require('../controllers/chatController');
const authMiddleware = require('../middlewares/auth');
const { validate, createMessageSchema, getMessagesSchema } = require('../middlewares/validation');

// GET all conversations for logged-in user (must be before /:roomId to avoid conflict)
router.get('/conversations/list', authMiddleware, getConversations);

// Fetch messages in a room
router.get('/:roomId', authMiddleware, validate(getMessagesSchema, 'params'), getMessages);

// Send a new message (REST fallback)
router.post('/', authMiddleware, validate(createMessageSchema, 'body'), postMessage);

module.exports = router;