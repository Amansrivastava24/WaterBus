const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: false }, // Optional for OTP auth
    role: { type: String, enum: ['admin', 'owner'], default: 'owner' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
    otp: { type: String }, // Hashed OTP
    otpExpiry: { type: Date }, // OTP expiration time
    isVerified: { type: Boolean, default: false } // Email verification status
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
