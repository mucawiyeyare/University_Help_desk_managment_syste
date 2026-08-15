const Ticket = require('../models/Ticket');

const generateTicketNumber = async () => {
  // Keep ticket IDs short and easy to read: 01, 02, 03, ...
  // Only the new numeric format is considered so older HD-YYYY-XXXXXX IDs
  // can remain in an existing database without affecting the new sequence.
  const [latestTicket] = await Ticket.aggregate([
    { $match: { ticketNumber: { $regex: /^\d+$/ } } },
    { $addFields: { sequence: { $toInt: '$ticketNumber' } } },
    { $sort: { sequence: -1 } },
    { $limit: 1 },
  ]);

  const nextNumber = (latestTicket?.sequence || 0) + 1;
  return String(nextNumber).padStart(2, '0');
};

module.exports = { generateTicketNumber };
