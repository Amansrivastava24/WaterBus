const express = require('express');
const {
    sendOTP,
    verifyOTPAndRegister,
    verifyOTPAndLogin,
    registerUser,
    loginUser,
    getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// OTP-based authentication (recommended)
router.post('/send-otp', sendOTP);
router.post('/verify-otp-register', verifyOTPAndRegister);
router.post('/verify-otp-login', verifyOTPAndLogin);

// Legacy password-based authentication (backward compatibility)
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route
router.get('/me', protect, getMe);

module.exports = router;
