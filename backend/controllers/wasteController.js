const WasteStats = require('../models/WasteStats');

// @desc    Get overall waste stats aggregated by category
// @route   GET /api/waste/stats/category
// @access  Private/Admin
exports.getStatsByCategory = async (req, res) => {
    try {
        const stats = await WasteStats.aggregate([
            {
                $group: {
                    _id: "$category",
                    totalWeight: { $sum: "$weight" }
                }
            },
            {
                $project: {
                    category: "$_id",
                    totalWeight: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get waste collection trends (last 6 months)
// @route   GET /api/waste/stats/trends
// @access  Private/Admin
exports.getWasteTrends = async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trends = await WasteStats.aggregate([
            {
                $match: {
                    date: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$date" },
                        year: { $year: "$date" }
                    },
                    totalWeight: { $sum: "$weight" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            {
                $project: {
                    month: "$_id.month",
                    year: "$_id.year",
                    totalWeight: 1,
                    _id: 0
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: trends
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Add manual waste entry (primarily for testing or manual overrides)
// @route   POST /api/waste
// @access  Private/Admin
exports.addWasteEntry = async (req, res) => {
    try {
        const { category, weight, date } = req.body;

        const entry = await WasteStats.create({
            user_id: req.user.id,
            category,
            weight,
            date: date || Date.now()
        });

        res.status(201).json({
            success: true,
            data: entry
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
