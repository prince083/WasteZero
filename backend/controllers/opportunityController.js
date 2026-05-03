const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const createOpportunity = async (req, res, next) => {
    try {
        let { title, description, required_skills, duration, location, address, status } = req.body;

        // Parse JSON strings from FormData
        if (typeof required_skills === 'string') {
            try { required_skills = JSON.parse(required_skills); } catch (e) { required_skills = required_skills.split(','); }
        }
        if (typeof location === 'string') {
            try { location = JSON.parse(location); } catch (e) {}
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = req.file.path;
        }

        const opportunity = await Opportunity.create({
            ngo_id: req.user.id,
            title,
            description,
            required_skills,
            duration,
            location,
            address,
            status,
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            data: opportunity
        });

    } catch (err) {
        next(err);
    }
};

const getOpportunities = async (req, res, next) => {
    try {
        const opportunities = await Opportunity.find().populate("ngo_id", "name email");

        res.status(200).json({
            success: true,
            count: opportunities.length,
            data: opportunities
        });

    } catch (err) {
        next(err);
    }

};

const getOpportunityById = async (req, res, next) => {
    try {
        const opportunity = await Opportunity
            .findById(req.params.id)
            .populate("ngo_id", "name email address");

        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found"
            });
        }

        res.status(200).json({
            success: true,
            data: opportunity
        });

    } catch (err) {
        next(err);
    }
};

const getMyOpportunities = async (req, res, next) => {
    try {
        const opportunities = await Opportunity.find({ ngo_id: req.user.id });

        res.status(200).json({
            success: true,
            count: opportunities.length,
            data: opportunities
        });

    } catch (err) {
        next(err);
    }
};

const updateOpportunity = async (req, res, next) => {
    try {
        let opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ success: false, message: "Opportunity not found" });
        }

        if (opportunity.ngo_id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        let updateData = { ...req.body };

        // Parse JSON strings from FormData
        if (typeof updateData.required_skills === 'string') {
            try { updateData.required_skills = JSON.parse(updateData.required_skills); } catch (e) { updateData.required_skills = updateData.required_skills.split(','); }
        }
        if (typeof updateData.location === 'string') {
            try { updateData.location = JSON.parse(updateData.location); } catch (e) {}
        }

        if (req.file) {
            updateData.image = req.file.path;
        }

        opportunity = await Opportunity.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: opportunity });

    } catch (err) {
        next(err);
    }
};

const deleteOpportunity = async (req, res, next) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ success: false, message: "Opportunity not found" });
        }

        if (opportunity.ngo_id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        await opportunity.deleteOne();

        res.status(200).json({ success: true, message: "Deleted successfully" });

    } catch (err) {
        next(err);
    }
};

const applyToOpportunity = async (req, res, next) => {
    try {
        const { id } = req.params; // opportunity id
        const userId = req.user.id;

        //  check opportunity exists
        const opportunity = await Opportunity.findById(id);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found",
            });
        }

        //  prevent duplicate apply
        const alreadyApplied = await Application.findOne({
            volunteer_id: userId,
            opportunity_id: id,
        });

        if (alreadyApplied) {
            return res.status(400).json({
                success: false,
                message: "Already applied",
            });
        }

        //  create application
        await Application.create({
            volunteer_id: userId,
            opportunity_id: id,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Applied successfully",
        });
    } catch (err) {
        next(err);
    }
};

const getAppliedOpportunities = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const applications = await Application.find({ volunteer_id: userId })
            .populate("opportunity_id")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });

    } catch (error) {
        next(error);
    }
};

const getOpportunityApplicants = async (req, res, next) => {
    try {
        const { id } = req.params; // opportunity id

        // check opportunity exists
        const opportunity = await Opportunity.findById(id);
        if (!opportunity) {
            return res.status(404).json({
                success: false,
                message: "Opportunity not found",
            });
        }

        // fetch all applications for this opportunity
        const applications = await Application.find({ opportunity_id: id })
            .populate("volunteer_id", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            applicants: applications,
        });
    } catch (err) {
        next(err);
    }
};

const searchOpportunities = async (req, res, next) => {
    try {
        const { keyword, skills, status, ngo } = req.query;

        let query = {};

        //  keyword search (title + description)
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ];
        }

        //  filter by skills
        if (skills) {
            query.required_skills = { $in: skills.split(",") };
        }

        //  filter by status
        if (status) {
            query.status = status;
        }

        //  filter by ngo
        if (ngo) {
            query.ngo_id = ngo;
        }

        const opportunities = await Opportunity.find(query)
            .populate("ngo_id", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: opportunities.length,
            data: opportunities
        });

    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/opportunities/:opportunityId/applicants/:applicationId
// NGO accepts or rejects a volunteer's application
// Triggers: DB Notification + real-time Socket.io push to volunteer
// ─────────────────────────────────────────────────────────────
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { opportunityId, applicationId } = req.params;
        const { status } = req.body;  // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "accepted" or "rejected"'
            });
        }

        // Verify NGO owns this opportunity
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ success: false, message: 'Opportunity not found' });
        }
        if (opportunity.ngo_id.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Update the application status
        const application = await Application.findByIdAndUpdate(
            applicationId,
            { status },
            { new: true }
        ).populate('volunteer_id', 'name email');

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Save persistent notification for volunteer
        await Notification.create({
            user_id: application.volunteer_id._id,
            type: 'general',
            message: status === 'accepted'
                ? `🎉 Congratulations! Your application for "${opportunity.title}" has been accepted.`
                : `Your application for "${opportunity.title}" was not selected this time.`,
            link: `/opportunities/${opportunityId}`
        });

        // Push real-time notification via Socket.io if volunteer is online
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        if (io && onlineUsers) {
            const volunteerSocketId = onlineUsers.get(application.volunteer_id._id.toString());
            if (volunteerSocketId) {
                io.to(volunteerSocketId).emit('new_notification', {
                    type: 'general',
                    message: status === 'accepted'
                        ? `🎉 Your application for "${opportunity.title}" was accepted!`
                        : `Your application for "${opportunity.title}" was not selected.`,
                    link: `/opportunities/${opportunityId}`
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Application ${status} successfully`,
            data: application
        });

    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/opportunities/all-applications
// NGO sees ALL applications across ALL their posted opportunities
// ─────────────────────────────────────────────────────────────
const getAllMyApplications = async (req, res, next) => {
    try {
        const ngoId = req.user.id;

        // 1. Find all opportunities owned by this NGO
        const myOpps = await Opportunity.find({ ngo_id: ngoId });
        const oppIds = myOpps.map(opp => opp._id);

        // 2. Find all applications for these opportunities
        const applications = await Application.find({
            opportunity_id: { $in: oppIds }
        })
            .populate("volunteer_id", "name email skills bio location")
            .populate("opportunity_id", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/opportunities/my-volunteers
// NGO sees all volunteers they have accepted across all their opportunities
// ─────────────────────────────────────────────────────────────
const getMyVolunteers = async (req, res, next) => {
    try {
        const ngoId = req.user.id;

        // 1. Find all opportunities owned by this NGO
        const myOpps = await Opportunity.find({ ngo_id: ngoId });
        const oppIds = myOpps.map(opp => opp._id);

        // 2. Find all "accepted" applications for these opportunities
        const applications = await Application.find({
            opportunity_id: { $in: oppIds },
            status: 'accepted'
        }).populate('volunteer_id', 'name email skills location bio');

        // 3. Extract unique list of volunteers
        const volunteersMap = new Map();
        applications.forEach(app => {
            if (app.volunteer_id) {
                volunteersMap.set(app.volunteer_id._id.toString(), app.volunteer_id);
            }
        });

        res.status(200).json({
            success: true,
            count: volunteersMap.size,
            data: Array.from(volunteersMap.values())
        });

    } catch (err) {
        next(err);
    }
};

module.exports = {
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
    getAllMyApplications,
    getMyVolunteers,
    searchOpportunities
};
