const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
    const customers = await Customer.find({ businessId: req.user.businessId });
    res.json(customers);
};

const createCustomer = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        console.log('Creating Customer:', { name, phone, address, businessId: req.user?.businessId });

        const customer = await Customer.create({
            name,
            phone,
            address,
            businessId: req.user.businessId,
        });
        res.status(201).json(customer);
    } catch (error) {
        console.error('Create Customer Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const updateCustomer = async (req, res) => {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.user.businessId });

    if (customer) {
        customer.name = req.body.name || customer.name;
        customer.phone = req.body.phone || customer.phone;
        customer.address = req.body.address || customer.address;
        customer.status = req.body.status || customer.status;

        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);
    } else {
        res.status(404).json({ message: 'Customer not found' });
    }
};

const deleteCustomer = async (req, res) => {
    const customer = await Customer.findOne({ _id: req.params.id, businessId: req.user.businessId });

    if (customer) {
        await customer.deleteOne();
        res.json({ message: 'Customer removed' });
    } else {
        res.status(404).json({ message: 'Customer not found' });
    }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
