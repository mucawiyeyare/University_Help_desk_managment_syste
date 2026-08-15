const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: false,
    },
    eventType: {
      type: String,
      enum: ['ticket_created', 'ticket_assigned', 'ticket_resolved', 'test_email'],
      required: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      required: true,
    },
    messageId: {
      type: String,
    },
    error: {
      type: String,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

emailLogSchema.index({ ticket: 1, eventType: 1, recipientEmail: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
