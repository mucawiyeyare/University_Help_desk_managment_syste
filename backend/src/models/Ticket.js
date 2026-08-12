const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, unique: true, required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  type: { type: String, enum: ['incident', 'service_request', 'complaint', 'inquiry', 'suggestion'], default: 'incident' },
  priority: { type: String, enum: ['critical', 'high', 'medium', 'low'], default: 'medium' },
  impact: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  urgency: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status: { type: String, enum: ['new', 'assigned', 'in_progress', 'pending_user', 'pending_internal', 'resolved', 'closed', 'reopened', 'cancelled'], default: 'new' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  attachments: [AttachmentSchema],
  slaPolicy: { type: mongoose.Schema.Types.ObjectId, ref: 'SLAPolicy' },
  slaDueResponse: Date,
  slaDueResolution: Date,
  firstResponseAt: Date,
  slaResponseBreached: { type: Boolean, default: false },
  slaResolutionBreached: { type: Boolean, default: false },
  resolvedAt: Date,
  closedAt: Date,
  resolutionSummary: String,
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ department: 1 });
TicketSchema.index({ assignedAgent: 1 });
TicketSchema.index({ requester: 1 });
TicketSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);
