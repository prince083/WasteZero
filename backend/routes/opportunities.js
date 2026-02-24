const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const authorizeRoles = require('../middlewares/role');
const { validate, opportunitySchema } = require('../middlewares/validation');
const {
    createOpportunity,
    getOpportunities,
    getOpportunityById,
    getMyOpportunities,
    updateOpportunity,
    deleteOpportunity,
    applyToOpportunity,
    getAppliedOpportunities,
    getOpportunityApplicants,
    searchOpportunities
} = require('../controllers/opportunityController');

// Protect all routes
router.use(auth);

// Create Opportunity (NGO/Admin only)
router.post(
    '/',
    authorizeRoles('ngo', 'admin'),
    validate(opportunitySchema),
    createOpportunity
);

// Get All Opportunities (Available to all authenticated users)
router.get('/', getOpportunities);

// Get single opportunity by ID
router.get('/:id', getOpportunityById);

// Search Opportunities (All)
router.get('/search', searchOpportunities);

// Get Applied Opportunities (Volunteer only)
router.get(
    '/applied',
    authorizeRoles('volunteer'),
    getAppliedOpportunities
);

// Get My Opportunities (NGO/Admin only)
router.get(
    '/my',
    authorizeRoles('ngo', 'admin'),
    getMyOpportunities
);

// Update Opportunity (NGO/Admin only)
router.put(
    '/:id',
    authorizeRoles('ngo', 'admin'),
    updateOpportunity
);

// Delete Opportunity (NGO/Admin only)
router.delete(
    '/:id',
    authorizeRoles('ngo', 'admin'),
    deleteOpportunity
);

// Apply for Opportunity (Volunteer only)
router.post(
    '/:id/apply',
    authorizeRoles('volunteer'),
    applyToOpportunity
);

// Get Applicants for Opportunity (NGO/Admin only)
router.get(
    '/:id/applicants',
    authorizeRoles('ngo', 'admin'),
    getOpportunityApplicants
);

module.exports = router;
