const SystemSettings = require('../models/SystemSettings');
const { asyncHandler } = require('../utils/helpers');

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.find().sort('group key');
  res.json({ success: true, data: settings });
});

exports.getSetting = asyncHandler(async (req, res) => {
  const setting = await SystemSettings.findOne({ key: req.params.key });
  if (!setting) return res.status(404).json({ success: false, message: 'Setting not found' });
  res.json({ success: true, data: setting });
});

exports.updateSetting = asyncHandler(async (req, res) => {
  const setting = await SystemSettings.findOneAndUpdate(
    { key: req.params.key },
    { value: req.body.value, updatedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.json({ success: true, data: setting });
});

exports.getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSettings.find({ group: 'general' }).select('key value');
  const obj = {};
  settings.forEach((s) => { obj[s.key] = s.value; });
  res.json({ success: true, data: obj });
});
