const Announcement = require('../models/Announcement');
const { asyncHandler } = require('../utils/helpers');

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const now = new Date();
  const announcements = await Announcement.find({ isActive: true, $or: [{ expiresAt: { $gt: now } }, { expiresAt: null }] }).sort('-createdAt');
  res.json({ success: true, data: announcements });
});

exports.getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().populate('author', 'name').sort('-createdAt');
  res.json({ success: true, data: announcements });
});

exports.createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, author: req.user._id });
  res.status(201).json({ success: true, data: announcement });
});

exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
  res.json({ success: true, data: announcement });
});

exports.deleteAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Announcement deleted' });
});
