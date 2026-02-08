const Business = require('../models/Business');
const User = require('../models/User');

const createBusiness = async (req, res) => {
    try {
        const { name, address, phone, defaultPrice } = req.body;

        const business = await Business.create({
            name,
            address,
            phone,
            defaultPrice: Number(defaultPrice) || 0,
            ownerId: req.user._id,
        });

        // Update user with businessId
        await User.findByIdAndUpdate(req.user._id, { businessId: business._id });
        res.status(201).json(business);
    } catch (error) {
        console.error('Create Business Error:', error);
        res.status(400).json({ message: error.message || 'Invalid business data' });
    }
};

const getBusiness = async (req, res) => {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (business) {
        res.json(business);
    } else {
        res.status(404).json({ message: 'Business not found' });
    }
};

const updateBusiness = async (req, res) => {
    try {
        const business = await Business.findOne({ ownerId: req.user._id });

        if (business) {
            business.name = req.body.name ?? business.name;
            business.address = req.body.address ?? business.address;
            business.phone = req.body.phone ?? business.phone;
            business.defaultPrice = req.body.defaultPrice !== undefined ? Number(req.body.defaultPrice) : business.defaultPrice;

            const updatedBusiness = await business.save();
            res.json(updatedBusiness);
        } else {
            res.status(404).json({ message: 'Business not found' });
        }
    } catch (error) {
        console.error('Update Business Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

module.exports = { createBusiness, getBusiness, updateBusiness };
