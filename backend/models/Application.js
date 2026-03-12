const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    opportunity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
        required: true
    },
    volunteer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("Application", ApplicationSchema);