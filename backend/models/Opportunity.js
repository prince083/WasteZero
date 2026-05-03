const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
    ngo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    required_skills: [{
        type: String,
        trim: true
    }],
    duration: {
        type: String,
        trim: true
    },
    date: {
        type: Date
    },
    // GeoJSON Point for location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    // Adding address field to be consistent with User model as requested
    address: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ["open", "closed", "in-progress"],
        default: "open"
    }
}, { timestamps: true });

// Add 2dsphere index for geospatial queries
OpportunitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
