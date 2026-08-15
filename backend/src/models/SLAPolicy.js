const mongoose = require('mongoose');

const SLAPolicySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  priority: { type: String, required: true, enum: ['critical', 'high', 'medium', 'low'] },
  responseTime: { type: Number, required: true, min: 1 }, // in minutes
  resolutionTime: { type: Number, required: true, min: 1 }, // in minutes
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SLAPolicy', SLAPolicySchema);
