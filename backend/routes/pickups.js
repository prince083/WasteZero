const express = require('express');
const router = express.Router();

const {
    createPickup,
    getMyPickups,
    getAssignedPickups,
    updatePickupStatus,
    getAllPickups
} = require('../controllers/pickupController');

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

// POST /api/pickups — volunteer schedules a new pickup
router.post('/', auth, authorizeRoles('volunteer'), createPickup);

// GET /api/pickups/my — volunteer sees their own pickups
router.get('/my', auth, authorizeRoles('volunteer'), getMyPickups);

// GET /api/pickups/assigned — NGO sees pickups assigned to them
router.get('/assigned', auth, authorizeRoles('ngo'), getAssignedPickups);

// PATCH /api/pickups/:id/status — NGO/admin updates pickup status
router.patch('/:id/status', auth, authorizeRoles('ngo', 'admin'), updatePickupStatus);

// GET /api/pickups — admin views all pickups
router.get('/', auth, authorizeRoles('admin'), getAllPickups);

module.exports = router;
