const express = require('express');
const { updateMonthlyLog, getMonthlyLogs } = require('../controllers/monthlyLogController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/:customerId/:date', protect, updateMonthlyLog);
router.get('/:customerId', protect, getMonthlyLogs);

module.exports = router;
