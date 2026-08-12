const mongoose = require('mongoose');

const TicketHistorySchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  field: String,
  oldValue: String,
  newValue: String,
  note: String
}, { timestamps: true });

module.exports = mongoose.model('TicketHistory', TicketHistorySchema);
