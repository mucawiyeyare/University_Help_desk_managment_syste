const express = require('express');
const router = express.Router();
const { getAllFeedback, getFeedbackStats } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('manager', 'admin'));

router.get('/', getAllFeedback);
router.get('/stats', getFeedbackStats);

module.exports = router;
