const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number
}, { _id: false });

const TicketCommentSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  attachments: [AttachmentSchema]
}, { timestamps: true });

module.exports = mongoose.model('TicketComment', TicketCommentSchema);
