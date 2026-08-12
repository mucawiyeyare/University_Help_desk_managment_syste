const Department = require('../models/Department');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

exports.getDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.active !== 'false') filter.isActive = true;
  const departments = await Department.find(filter)
    .populate('manager', 'name email')
    .populate('agents', 'name email role')
    .sort('name');
  res.json({ success: true, data: departments });
});

exports.getDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findById(req.params.id).populate('manager', 'name email').populate('agents', 'name email role');
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: dept });
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: dept });
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('manager', 'name email').populate('agents', 'name email role');
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: dept });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  await Department.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: 'Department deactivated' });
});

exports.addAgent = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, { $addToSet: { agents: req.body.agentId } }, { new: true }).populate('agents', 'name email role');
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: dept });
});

exports.removeAgent = asyncHandler(async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, { $pull: { agents: req.body.agentId } }, { new: true }).populate('agents', 'name email role');
  if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
  res.json({ success: true, data: dept });
});
