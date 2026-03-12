const Pickup = require('../models/Pickup');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// POST /api/pickups
// Volunteer schedules a new waste pickup
// Auto-assigns the nearest available NGO agent
// ─────────────────────────────────────────────────────────────
const createPickup = async (req, res, next) => {
    try {
        const { category, scheduled_time, address, location, notes } = req.body;
        const userId = req.user.id;

        // Find nearest NGO by geographic proximity using $near
        let nearestAgent = null;

        if (location && location.coordinates &&
            location.coordinates[0] !== 0 && location.coordinates[1] !== 0) {

            nearestAgent = await User.findOne({
                role: 'ngo',
                status: 'active',
                location: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: location.coordinates   // [lng, lat]
                        },
                        $maxDistance: 50000   // 50 km radius
                    }
                }
            });
        }

        // Fallback: assign any active NGO if none nearby found
        if (!nearestAgent) {
            nearestAgent = await User.findOne({ role: 'ngo', status: 'active' });
        }

        const pickup = await Pickup.create({
            user_id: userId,
            category,
            scheduled_time,
            address,
            location: location || { type: 'Point', coordinates: [0, 0] },
            notes: notes || '',
            agent_id: nearestAgent ? nearestAgent._id : null,
            status: nearestAgent ? 'assigned' : 'pending'
        });

        // Notify the assigned NGO agent if one was found
        if (nearestAgent) {
            await Notification.create({
                user_id: nearestAgent._id,
                type: 'general',
                message: `New pickup assigned to you: ${category} waste at ${address}`,
                link: `/pickups/${pickup._id}`
            });
        }

        const populated = await Pickup.findById(pickup._id)
            .populate('user_id', 'name email')
            .populate('agent_id', 'name email');

        res.status(201).json({
            success: true,
            message: nearestAgent
                ? `Pickup scheduled and assigned to ${nearestAgent.name}`
                : 'Pickup scheduled — agent will be assigned shortly',
            data: populated
        });

    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/pickups/my
// Volunteer sees their own scheduled pickups
// ─────────────────────────────────────────────────────────────
const getMyPickups = async (req, res, next) => {
    try {
        const pickups = await Pickup.find({ user_id: req.user.id })
            .populate('agent_id', 'name email address')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pickups.length,
            data: pickups
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/pickups/assigned
// NGO agent sees pickups assigned to them
// ─────────────────────────────────────────────────────────────
const getAssignedPickups = async (req, res, next) => {
    try {
        const pickups = await Pickup.find({ agent_id: req.user.id })
            .populate('user_id', 'name email address')
            .sort({ scheduled_time: 1 });

        res.status(200).json({
            success: true,
            count: pickups.length,
            data: pickups
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/pickups/:id/status
// NGO agent updates pickup status (assigned → completed/cancelled)
// ─────────────────────────────────────────────────────────────
const updatePickupStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const pickup = await Pickup.findById(req.params.id);

        if (!pickup) {
            return res.status(404).json({ success: false, message: 'Pickup not found' });
        }

        // Only the assigned agent or admin can update status
        const isAgent = pickup.agent_id?.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        if (!isAgent && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        pickup.status = status;
        await pickup.save();

        // Notify the user about status update
        await Notification.create({
            user_id: pickup.user_id,
            type: 'general',
            message: `Your pickup request has been marked as "${status}"`,
            link: `/pickups`
        });

        res.status(200).json({ success: true, data: pickup });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/pickups  (Admin only)
// Admin views all pickups across the platform
// ─────────────────────────────────────────────────────────────
const getAllPickups = async (req, res, next) => {
    try {
        const pickups = await Pickup.find()
            .populate('user_id', 'name email')
            .populate('agent_id', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pickups.length,
            data: pickups
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createPickup,
    getMyPickups,
    getAssignedPickups,
    updatePickupStatus,
    getAllPickups
};
