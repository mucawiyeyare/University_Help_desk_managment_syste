const AuditLog = require('../models/AuditLog');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
  if (req.query.actor) filter.actor = req.query.actor;
  if (req.query.dateFrom || req.query.dateTo) {
    filter.createdAt = {};
    if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) filter.createdAt.$lte = new Date(req.query.dateTo);
  }
  const { page, limit, skip } = getPagination(req.query);
  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('actor', 'name email role').sort('-createdAt').skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, data: logs, pagination: paginateResults(total, page, limit) });
});
