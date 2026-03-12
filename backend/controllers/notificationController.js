const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.find({ user_id: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });

    } catch (error) {
        next(error);
    }
};


// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // Security check
        if (notification.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        notification.isRead = true;
        await notification.save();

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });

    } catch (error) {
        next(error);
    }
};


// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        if (notification.user_id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not authorized"
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getNotifications,
    markAsRead,
    deleteNotification
};