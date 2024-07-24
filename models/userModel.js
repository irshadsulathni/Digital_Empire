const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mobile: {
        type: String, 
        default: null
    },
    password: {
        type: String,
        default: ''
    },
    is_verified: {
        type: Number,
        required: true,
        default: 0
    },
    registerDate: {
        type: Date,
        default: Date.now
    },
    is_blocked: {
        type: Number,
        required: true,
        default: 0
    },
    googleId: {
        type: Boolean,
        default: false
    },
    referralCode: {
        type: String,
        unique: true,
        default: null
    },
    referredBy: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
