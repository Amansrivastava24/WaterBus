const express = require('express');
const { getBulkOrders, createBulkOrder, updateBulkOrder, deleteBulkOrder } = require('../controllers/bulkOrderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getBulkOrders).post(protect, createBulkOrder);
router.route('/:id').put(protect, updateBulkOrder).delete(protect, deleteBulkOrder);

module.exports = router;
