const mongoose = require('mongoose');

const PickupSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Waste category being picked up
    category: {
        type: String,
        enum: ['plastic', 'organic', 'e-waste', 'paper', 'metal', 'glass', 'other'],
        required: true
    },
    scheduled_time: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    // GeoJSON for location-based agent assignment
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]   // [longitude, latitude]
        }
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'completed', 'cancelled'],
        default: 'pending'
    },
    // NGO assigned as the pickup agent
    agent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

// Geospatial index for finding nearest NGO agents
PickupSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pickup', PickupSchema);
