const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // role: volunteer, ngo, admin
    role: {
        type: String,
        enum: ['volunteer', 'ngo', 'admin'],
        required: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    bio: {
        type: String,
        trim: true
    },
    // GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // account status — admin can suspend users
    status: {
        type: String,
        enum: ['active', 'suspended'],
        default: 'active'
    }
}, { timestamps: true });

// remove sensitive fields when converting to JSON
UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

// add 2dsphere index for geospatial queries on `location`
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
