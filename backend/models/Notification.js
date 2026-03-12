const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['new_match', 'new_message', 'application_update', 'general'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        // optional deep-link e.g. "/opportunities/123" or "/chat/roomId"
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
