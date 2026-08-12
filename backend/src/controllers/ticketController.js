const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const TicketHistory = require('../models/TicketHistory');
const Feedback = require('../models/Feedback');
const Category = require('../models/Category');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');
const { generateTicketNumber } = require('../utils/ticketNumber');
const { applySLAToTicket } = require('../services/slaService');
const notificationService = require('../services/notificationService');
const { sendEmail } = require('../config/email');

// Build role-based ticket query
const buildTicketQuery = (user, queryParams) => {
  const filter = { isDeleted: false };
  if (user.role === 'requester') filter.requester = user._id;
  else if (user.role === 'agent') {
    filter.assignedAgent = user._id;
  } else if (user.role === 'manager') {
    filter.department = user.department?._id || user.department;
  }
  if (queryParams.status) filter.status = queryParams.status;
  if (queryParams.priority) filter.priority = queryParams.priority;
  if (queryParams.category) filter.category = queryParams.category;
  if (queryParams.department) filter.department = queryParams.department;
  if (queryParams.assignedAgent) filter.assignedAgent = queryParams.assignedAgent;
  if (queryParams.search) {
    filter.$or = [
      { subject: { $regex: queryParams.search, $options: 'i' } },
      { ticketNumber: { $regex: queryParams.search, $options: 'i' } },
    ];
  }
  return filter;
};

// @desc  Create ticket
// @route POST /api/tickets
exports.createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, subcategory, type, priority, impact, urgency, location, department } = req.body;
  if (!subject || !description) return res.status(400).json({ success: false, message: 'Subject and description are required' });

  const ticketNumber = await generateTicketNumber();

  // Find department from category if not provided
  let deptId = department;
  if (!deptId && category) {
    const cat = await Category.findById(category).select('department');
    if (cat?.department) deptId = cat.department;
  }

  const attachments = req.files
    ? req.files.map((f) => ({ filename: f.filename, originalName: f.originalname, mimetype: f.mimetype, size: f.size, uploadedBy: req.user._id, uploadedAt: new Date() }))
    : [];

  const ticket = new Ticket({
    ticketNumber, requester: req.user._id, subject, description,
    category, subcategory, type: type || 'incident',
    priority: priority || 'medium', impact: impact || 'medium', urgency: urgency || 'medium',
    department: deptId, location, attachments,
  });

  await applySLAToTicket(ticket);
  await ticket.save();

  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'created', note: 'Ticket created' });

  const populated = await Ticket.findById(ticket._id)
    .populate('requester', 'name email')
    .populate('category', 'name')
    .populate('subcategory', 'name')
    .populate('department', 'name');

  await notificationService.notifyTicketCreated(populated);
  res.status(201).json({ success: true, data: populated });
});

// @desc  Get tickets (role-filtered)
// @route GET /api/tickets
exports.getTickets = asyncHandler(async (req, res) => {
  const filter = buildTicketQuery(req.user, req.query);
  const { page, limit, skip } = getPagination(req.query);
  const sort = req.query.sort ? req.query.sort.replace(',', ' ') : '-createdAt';
  const [tickets, total] = await Promise.all([
    Ticket.find(filter).populate('requester', 'name email').populate('category', 'name').populate('subcategory', 'name').populate('department', 'name').populate('assignedAgent', 'name email').sort(sort).skip(skip).limit(limit),
    Ticket.countDocuments(filter),
  ]);
  res.json({ success: true, data: tickets, pagination: paginateResults(total, page, limit) });
});

// @desc  Get single ticket
// @route GET /api/tickets/:id
exports.getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id)
    .populate('requester', 'name email phone role requesterType')
    .populate('category', 'name').populate('subcategory', 'name')
    .populate('department', 'name').populate('assignedAgent', 'name email avatar')
    .populate('slaPolicy');
  if (!ticket || ticket.isDeleted) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (req.user.role === 'requester' && ticket.requester._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
  }
  res.json({ success: true, data: ticket });
});

// @desc  Update ticket
// @route PUT /api/tickets/:id
exports.updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket || ticket.isDeleted) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const allowedFields = ['priority', 'status', 'department', 'assignedAgent', 'category', 'subcategory', 'tags', 'location'];
  const historyEntries = [];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined && String(ticket[field]) !== String(req.body[field])) {
      historyEntries.push({ ticket: ticket._id, changedBy: req.user._id, action: `${field}_changed`, field, oldValue: String(ticket[field] || ''), newValue: String(req.body[field]) });
      ticket[field] = req.body[field];
    }
  }
  if (req.body.status === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = new Date();
  if (req.body.status === 'closed' && !ticket.closedAt) ticket.closedAt = new Date();
  await ticket.save();
  if (historyEntries.length) await TicketHistory.insertMany(historyEntries);
  const updated = await Ticket.findById(ticket._id).populate('requester', 'name email').populate('category', 'name').populate('department', 'name').populate('assignedAgent', 'name email');
  res.json({ success: true, data: updated });
});

// @desc  Add comment
// @route POST /api/tickets/:id/comments
exports.addComment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('requester', 'name email').populate('assignedAgent', 'name email');
  if (!ticket || ticket.isDeleted) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const { body } = req.body;
  if (!body) return res.status(400).json({ success: false, message: 'Comment body is required' });
  let isInternal = false;
  if (req.body.isInternal === true || req.body.isInternal === 'true') {
    if (['agent', 'manager', 'admin'].includes(req.user.role)) isInternal = true;
  }
  const attachments = req.files ? req.files.map((f) => ({ filename: f.filename, originalName: f.originalname, mimetype: f.mimetype, size: f.size })) : [];
  const comment = await TicketComment.create({ ticket: ticket._id, author: req.user._id, body, isInternal, attachments });
  // Set first response time if agent responding for first time
  if (!isInternal && ['agent', 'manager', 'admin'].includes(req.user.role) && !ticket.firstResponseAt) {
    ticket.firstResponseAt = new Date();
    await ticket.save();
  }
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'comment_added', note: isInternal ? 'Internal note added' : 'Public reply added' });
  const populated = await TicketComment.findById(comment._id).populate('author', 'name email role avatar');
  if (!isInternal) await notificationService.notifyNewReply(ticket, req.user);
  res.status(201).json({ success: true, data: populated });
});

// @desc  Get comments
// @route GET /api/tickets/:id/comments
exports.getComments = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const filter = { ticket: req.params.id };
  if (req.user.role === 'requester') filter.isInternal = false;
  const comments = await TicketComment.find(filter).populate('author', 'name email role avatar').sort('createdAt');
  res.json({ success: true, data: comments });
});

// @desc  Get ticket history
// @route GET /api/tickets/:id/history
exports.getHistory = asyncHandler(async (req, res) => {
  const history = await TicketHistory.find({ ticket: req.params.id }).populate('changedBy', 'name role').sort('createdAt');
  res.json({ success: true, data: history });
});

// @desc  Assign ticket
// @route POST /api/tickets/:id/assign
exports.assignTicket = asyncHandler(async (req, res) => {
  const { agentId, departmentId } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  const oldAgent = ticket.assignedAgent;
  const oldDept = ticket.department;
  if (agentId) ticket.assignedAgent = agentId;
  if (departmentId) ticket.department = departmentId;
  if (ticket.status === 'new') ticket.status = 'assigned';
  await ticket.save();
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'assigned', oldValue: String(oldAgent || ''), newValue: String(agentId || ''), note: `Assigned to agent` });
  const updated = await Ticket.findById(ticket._id).populate('requester', 'name email').populate('department', 'name').populate('assignedAgent', 'name email');
  await notificationService.notifyTicketAssigned(updated, agentId);
  res.json({ success: true, data: updated });
});

// @desc  Escalate ticket
// @route POST /api/tickets/:id/escalate
exports.escalateTicket = asyncHandler(async (req, res) => {
  const { departmentId, agentId, reason } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (departmentId) ticket.department = departmentId;
  if (agentId) ticket.assignedAgent = agentId;
  await ticket.save();
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'escalated', note: reason || 'Ticket escalated' });
  const updated = await Ticket.findById(ticket._id).populate('requester', 'name email').populate('department', 'name').populate('assignedAgent', 'name email');
  res.json({ success: true, data: updated });
});

// @desc  Resolve ticket
// @route POST /api/tickets/:id/resolve
exports.resolveTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('requester', 'name email');
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  ticket.status = 'resolved';
  ticket.resolvedAt = new Date();
  ticket.resolutionSummary = req.body.resolutionSummary || '';
  await ticket.save();
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'resolved', note: req.body.resolutionSummary || 'Ticket resolved' });
  await notificationService.notifyTicketResolved(ticket);
  res.json({ success: true, data: ticket });
});

// @desc  Close ticket
// @route POST /api/tickets/:id/close
exports.closeTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  ticket.status = 'closed';
  ticket.closedAt = new Date();
  await ticket.save();
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'closed', note: 'Ticket closed' });
  res.json({ success: true, data: ticket });
});

// @desc  Reopen ticket
// @route POST /api/tickets/:id/reopen
exports.reopenTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  ticket.status = 'reopened';
  ticket.resolvedAt = undefined;
  await ticket.save();
  await TicketHistory.create({ ticket: ticket._id, changedBy: req.user._id, action: 'reopened', note: req.body.reason || 'Ticket reopened' });
  res.json({ success: true, data: ticket });
});

// @desc  Delete ticket (soft)
// @route DELETE /api/tickets/:id
exports.deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  ticket.isDeleted = true;
  await ticket.save();
  res.json({ success: true, message: 'Ticket deleted' });
});

// @desc  Submit feedback
// @route POST /api/tickets/:id/feedback
exports.submitFeedback = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
  if (!['resolved', 'closed'].includes(ticket.status)) return res.status(400).json({ success: false, message: 'Can only rate resolved or closed tickets' });
  if (ticket.requester.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
  const existing = await Feedback.findOne({ ticket: ticket._id });
  if (existing) return res.status(400).json({ success: false, message: 'Feedback already submitted' });
  const feedback = await Feedback.create({ ticket: ticket._id, requester: req.user._id, agent: ticket.assignedAgent, rating: req.body.rating, comment: req.body.comment || '' });
  res.status(201).json({ success: true, data: feedback });
});
