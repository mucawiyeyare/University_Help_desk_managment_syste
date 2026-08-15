const SLAPolicy = require('../models/SLAPolicy');
const { asyncHandler } = require('../utils/helpers');

const validateTargets = (policy) => {
  if (policy.responseTime > policy.resolutionTime) {
    const error = new Error('First response target cannot be longer than the resolution target');
    error.statusCode = 400;
    throw error;
  }
};

exports.getSLAPolicies = asyncHandler(async (req, res) => {
  const policies = await SLAPolicy.find().sort('-isActive createdAt');
  res.json({ success: true, data: policies });
});

exports.getSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findById(req.params.id);
  if (!policy) return res.status(404).json({ success: false, message: 'SLA Policy not found' });
  res.json({ success: true, data: policy });
});

exports.createSLAPolicy = asyncHandler(async (req, res) => {
  validateTargets(req.body);
  const policy = await SLAPolicy.create(req.body);
  res.status(201).json({ success: true, data: policy });
});

exports.updateSLAPolicy = asyncHandler(async (req, res) => {
  const existingPolicy = await SLAPolicy.findById(req.params.id);
  if (!existingPolicy) return res.status(404).json({ success: false, message: 'SLA Policy not found' });

  validateTargets({
    responseTime: req.body.responseTime ?? existingPolicy.responseTime,
    resolutionTime: req.body.resolutionTime ?? existingPolicy.resolutionTime,
  });

  const policy = await SLAPolicy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: policy });
});

exports.deleteSLAPolicy = asyncHandler(async (req, res) => {
  const policy = await SLAPolicy.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!policy) return res.status(404).json({ success: false, message: 'SLA Policy not found' });
  res.json({ success: true, message: 'SLA Policy deactivated' });
});
