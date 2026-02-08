const express = require('express');
const { getDeliveries, logDelivery, getPendingPayments } = require('../controllers/deliveryController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getDeliveries).post(protect, logDelivery);
router.get('/pending', protect, getPendingPayments);

module.exports = router;
