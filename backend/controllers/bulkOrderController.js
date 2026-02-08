const BulkOrder = require('../models/BulkOrder');

const getBulkOrders = async (req, res) => {
    const orders = await BulkOrder.find({ businessId: req.user.businessId }).populate('customerId');
    res.json(orders);
};

const createBulkOrder = async (req, res) => {
    const { customerId, quantity, deliveryDate, price } = req.body;
    const order = await BulkOrder.create({
        customerId,
        quantity,
        deliveryDate,
        price,
        businessId: req.user.businessId,
    });
    res.status(201).json(order);
};

const updateBulkOrder = async (req, res) => {
    const order = await BulkOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });

    if (order) {
        order.quantity = req.body.quantity || order.quantity;
        order.deliveryDate = req.body.deliveryDate || order.deliveryDate;
        order.status = req.body.status || order.status;
        order.price = req.body.price || order.price;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404).json({ message: 'Bulk order not found' });
    }
};

const deleteBulkOrder = async (req, res) => {
    const order = await BulkOrder.findOne({ _id: req.params.id, businessId: req.user.businessId });

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Bulk order removed' });
    } else {
        res.status(404).json({ message: 'Bulk order not found' });
    }
};

module.exports = { getBulkOrders, createBulkOrder, updateBulkOrder, deleteBulkOrder };
