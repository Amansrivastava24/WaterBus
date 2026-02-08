const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const MonthlyLog = require('../models/MonthlyLog');

const getDashboardStats = async (req, res) => {
    const businessId = req.user.businessId;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get Delivery stats
    const deliveryRevenue = await Delivery.aggregate([
        { $match: { businessId, status: 'done', date: { $gte: startOfYear } } },
        {
            $group: {
                _id: { $month: '$date' },
                totalRevenue: { $sum: '$amountPaid' },
                totalDue: { $sum: '$amountDue' }
            }
        }
    ]);

    // Get MonthlyLog stats
    const monthlyLogRevenue = await MonthlyLog.aggregate([
        { $match: { businessId, deliveryStatus: 'done', date: { $gte: startOfYear } } },
        {
            $group: {
                _id: { $month: '$date' },
                totalRevenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } },
                totalDue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, '$amount', 0] } }
            }
        }
    ]);

    // Merge stats
    const combinedStats = {};
    [...deliveryRevenue, ...monthlyLogRevenue].forEach(stat => {
        if (!combinedStats[stat._id]) {
            combinedStats[stat._id] = { totalRevenue: 0, totalDue: 0 };
        }
        combinedStats[stat._id].totalRevenue += stat.totalRevenue;
        combinedStats[stat._id].totalDue += stat.totalDue;
    });

    const revenueStats = Object.keys(combinedStats).map(month => ({
        _id: Number(month),
        ...combinedStats[month]
    })).sort((a, b) => a._id - b._id);

    // Total Customers
    const totalCustomers = await Customer.countDocuments({ businessId });

    // Payment Overview (Current Year)
    const paidTotal = revenueStats.reduce((acc, curr) => acc + curr.totalRevenue, 0);
    const pendingTotal = revenueStats.reduce((acc, curr) => acc + curr.totalDue, 0);

    res.json({
        revenueStats,
        totalCustomers,
        paymentOverview: { paid: paidTotal, pending: pendingTotal }
    });
};

module.exports = { getDashboardStats };
