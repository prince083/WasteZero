const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Map: userId (string) → socket.id
// This lets us find which socket belongs to a user for direct notifications
const onlineUsers = new Map();

/**
 * Initialize all Socket.io event handlers
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        // ─────────────────────────────────────────────
        // EVENT: user_online
        // Client sends their userId so we can record them as online
        // ─────────────────────────────────────────────
        socket.on('user_online', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`[Socket] User online: ${userId}`);
        });

        // ─────────────────────────────────────────────
        // EVENT: join_room
        // Client joins a chat room (roomId = sorted userId1_userId2)
        // ─────────────────────────────────────────────
        socket.on('join_room', ({ roomId }) => {
            socket.join(roomId);
            console.log(`[Socket] Socket ${socket.id} joined room: ${roomId}`);
        });

        // ─────────────────────────────────────────────
        // EVENT: send_message
        // Client sends a new chat message
        // Payload: { roomId, senderId, receiverId, content }
        // ─────────────────────────────────────────────
        socket.on('send_message', async ({ roomId, senderId, receiverId, content }) => {
            try {
                // Save message to DB
                const message = await Message.create({
                    roomId,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content
                });

                const messageData = {
                    _id: message._id,
                    roomId,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content,
                    createdAt: message.createdAt
                };

                // Broadcast to everyone in the room (including sender)
                io.to(roomId).emit('receive_message', messageData);

                // Send real-time notification to receiver if they're online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    // Create notification in DB
                    const notification = await Notification.create({
                        user_id: receiverId,
                        type: 'new_message',
                        message: `You have a new message`,
                        link: `/chat/${roomId}`
                    });
                    // Push live notification event to receiver
                    io.to(receiverSocketId).emit('new_notification', {
                        _id: notification._id,
                        type: notification.type,
                        message: notification.message,
                        link: notification.link,
                        createdAt: notification.createdAt
                    });
                }
            } catch (err) {
                console.error('[Socket] send_message error:', err.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // ─────────────────────────────────────────────
        // EVENT: mark_messages_read
        // Update all unread messages in a room as read
        // Payload: { roomId, userId }
        // ─────────────────────────────────────────────
        socket.on('mark_messages_read', async ({ roomId, userId }) => {
            try {
                await Message.updateMany(
                    { roomId, receiver_id: userId, isRead: false },
                    { isRead: true }
                );
            } catch (err) {
                console.error('[Socket] mark_messages_read error:', err.message);
            }
        });

        // ─────────────────────────────────────────────
        // EVENT: disconnect
        // Remove user from online map when they disconnect
        // ─────────────────────────────────────────────
        socket.on('disconnect', () => {
            onlineUsers.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    console.log(`[Socket] User offline: ${userId}`);
                }
            });
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    // Return the shared map so server.js can expose it via app.set()
    return onlineUsers;
}

module.exports = { initSocket, onlineUsers };
