const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getTicketVolumeReport,
  getTicketTimeSummary,
  getResolvedSLAReport,
  getTicketsByStatus,
  getTicketsByPriority,
  getTicketsByCategory,
  getAgentPerformance,
  getAgentSLARanking,
  getStudentComplaintDepartmentReport,
  getSLAReport,
  getSatisfactionReport,
  getTicketAging,
  testEmailWorkflow,
  getEmailLogs,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);

router.get('/agent-sla-ranking', authorize('agent', 'manager', 'admin'), getAgentSLARanking);

router.use(authorize('manager', 'admin'));

router.get('/volume', getTicketVolumeReport);
router.get('/time-summary', getTicketTimeSummary);
router.get('/resolved-sla', getResolvedSLAReport);
router.get('/by-status', getTicketsByStatus);
router.get('/by-priority', getTicketsByPriority);
router.get('/by-category', getTicketsByCategory);
router.get('/agent-performance', getAgentPerformance);
router.get('/student-complaint-departments', getStudentComplaintDepartmentReport);
router.get('/sla', getSLAReport);
router.get('/satisfaction', getSatisfactionReport);
router.get('/aging', getTicketAging);
router.post('/test-email', authorize('admin'), testEmailWorkflow);
router.get('/email-logs', authorize('admin'), getEmailLogs);

module.exports = router;
