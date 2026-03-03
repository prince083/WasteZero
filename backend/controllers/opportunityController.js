const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const createOpportunity = async (req, res, next) => {
    try {

        const { title, description, required_skills, duration, location, address, status } = req.body;

        const opportunity = await Opportunity.create({
            ngo_id: req.user.id,
            title,
            description,
            required_skills,
            duration,
            location,
            address,
            status
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

        opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
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
    searchOpportunities
};
