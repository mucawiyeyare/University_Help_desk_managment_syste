const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Department = require('../models/Department');
const Feedback = require('../models/Feedback');
const { asyncHandler } = require('../utils/helpers');

// @desc  System-wide dashboard stats
// @route GET /api/reports/dashboard
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};

  const [
    totalTickets, openTickets, resolvedToday,
    newTickets, inProgress, pendingUser, resolved, closed,
    overdue, totalUsers, totalAgents, totalDepts,
    slaBreached, slaTotalActive
  ] = await Promise.all([
    Ticket.countDocuments({ isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: { $in: ['new', 'assigned', 'in_progress', 'pending_user'] }, isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'resolved', resolvedAt: { $gte: todayStart }, isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'new', isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'in_progress', isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'pending_user', isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'resolved', isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: 'closed', isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ slaDueResolution: { $lt: new Date() }, status: { $nin: ['resolved', 'closed', 'cancelled'] }, isDeleted: false, ...deptFilter }),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: { $in: ['agent', 'manager'] }, isActive: true }),
    Department.countDocuments({ isActive: true }),
    Ticket.countDocuments({ $or: [{ slaResponseBreached: true }, { slaResolutionBreached: true }], isDeleted: false, ...deptFilter }),
    Ticket.countDocuments({ status: { $nin: ['resolved', 'closed', 'cancelled'] }, slaPolicy: { $exists: true }, isDeleted: false, ...deptFilter }),
  ]);

  const slaCompliance = slaTotalActive > 0 ? Math.round(((slaTotalActive - slaBreached) / slaTotalActive) * 100) : 100;

  res.json({
    success: true,
    data: {
      totalTickets, openTickets, resolvedToday,
      newTickets, inProgress, pendingUser, resolved, closed,
      overdue, totalUsers, totalAgents, totalDepts, slaCompliance,
    },
  });
});

// @desc  Ticket volume by date
// @route GET /api/reports/volume
exports.getTicketVolumeReport = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 14;
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - days);

  const data = await Ticket.aggregate([
    { $match: { createdAt: { $gte: dateFrom }, isDeleted: false, ...deptFilter } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data });
});

// @desc  Tickets by status
// @route GET /api/reports/by-status
exports.getTicketsByStatus = asyncHandler(async (req, res) => {
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false, ...deptFilter } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, data });
});

// @desc  Tickets by priority
// @route GET /api/reports/by-priority
exports.getTicketsByPriority = asyncHandler(async (req, res) => {
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false, ...deptFilter } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data });
});

// @desc  Tickets by category
// @route GET /api/reports/by-category
exports.getTicketsByCategory = asyncHandler(async (req, res) => {
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
    { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
    { $project: { name: { $ifNull: ['$cat.name', 'Uncategorized'] }, count: 1 } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
  res.json({ success: true, data });
});

// @desc  Agent performance
// @route GET /api/reports/agent-performance
exports.getAgentPerformance = asyncHandler(async (req, res) => {
  const data = await Ticket.aggregate([
    { $match: { assignedAgent: { $exists: true, $ne: null }, isDeleted: false } },
    {
      $group: {
        _id: '$assignedAgent',
        assigned: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgResolutionMs: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null,
            ],
          },
        },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
    { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
    { $project: { name: '$agent.name', email: '$agent.email', assigned: 1, resolved: 1, avgResolutionHours: { $divide: ['$avgResolutionMs', 3600000] } } },
    { $sort: { resolved: -1 } },
  ]);
  res.json({ success: true, data });
});

// @desc  SLA compliance report
// @route GET /api/reports/sla
exports.getSLAReport = asyncHandler(async (req, res) => {
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};
  const data = await Ticket.aggregate([
    { $match: { slaPolicy: { $exists: true }, isDeleted: false, ...deptFilter } },
    {
      $group: {
        _id: '$priority',
        total: { $sum: 1 },
        responseBreached: { $sum: { $cond: ['$slaResponseBreached', 1, 0] } },
        resolutionBreached: { $sum: { $cond: ['$slaResolutionBreached', 1, 0] } },
      },
    },
  ]);
  res.json({ success: true, data });
});

// @desc  Satisfaction report
// @route GET /api/reports/satisfaction
exports.getSatisfactionReport = asyncHandler(async (req, res) => {
  const data = await Feedback.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 }, dist: { $push: '$rating' } } },
  ]);
  const distribution = [1, 2, 3, 4, 5].map((r) => ({
    rating: r,
    count: data[0]?.dist?.filter((d) => d === r).length || 0,
  }));
  res.json({ success: true, data: { avgRating: data[0]?.avgRating || 0, totalFeedback: data[0]?.count || 0, distribution } });
});

// @desc  Ticket aging
// @route GET /api/reports/aging
exports.getTicketAging = asyncHandler(async (req, res) => {
  const now = new Date();
  const deptFilter = req.user.role === 'manager' && req.user.department ? { department: req.user.department._id } : {};
  const openTickets = await Ticket.find({ status: { $nin: ['resolved', 'closed', 'cancelled'] }, isDeleted: false, ...deptFilter }).select('createdAt');
  const buckets = { '<24h': 0, '1-3d': 0, '3-7d': 0, '7-30d': 0, '>30d': 0 };
  openTickets.forEach((t) => {
    const hours = (now - new Date(t.createdAt)) / 3600000;
    if (hours < 24) buckets['<24h']++;
    else if (hours < 72) buckets['1-3d']++;
    else if (hours < 168) buckets['3-7d']++;
    else if (hours < 720) buckets['7-30d']++;
    else buckets['>30d']++;
  });
  res.json({ success: true, data: buckets });
});
