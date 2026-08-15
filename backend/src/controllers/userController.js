const User = require('../models/User');
const { asyncHandler, getPagination, paginateResults } = require('../utils/helpers');

const ensureNotLastActiveAdmin = async (user) => {
  if (user.role !== 'admin' || !user.isActive) return;
  const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
  if (activeAdminCount <= 1) {
    const error = new Error('At least one active administrator account must remain.');
    error.statusCode = 400;
    throw error;
  }
};

const getManagerDepartmentId = (req) => {
  const departmentId = req.user?.department?._id || req.user?.department;
  if (!departmentId) {
    const error = new Error('Managers must be assigned to a department before managing agents.');
    error.statusCode = 403;
    throw error;
  }
  return departmentId.toString();
};

const ensureManagerCanManageAgent = (req, user) => {
  if (req.user?.role !== 'manager') return;

  const departmentId = getManagerDepartmentId(req);
  const agentDepartmentId = user.department?._id || user.department;
  if (user.role !== 'agent' || !agentDepartmentId || agentDepartmentId.toString() !== departmentId) {
    const error = new Error('You can manage only agents in your department.');
    error.statusCode = 403;
    throw error;
  }
};

// @desc  Get all users
// @route GET /api/users
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user?.role === 'manager') {
    filter.department = getManagerDepartmentId(req);
    filter.role = 'agent';
  } else {
    if (req.query.role) filter.role = req.query.role;
    if (req.query.department) filter.department = req.query.department;
  }
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
  ensureManagerCanManageAgent(req, user);
  res.json({ success: true, data: user });
});

// @desc  Create user (admin)
// @route POST /api/users
exports.createUser = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.user?.role === 'manager') {
    payload.role = 'agent';
    payload.department = getManagerDepartmentId(req);
  }
  if (!payload.department || payload.department === '') {
    delete payload.department;
  }
  const user = await User.create(payload);
  res.status(201).json({ success: true, data: user });
});

// @desc  Update user
// @route PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureManagerCanManageAgent(req, user);

  const allowed = req.user?.role === 'manager'
    ? ['name', 'email', 'phone', 'isActive']
    : ['name', 'email', 'role', 'requesterType', 'department', 'phone', 'isActive'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  if (updates.department !== undefined && (!updates.department || updates.department === '')) {
    updates.department = null;
  }
  const isCurrentUser = user._id.toString() === req.user._id.toString();
  const removesAdminAccess = user.role === 'admin' && user.isActive && (
    updates.isActive === false || (updates.role && updates.role !== 'admin')
  );
  if (isCurrentUser && updates.isActive === false) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
  }
  if (removesAdminAccess) await ensureNotLastActiveAdmin(user);

  Object.assign(user, updates);
  if (req.body.password) user.password = req.body.password;
  await user.save();
  await user.populate('department', 'name');
  res.json({ success: true, data: user });
});

// @desc  Activate or deactivate a user
// @route PATCH /api/users/:id/status
exports.setUserStatus = asyncHandler(async (req, res) => {
  if (typeof req.body.isActive !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isActive must be true or false.' });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureManagerCanManageAgent(req, user);
  if (user._id.toString() === req.user._id.toString() && !req.body.isActive) {
    return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
  }
  if (!req.body.isActive) await ensureNotLastActiveAdmin(user);

  user.isActive = req.body.isActive;
  await user.save();
  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
    data: user,
  });
});

// @desc  Permanently delete user
// @route DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  ensureManagerCanManageAgent(req, user);
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }
  await ensureNotLastActiveAdmin(user);
  await user.deleteOne();
  res.json({ success: true, message: 'User permanently deleted' });
});

// @desc  Get agents list
// @route GET /api/users/agents
exports.getAgents = asyncHandler(async (req, res) => {
  const filter = { role: { $in: ['agent', 'manager'] }, isActive: true };
  if (req.user?.role === 'manager') {
    filter.department = getManagerDepartmentId(req);
  } else if (req.query.department) {
    filter.department = req.query.department;
  }
  const agents = await User.find(filter).populate('department', 'name').sort('name');
  res.json({ success: true, data: agents });
});
