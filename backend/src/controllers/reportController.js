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

// @desc  Resolved and unresolved ticket time summary
// @route GET /api/reports/time-summary
exports.getTicketTimeSummary = asyncHandler(async (req, res) => {
  const deptFilter = req.user.role === 'manager' && req.user.department
    ? { department: req.user.department._id || req.user.department }
    : {};
  const now = new Date();
  const completedStatuses = ['resolved', 'closed', 'cancelled'];

  const [summary] = await Ticket.aggregate([
    { $match: { isDeleted: false, ...deptFilter } },
    {
      $group: {
        _id: null,
        totalUnresolved: {
          $sum: { $cond: [{ $in: ['$status', completedStatuses] }, 0, 1] },
        },
        avgUnresolvedMs: {
          $avg: {
            $cond: [
              { $in: ['$status', completedStatuses] },
              null,
              { $subtract: [now, '$createdAt'] },
            ],
          },
        },
        totalResolved: {
          $sum: { $cond: [{ $in: ['$status', completedStatuses] }, 1, 0] },
        },
        avgResolutionMs: {
          $avg: {
            $cond: [
              {
                $and: [
                  { $in: ['$status', completedStatuses] },
                  { $ne: [{ $ifNull: ['$resolvedAt', '$closedAt'] }, null] },
                ],
              },
              { $subtract: [{ $ifNull: ['$resolvedAt', '$closedAt'] }, '$createdAt'] },
              null,
            ],
          },
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalUnresolved: summary?.totalUnresolved || 0,
      totalResolved: summary?.totalResolved || 0,
      avgUnresolvedMs: Math.round(summary?.avgUnresolvedMs || 0),
      avgResolutionMs: Math.round(summary?.avgResolutionMs || 0),
    },
  });
});

// @desc  Resolved-ticket SLA performance
// @route GET /api/reports/resolved-sla
exports.getResolvedSLAReport = asyncHandler(async (req, res) => {
  const deptFilter = req.user.role === 'manager' && req.user.department
    ? { department: req.user.department._id || req.user.department }
    : {};

  const [report] = await Ticket.aggregate([
    {
      $match: {
        isDeleted: false,
        status: { $in: ['resolved', 'closed'] },
        slaDueResolution: { $ne: null },
        ...deptFilter,
      },
    },
    {
      $project: {
        priority: 1,
        slaDueResolution: 1,
        completedAt: { $ifNull: ['$resolvedAt', '$closedAt'] },
      },
    },
    { $match: { completedAt: { $ne: null } } },
    {
      $project: {
        priority: 1,
        resolvedAfterDeadline: { $gt: ['$completedAt', '$slaDueResolution'] },
      },
    },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalResolved: { $sum: 1 },
              resolvedWithinSLA: { $sum: { $cond: ['$resolvedAfterDeadline', 0, 1] } },
              resolvedAfterDeadline: { $sum: { $cond: ['$resolvedAfterDeadline', 1, 0] } },
            },
          },
        ],
        byPriority: [
          {
            $group: {
              _id: '$priority',
              resolvedWithinSLA: { $sum: { $cond: ['$resolvedAfterDeadline', 0, 1] } },
              resolvedAfterDeadline: { $sum: { $cond: ['$resolvedAfterDeadline', 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const summary = report?.summary?.[0] || {};
  const totalResolved = summary.totalResolved || 0;
  const resolvedAfterDeadline = summary.resolvedAfterDeadline || 0;

  res.json({
    success: true,
    data: {
      totalResolved,
      resolvedWithinSLA: summary.resolvedWithinSLA || 0,
      resolvedAfterDeadline,
      lateResolutionRate: totalResolved ? Math.round((resolvedAfterDeadline / totalResolved) * 100) : 0,
      byPriority: report?.byPriority || [],
    },
  });
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

// @desc  Rank agents by tickets resolved within their SLA deadline
// @route GET /api/reports/agent-sla-ranking
exports.getAgentSLARanking = asyncHandler(async (req, res) => {
  const userDepartment = req.user.department?._id || req.user.department;
  const departmentFilter = req.user.role === 'manager' && userDepartment
    ? { department: userDepartment }
    : req.user.role === 'agent' && userDepartment
      ? { department: userDepartment }
      : req.user.role === 'agent'
        ? { assignedAgent: req.user._id }
        : {};

  const agents = await Ticket.aggregate([
    {
      $match: {
        isDeleted: false,
        status: { $in: ['resolved', 'closed'] },
        assignedAgent: { $ne: null },
        slaDueResolution: { $ne: null },
        ...departmentFilter,
      },
    },
    {
      $project: {
        assignedAgent: 1,
        createdAt: 1,
        slaDueResolution: 1,
        completedAt: { $ifNull: ['$resolvedAt', '$closedAt'] },
      },
    },
    { $match: { completedAt: { $ne: null } } },
    {
      $project: {
        assignedAgent: 1,
        resolvedWithinSLA: { $lte: ['$completedAt', '$slaDueResolution'] },
        resolutionTimeMs: { $subtract: ['$completedAt', '$createdAt'] },
      },
    },
    {
      $group: {
        _id: '$assignedAgent',
        totalResolved: { $sum: 1 },
        resolvedWithinSLA: { $sum: { $cond: ['$resolvedWithinSLA', 1, 0] } },
        resolvedAfterSLA: { $sum: { $cond: ['$resolvedWithinSLA', 0, 1] } },
        avgResolutionMs: { $avg: '$resolutionTimeMs' },
      },
    },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'agent' } },
    { $unwind: '$agent' },
    { $match: { 'agent.role': 'agent', 'agent.isActive': true } },
    {
      $project: {
        _id: 0,
        agentId: '$_id',
        name: '$agent.name',
        email: '$agent.email',
        avatar: '$agent.avatar',
        totalResolved: 1,
        resolvedWithinSLA: 1,
        resolvedAfterSLA: 1,
        avgResolutionMs: 1,
      },
    },
  ]);

  const ranking = agents
    .map((agent) => ({
      ...agent,
      avgResolutionMs: Math.round(agent.avgResolutionMs || 0),
      slaComplianceRate: agent.totalResolved
        ? Math.round((agent.resolvedWithinSLA / agent.totalResolved) * 100)
        : 0,
    }))
    .sort((first, second) => (
      second.resolvedWithinSLA - first.resolvedWithinSLA
      || second.slaComplianceRate - first.slaComplianceRate
      || second.totalResolved - first.totalResolved
      || first.name.localeCompare(second.name)
    ))
    .map((agent, index) => ({ ...agent, rank: index + 1 }));

  const myRank = ranking.find((agent) => String(agent.agentId) === String(req.user._id)) || null;
  const isAgent = req.user.role === 'agent';

  res.json({
    success: true,
    data: {
      scope: isAgent ? 'your department' : req.user.role === 'manager' ? 'your department' : 'all departments',
      totalRankedAgents: ranking.length,
      myRank,
      agents: isAgent ? (myRank ? [myRank] : []) : ranking,
    },
  });
});

// @desc  Rank departments by student complaint tickets
// @route GET /api/reports/student-complaint-departments
exports.getStudentComplaintDepartmentReport = asyncHandler(async (req, res) => {
  const userDepartment = req.user.department?._id || req.user.department;
  const departmentFilter = req.user.role === 'manager' && userDepartment
    ? { _id: userDepartment }
    : {};
  const departments = await Department.find({ isActive: true, ...departmentFilter }).select('name');
  const departmentIds = departments.map((department) => department._id);

  const complaintCounts = departmentIds.length ? await Ticket.aggregate([
    {
      $match: {
        isDeleted: false,
        type: 'complaint',
        department: { $in: departmentIds },
      },
    },
    { $lookup: { from: 'users', localField: 'requester', foreignField: '_id', as: 'requesterUser' } },
    { $unwind: '$requesterUser' },
    { $match: { 'requesterUser.requesterType': 'student' } },
    { $group: { _id: '$department', complaintCount: { $sum: 1 } } },
  ]) : [];

  const countByDepartment = new Map(
    complaintCounts.map((entry) => [String(entry._id), entry.complaintCount])
  );
  const rankedDepartments = departments
    .map((department) => ({
      departmentId: department._id,
      name: department.name,
      complaintCount: countByDepartment.get(String(department._id)) || 0,
    }))
    .sort((first, second) => second.complaintCount - first.complaintCount || first.name.localeCompare(second.name));
  const lowest = [...rankedDepartments].sort(
    (first, second) => first.complaintCount - second.complaintCount || first.name.localeCompare(second.name)
  )[0] || null;

  res.json({
    success: true,
    data: {
      scope: req.user.role === 'manager' ? 'your department' : 'all departments',
      departments: rankedDepartments,
      highest: rankedDepartments[0] || null,
      lowest,
    },
  });
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
