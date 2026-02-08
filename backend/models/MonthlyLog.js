const mongoose = require('mongoose');

const monthlyLogSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, required: true },
    deliveryStatus: { type: String, enum: ['done', 'not_done'], default: 'not_done' },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    amount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for performance and uniqueness
monthlyLogSchema.index({ businessId: 1, customerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyLog', monthlyLogSchema);
