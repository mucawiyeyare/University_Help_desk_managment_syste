const mongoose = require('mongoose');

const SLAPolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
  responseTime: { type: Number, required: true }, // in minutes
  resolutionTime: { type: Number, required: true }, // in minutes
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('SLAPolicy', SLAPolicySchema);
