const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

/**
 * GET /api/matches
 * Returns ranked opportunity suggestions for a logged-in volunteer
 * Matching is based on:
 *   1. Skills overlap (primary sort — more matching skills = higher rank)
 *   2. Geographic proximity (secondary sort — closer = higher rank)
 */
const getMatches = async (req, res, next) => {
    try {
        const user = req.user;

        // Only volunteers can get matches
        if (user.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: 'Only volunteers can access match suggestions'
            });
        }

        // Fetch the full user record to get their skills and location
        const User = require('../models/User');
        const volunteer = await User.findById(user.id).select('skills location');

        if (!volunteer) {
            return res.status(404).json({ success: false, message: 'Volunteer not found' });
        }

        const volunteerSkills = volunteer.skills || [];
        const hasLocation = volunteer.location &&
            volunteer.location.coordinates &&
            volunteer.location.coordinates[0] !== 0;

        // ── Fetch all open opportunities ──────────────────────────────────
        let opportunities = await Opportunity.find({ status: 'open' })
            .populate('ngo_id', 'name email address');

        // ── Score each opportunity ─────────────────────────────────────────
        const scored = opportunities.map((opp) => {
            const oppSkills = opp.required_skills || [];

            // Skill match score: number of volunteer skills that match required skills
            const matchedSkills = volunteerSkills.filter(skill =>
                oppSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
            );
            const skillScore = oppSkills.length > 0
                ? (matchedSkills.length / oppSkills.length) * 100
                : 0;

            // Distance score (if both have valid location)
            let distanceKm = null;
            if (hasLocation && opp.location && opp.location.coordinates) {
                const [vLng, vLat] = volunteer.location.coordinates;
                const [oLng, oLat] = opp.location.coordinates;
                distanceKm = getDistanceKm(vLat, vLng, oLat, oLng);
            }

            return {
                opportunity: opp,
                skillScore: Math.round(skillScore),
                matchedSkills,
                totalSkillsRequired: oppSkills.length,
                distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null
            };
        });

        // ── Sort: higher skill score first, then closer distance ──────────
        scored.sort((a, b) => {
            if (b.skillScore !== a.skillScore) return b.skillScore - a.skillScore;
            // If same skill score, sort by distance (nulls go last)
            if (a.distanceKm === null) return 1;
            if (b.distanceKm === null) return -1;
            return a.distanceKm - b.distanceKm;
        });

        // ── Only return opportunities with at least 1 skill match ─────────
        // But if volunteer has no skills set, return all open opportunities
        const results = volunteerSkills.length > 0
            ? scored.filter(item => item.skillScore > 0)
            : scored;

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (err) {
        next(err);
    }
};

/**
 * Helper: Haversine formula to calculate distance between two lat/lng points in km
 */
function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = { getMatches };
