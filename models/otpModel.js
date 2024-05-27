const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
});


















const OTP = mongoose.model('OTP', otpSchema);

// Function to delete OTP documents older than two minutes
async function deleteOldOTP() {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // Calculate two minutes ago
    await OTP.deleteMany({ createdAt: { $lt: twoMinutesAgo } });
}

// Periodically check and delete old OTP documents
setInterval(deleteOldOTP, 120000); // Run every 2 minutes (120,000 milliseconds)

module.exports = OTP;
