const mongoose = require('mongoose');

const bulkOrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    quantity: { type: Number, required: true },
    deliveryDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'pending' },
    price: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('BulkOrder', bulkOrderSchema);
