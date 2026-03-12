const Message = require('../models/Message');  // fixed: capital M
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

// GET /api/chat/:roomId → fetch messages for a room (with pagination + names)
const getMessages = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ roomId })
        .populate('sender_id', 'name')
        .populate('receiver_id', 'name')
        .sort({ createdAt: 1 })   // oldest first
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        count: messages.length,
        page,
        data: messages
    });
});

// POST /api/chat → save a message (REST fallback; socket is primary)
const postMessage = asyncHandler(async (req, res) => {
    let { roomId, sender_id, receiver_id, content } = req.body;

    // Auto-generate roomId if not provided
    if (!roomId) {
        roomId = Message.getRoomId(sender_id, receiver_id);
    }

    const newMessage = await Message.create({ roomId, sender_id, receiver_id, content });

    res.status(201).json({ success: true, data: newMessage });
});

// GET /api/chat/conversations/list → all conversations for logged-in user with unread counts
const getConversations = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender_id: mongoose.Types.ObjectId.createFromHexString(userId) },
                    { receiver_id: mongoose.Types.ObjectId.createFromHexString(userId) }
                ]
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $group: {
                _id: '$roomId',
                lastMessage: { $first: '$$ROOT' }
            }
        },
        { $sort: { 'lastMessage.createdAt': -1 } }
    ]);

    const populated = await Message.populate(
        conversations.map(c => c.lastMessage),
        [
            { path: 'sender_id', select: 'name' },
            { path: 'receiver_id', select: 'name' }
        ]
    );

    const roomIds = conversations.map(c => c._id);
    const unreadCounts = await Message.aggregate([
        {
            $match: {
                roomId: { $in: roomIds },
                receiver_id: mongoose.Types.ObjectId.createFromHexString(userId),
                isRead: false
            }
        },
        { $group: { _id: '$roomId', count: { $sum: 1 } } }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(u => { unreadMap[u._id] = u.count; });

    const result = populated.map((msg, i) => ({
        roomId: conversations[i]._id,
        lastMessage: msg,
        unreadCount: unreadMap[conversations[i]._id] || 0
    }));

    res.status(200).json({ success: true, data: result });
});

module.exports = { getMessages, postMessage, getConversations };
