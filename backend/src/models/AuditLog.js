const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: String,
  action: { type: String, required: true },
  targetType: String,
  targetId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
