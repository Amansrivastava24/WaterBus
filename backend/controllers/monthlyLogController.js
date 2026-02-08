const MonthlyLog = require('../models/MonthlyLog');

const updateMonthlyLog = async (req, res) => {
    try {
        const { customerId, date } = req.params;
        const { deliveryStatus, paymentStatus, amount } = req.body;
        const businessId = req.user.businessId;

        // Ensure date is start of day
        const logDate = new Date(date);
        logDate.setHours(0, 0, 0, 0);

        const log = await MonthlyLog.findOneAndUpdate(
            { customerId, date: logDate, businessId },
            {
                deliveryStatus,
                paymentStatus,
                amount: Number(amount) || 0,
                // If not delivered, payment must be unpaid as per rules
                ...(deliveryStatus === 'not_done' ? { paymentStatus: 'unpaid' } : {})
            },
            { upsert: true, new: true, runValidators: true }
        );

        res.json(log);
    } catch (error) {
        console.error('Update Monthly Log Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getMonthlyLogs = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { month } = req.query; // YYYY-MM
        const businessId = req.user.businessId;

        const start = new Date(month + '-01');
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

        const logs = await MonthlyLog.find({
            customerId,
            businessId,
            date: { $gte: start, $lte: end }
        });

        res.json(logs);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { updateMonthlyLog, getMonthlyLogs };
