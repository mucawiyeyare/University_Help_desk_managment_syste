const Feedback = require('../models/Feedback');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

exports.getAllFeedback = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.rating) filter.rating = parseInt(req.query.rating);
  if (req.query.agent) filter.agent = req.query.agent;
  const { page, limit, skip } = getPagination(req.query);
  const [feedback, total] = await Promise.all([
    Feedback.find(filter).populate('ticket', 'ticketNumber subject').populate('requester', 'name email').populate('agent', 'name email').sort('-createdAt').skip(skip).limit(limit),
    Feedback.countDocuments(filter),
  ]);
  res.json({ success: true, data: feedback, pagination: paginateResults(total, page, limit) });
});

exports.getFeedbackStats = asyncHandler(async (req, res) => {
  const stats = await Feedback.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const distribution = await Feedback.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ success: true, data: { avgRating: stats[0]?.avgRating || 0, total: stats[0]?.count || 0, distribution } });
});
