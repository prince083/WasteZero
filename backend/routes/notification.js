const express = require('express');
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

const protect = require('../middlewares/auth');
const { validate, notificationIdSchema } = require('../middlewares/validation');


// GET all notifications of logged-in user
router.get('/', protect, getNotifications);

// Mark a notification as read
router.patch('/:id/read', protect, validate(notificationIdSchema, 'params'), markAsRead);

// Delete a notification
router.delete('/:id', protect, validate(notificationIdSchema, 'params'), deleteNotification);

module.exports = router;