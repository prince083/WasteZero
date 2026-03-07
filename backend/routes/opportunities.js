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
    updateApplicationStatus,
    searchOpportunities
} = require('../controllers/opportunityController');
// Search Opportunities (All)
router.get('/search', searchOpportunities);
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

// Get My Opportunities (NGO/Admin only)
router.get(
    '/my',
    authorizeRoles('ngo', 'admin'),
    getMyOpportunities
);


// Get Applied Opportunities (Volunteer only)
router.get(
    '/applied',
    authorizeRoles('volunteer'),
    getAppliedOpportunities
);



// Get Applicants for Opportunity (NGO/Admin only)
router.get(
    '/:id/applicants',
    authorizeRoles('ngo', 'admin'),
    getOpportunityApplicants
);
// Get single opportunity by ID
router.get('/:id', getOpportunityById);
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

// Accept or Reject an applicant (NGO only)
router.patch(
    '/:opportunityId/applicants/:applicationId',
    authorizeRoles('ngo', 'admin'),
    updateApplicationStatus
);



module.exports = router;
