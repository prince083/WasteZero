const express = require('express');
const router = express.Router();

const {
    createPickup,
    getMyPickups,
    getAssignedPickups,
    updatePickupStatus,
    dispatchPickup,
    getAllPickups
} = require('../controllers/pickupController');

const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

// POST /api/pickups — volunteer schedules a new pickup
router.post('/', auth, authorizeRoles('volunteer'), createPickup);

// GET /api/pickups/my — volunteer sees their own pickups
router.get('/my', auth, authorizeRoles('volunteer'), getMyPickups);

// GET /api/pickups/assigned — NGO or Volunteer (Agent) sees pickups assigned to them
router.get('/assigned', auth, authorizeRoles('ngo', 'volunteer'), getAssignedPickups);

// PATCH /api/pickups/:id/status — NGO/Agent/Admin updates pickup status
router.patch('/:id/status', auth, authorizeRoles('ngo', 'admin', 'volunteer'), updatePickupStatus);

// PATCH /api/pickups/:id/dispatch — NGO dispatches to volunteer staff
router.patch('/:id/dispatch', auth, authorizeRoles('ngo'), dispatchPickup);

// GET /api/pickups — admin views all pickups
router.get('/', auth, authorizeRoles('admin'), getAllPickups);

module.exports = router;
