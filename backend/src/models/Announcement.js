const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'maintenance', 'outage'], default: 'info' },
  isActive: { type: Boolean, default: true },
  expiresAt: Date,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
