const Message = require('../models/message');
const asyncHandler = require('express-async-handler');

// GET /api/chat/:roomId → fetch messages for a room
const getMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: messages });
});

// POST /api/chat → save a message
const postMessage = asyncHandler(async (req, res) => {
    let { roomId, sender_id, receiver_id, content } = req.body;

    // Generate roomId if not provided
    if (!roomId) {
        roomId = Message.getRoomId(sender_id, receiver_id);
    }

    const newMessage = await Message.create({ roomId, sender_id, receiver_id, content });

    res.status(201).json({ success: true, data: newMessage });
});

module.exports = { getMessages, postMessage };