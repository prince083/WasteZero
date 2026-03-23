const User = require("../models/User");
const AdminLog = require("../models/AdminLog");
const Opportunity = require("../models/Opportunity");
const Pickup = require("../models/Pickup");
const { generateCSV, generatePDF } = require("../utils/reportGenerator");
const path = require("path");

//  Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//  Suspend user
const suspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`[Admin] Suspending user: ${userId} by admin: ${req.user?.id}`);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.status === "suspended") {
            return res.status(400).json({ message: "User already suspended" });
        }

        user.status = "suspended";
        await user.save();

        try {
            await AdminLog.create({
                admin_id: req.user.id,
                action: "SUSPEND_USER",
                target_id: userId,
            });
        } catch (logErr) {
            console.error("[AdminLog Error]", logErr);
            // Don't fail the whole request if logging fails, but it points to our bug
        }

        res.json({ message: "User suspended successfully", user });

    } catch (err) {
        console.error("[Suspend Error]", err);
        res.status(500).json({ error: err.message });
    }
};

// @desc    Unsuspend user
const unsuspendUser = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`[Admin] Unsuspending user: ${userId} by admin: ${req.user?.id}`);

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.status === "active") {
            return res.status(400).json({ message: "User is already active" });
        }

        user.status = "active";
        await user.save();

        try {
            await AdminLog.create({
                admin_id: req.user.id,
                action: "UNSUSPEND_USER",
                target_id: userId,
            });
        } catch (logErr) {
            console.error("[AdminLog Error]", logErr);
        }

        res.json({ message: "User unsuspended successfully", user });

    } catch (err) {
        console.error("[Unsuspend Error]", err);
        res.status(500).json({ error: err.message });
    }
};

//  Get admin logs
const getLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find()
            .populate("admin_id", "name email")
            .populate("target_id", "name email")
            .sort({ timestamp: -1 });

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//  Download logs as CSV
const downloadLogs = async (req, res) => {
    try {
        const logs = await AdminLog.find();

        const filePath = path.join(__dirname, "../logs.csv");

        generateCSV(logs, filePath);

        res.download(filePath, "admin_logs.csv");

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Get platform-wide statistics for the admin dashboard
const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: "active" });
        const suspendedUsers = await User.countDocuments({ status: "suspended" });

        const ngoCount = await User.countDocuments({ role: "ngo" });
        const volunteerCount = await User.countDocuments({ role: "volunteer" });

        const totalOpportunities = await Opportunity.countDocuments();
        const activeOpportunities = await Opportunity.countDocuments({ status: "open" });

        const totalPickups = await Pickup.countDocuments();
        const completedPickups = await Pickup.countDocuments({ status: "completed" });

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers,
                ngos: ngoCount,
                volunteers: volunteerCount
            },
            opportunities: {
                total: totalOpportunities,
                active: activeOpportunities
            },
            pickups: {
                total: totalPickups,
                completed: completedPickups
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Moderate content by removing an opportunity
const deleteOpportunity = async (req, res) => {
    try {
        const { opportunityId } = req.params;

        const opportunity = await Opportunity.findById(opportunityId);

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        await Opportunity.findByIdAndDelete(opportunityId);

        await AdminLog.create({
            admin_id: req.user.id,
            action: "DELETE_OPPORTUNITY",
            target_id: opportunityId,
        });

        res.json({ message: "Opportunity removed from platform successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
// @desc    Download Platform Impact Report as PDF
const downloadPlatformReport = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const ngoCount = await User.countDocuments({ role: "ngo" });
        const volunteerCount = await User.countDocuments({ role: "volunteer" });
        const totalOpportunities = await Opportunity.countDocuments();
        const totalPickups = await Pickup.countDocuments();

        const reportData = {
            users: {
                total: totalUsers,
                ngos: ngoCount,
                volunteers: volunteerCount
            },
            opportunities: {
                total: totalOpportunities
            },
            pickups: {
                total: totalPickups
            }
        };

        const filePath = path.join(__dirname, "../platform_report.pdf");
        await generatePDF(reportData, filePath, "Platform Impact & Statistics Summary");

        res.download(filePath, "WasteZero_Impact_Report.pdf");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// @desc    Download Admin Logs as PDF
const downloadLogsPDF = async (req, res) => {
    try {
        const logs = await AdminLog.find().populate("admin_id", "name").sort({ timestamp: -1 });
        const filePath = path.join(__dirname, "../admin_logs.pdf");

        await generatePDF(logs, filePath, "Administrative Audit Logs");

        res.download(filePath, "Admin_Audit_Logs.pdf");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUsers,
    suspendUser,
    unsuspendUser,
    getLogs,
    downloadLogs,
    getPlatformStats,
    deleteOpportunity,
    downloadPlatformReport,
    downloadLogsPDF
};