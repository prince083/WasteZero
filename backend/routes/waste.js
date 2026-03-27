const express = require('express');
const router = express.Router();
const {
    getStatsByCategory,
    getWasteTrends,
    addWasteEntry,
    getDetailedWasteReport
} = require('../controllers/wasteController');
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');

// All waste routes require admin access
router.use(auth);
router.use(authorizeRoles('admin'));

router.route('/')
    .post(addWasteEntry);

router.get('/stats/category', getStatsByCategory);
router.get('/stats/trends', getWasteTrends);
router.get('/details', getDetailedWasteReport);

module.exports = router;
