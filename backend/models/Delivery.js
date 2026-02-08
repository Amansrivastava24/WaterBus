const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['done', 'not_done'], default: 'not_done' },
    amountPaid: { type: Number, default: 0 },
    amountDue: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
