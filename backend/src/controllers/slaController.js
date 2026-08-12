const SLAPolicy = require('../models/SLAPolicy');
const { asyncHandler } = require('../utils/helpers');

exports.getSLAPolicies = asyncHandler(async (req, res) => {
  const policies = await SLAPolicy.find().sort('priority');
  res.json({ success: true, data: policies });
});

exports.getSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findById(req.params.id);
  if (!policy) return res.status(404).json({ success: false, message: 'SLA Policy not found' });
  res.json({ success: true, data: policy });
});

exports.createSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.create(req.body);
  res.status(201).json({ success: true, data: policy });
});

exports.updateSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!policy) return res.status(404).json({ success: false, message: 'SLA Policy not found' });
  res.json({ success: true, data: policy });
});

exports.deleteSLAPolicy = asyncHandler(async (req, res) => {
  await SLAPolicy.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'SLA Policy deactivated' });
});
