const Delivery = require('../models/Delivery');

const getDeliveries = async (req, res) => {
    const { customerId, startDate, endDate } = req.query;
    let query = { businessId: req.user.businessId };

    if (customerId) query.customerId = customerId;
    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
    }

    const deliveries = await Delivery.find(query).populate('customerId');
    res.json(deliveries);
};

const logDelivery = async (req, res) => {
    const { customerId, date, status, amountPaid, amountDue, quantity } = req.body;

    const delivery = await Delivery.findOneAndUpdate(
        { customerId, date: new Date(date).setHours(0, 0, 0, 0), businessId: req.user.businessId },
        { status, amountPaid, amountDue, quantity },
        { upsert: true, new: true }
    );

    res.status(201).json(delivery);
};

const getPendingPayments = async (req, res) => {
    const pending = await Delivery.aggregate([
        { $match: { businessId: req.user.businessId, status: 'done', amountDue: { $gt: 0 } } },
        { $group: { _id: '$customerId', totalDue: { $sum: '$amountDue' } } },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' }
    ]);
    res.json(pending);
};

module.exports = { getDeliveries, logDelivery, getPendingPayments };
