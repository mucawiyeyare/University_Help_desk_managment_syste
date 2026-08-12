const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTicketVolumeReport,
  getTicketsByStatus,
  getTicketsByPriority,
  getTicketsByCategory,
  getAgentPerformance,
  getSLAReport,
  getSatisfactionReport,
  getTicketAging,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);

router.use(authorize('manager', 'admin'));

router.get('/volume', getTicketVolumeReport);
router.get('/by-status', getTicketsByStatus);
router.get('/by-priority', getTicketsByPriority);
router.get('/by-category', getTicketsByCategory);
router.get('/agent-performance', getAgentPerformance);
router.get('/sla', getSLAReport);
router.get('/satisfaction', getSatisfactionReport);
router.get('/aging', getTicketAging);

module.exports = router;
