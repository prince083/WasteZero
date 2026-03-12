const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { getMatches } = require('../controllers/matchController');

// All match routes require authentication
router.use(auth);

// GET /api/matches - Get ranked opportunity matches for logged-in volunteer
router.get('/', getMatches);

module.exports = router;
