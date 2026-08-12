const User = require('../models/User');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

// @desc  Get all users
// @route GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user?.role === 'manager' && req.user?.department) {
    filter.department = req.user.department._id || req.user.department;
  }
  if (req.query.role) filter.role = req.query.role;
  if (req.query.department) filter.department = req.query.department;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) filter.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
  const { page, limit, skip } = getPagination(req.query);
  const [users, total] = await Promise.all([
    User.find(filter).populate('department', 'name').sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: paginateResults(total, page, limit) });
});

// @desc  Get single user
// @route GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('department', 'name');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// @desc  Create user (admin)
// @route POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (!payload.department || payload.department === '') {
    delete payload.department;
  }
  const user = await User.create(payload);
  res.status(201).json({ success: true, data: user });
});

// @desc  Update user
// @route PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const allowed = ['name', 'email', 'role', 'requesterType', 'department', 'phone', 'isActive'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (!updates.department || updates.department === '') {
    updates.department = null;
  }
  if (req.body.password) {
    const user = await User.findById(req.params.id);
    user.password = req.body.password;
    Object.assign(user, updates);
    await user.save();
    return res.json({ success: true, data: user });
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('department', 'name');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// @desc  Delete user (deactivate)
// @route DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deactivated' });
});

// @desc  Get agents list
// @route GET /api/users/agents
exports.getAgents = asyncHandler(async (req, res) => {
  const filter = { role: { $in: ['agent', 'manager'] }, isActive: true };
  if (req.user?.role === 'manager' && req.user?.department) {
    filter.department = req.user.department._id || req.user.department;
  } else if (req.query.department) {
    filter.department = req.query.department;
  }
  const agents = await User.find(filter).populate('department', 'name').sort('name');
  res.json({ success: true, data: agents });
});
