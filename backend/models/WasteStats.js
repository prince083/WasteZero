const mongoose = require('mongoose');

const wasteStatsSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pickup_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pickup'
    },
    category: {
        type: String,
        required: true,
        enum: ['plastic', 'organic', 'e-waste', 'paper', 'metal', 'glass', 'other']
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for periodic reporting (monthly/daily)
wasteStatsSchema.index({ date: 1, category: 1 });

module.exports = mongoose.model('WasteStats', wasteStatsSchema);
