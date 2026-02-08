const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Business = require('../models/Business');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otpGenerator');
const { sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Send OTP for registration or login
const sendOTP = async (req, res) => {
    try {
        const { email, name, phone, type } = req.body; // type: 'register' or 'login'

        if (!email || !type) {
            return res.status(400).json({ message: 'Email and type are required' });
        }

        const existingUser = await User.findOne({ email });

        // Validation based on type
        if (type === 'register') {
            if (existingUser) {
                return res.status(400).json({ message: 'Email already registered. Please login instead.' });
            }
            if (!name || !phone) {
                return res.status(400).json({ message: 'Name and phone are required for registration' });
            }
        } else if (type === 'login') {
            if (!existingUser) {
                return res.status(404).json({ message: 'No account found with this email. Please register first.' });
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const hashedOTP = hashOTP(otp);
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (type === 'register') {
            // Create temporary user with OTP
            const tempUser = await User.create({
                name,
                email,
                phone,
                otp: hashedOTP,
                otpExpiry,
                isVerified: false
            });

            // Send OTP email
            const emailResult = await sendOTPEmail(email, otp, name);

            if (!emailResult.success) {
                return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
            }

            res.status(200).json({
                message: 'OTP sent successfully to your email',
                email,
                expiresIn: '10 minutes'
            });
        } else {
            // Update existing user with OTP
            existingUser.otp = hashedOTP;
            existingUser.otpExpiry = otpExpiry;
            await existingUser.save();

            // Send OTP email
            const emailResult = await sendOTPEmail(email, otp, existingUser.name);

            if (!emailResult.success) {
                return res.status(500).json({ message: 'Failed to send OTP email. Please try again.' });
            }

            res.status(200).json({
                message: 'OTP sent successfully to your email',
                email,
                expiresIn: '10 minutes'
            });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Verify OTP and complete registration
const verifyOTPAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        const isValid = verifyOTP(otp, user.otp);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }

        // Mark user as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Send welcome email (async, don't wait)
        sendWelcomeEmail(user.email, user.name).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            businessId: user.businessId,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Verify OTP registration error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Verify OTP and login
const verifyOTPAndLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP has expired
        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        const isValid = verifyOTP(otp, user.otp);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
        }

        // Clear OTP after successful login
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            businessId: user.businessId,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Verify OTP login error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// Get current user
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).populate('businessId');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// Legacy password-based registration (keep for backward compatibility)
const registerUser = async (req, res) => {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ email, password });

    if (user) {
        res.status(201).json({
            _id: user._id,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// Legacy password-based login (keep for backward compatibility)
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
        res.json({
            _id: user._id,
            email: user.email,
            businessId: user.businessId,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};

module.exports = {
    sendOTP,
    verifyOTPAndRegister,
    verifyOTPAndLogin,
    registerUser,
    loginUser,
    getMe
};
