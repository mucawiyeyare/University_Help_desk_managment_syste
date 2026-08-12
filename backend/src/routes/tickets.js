const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  addComment,
  getComments,
  getHistory,
  assignTicket,
  escalateTicket,
  resolveTicket,
  closeTicket,
  reopenTicket,
  deleteTicket,
  submitFeedback,
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .post(upload.array('attachments', 5), createTicket)
  .get(getTickets);

router.route('/:id')
  .get(getTicket)
  .put(authorize('agent', 'manager', 'admin'), updateTicket)
  .delete(authorize('admin'), deleteTicket);

router.route('/:id/comments')
  .get(getComments)
  .post(upload.array('attachments', 5), addComment);

router.get('/:id/history', authorize('agent', 'manager', 'admin'), getHistory);
router.post('/:id/assign', authorize('manager', 'admin'), assignTicket);
router.post('/:id/escalate', authorize('agent', 'manager', 'admin'), escalateTicket);
router.post('/:id/resolve', authorize('agent', 'manager', 'admin'), resolveTicket);
router.post('/:id/close', authorize('requester', 'agent', 'manager', 'admin'), closeTicket);
router.post('/:id/reopen', authorize('requester', 'agent', 'manager', 'admin'), reopenTicket);
router.post('/:id/feedback', authorize('requester'), submitFeedback);

module.exports = router;
