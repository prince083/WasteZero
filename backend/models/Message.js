const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true  // index for fast room-based queries
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Helper: generate a consistent roomId from two user IDs
MessageSchema.statics.getRoomId = function (userId1, userId2) {
    return [userId1.toString(), userId2.toString()].sort().join('_');
};

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);
