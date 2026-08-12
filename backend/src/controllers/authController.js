const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../utils/helpers');
const sendEmail = require('../config/email');

// Send token response with cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
  };
  const userData = {
    _id: user._id, name: user.name, email: user.email,
    role: user.role, requesterType: user.requesterType,
    department: user.department, avatar: user.avatar, phone: user.phone,
  };
  res.status(statusCode).cookie('token', token, options).json({ success: true, user: userData });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, requesterType, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, password, requesterType: requesterType || 'student', phone: phone || '' });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  const user = await User.findOne({ email }).select('+password').populate('department', 'name');
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated. Contact admin.' });
  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  await AuditLog.create({ actor: user._id, actorName: user.name, action: 'user_login', ipAddress: req.ip });
  sendTokenResponse(user, 200, res);
});

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
});

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name');
  res.json({ success: true, data: user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, requesterType } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, requesterType },
    { new: true, runValidators: true }
  ).populate('department', 'name');
  res.json({ success: true, data: user });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `<div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0F172A;color:#F1F5F9;padding:32px;border-radius:12px;">
    <h2 style="color:#6366F1;">Password Reset Request</h2>
    <p>Hello ${user.name},</p>
    <p>You requested a password reset for your UHDMS account. Click the button below to reset your password:</p>
    <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:linear-gradient(135deg,#6366F1,#4F46E5);color:white;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
    <p style="color:#94A3B8;font-size:12px;">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
  </div>`;
  try {
    await sendEmail({ to: user.email, subject: 'UHDMS Password Reset', html });
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({ success: false, message: 'Email could not be sent' });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});
