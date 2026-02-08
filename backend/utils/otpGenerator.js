const crypto = require('crypto');

// Generate a 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP for secure storage
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

// Verify OTP against hash
const verifyOTP = (inputOTP, hashedOTP) => {
    const inputHash = crypto.createHash('sha256').update(inputOTP).digest('hex');
    return inputHash === hashedOTP;
};

module.exports = { generateOTP, hashOTP, verifyOTP };
