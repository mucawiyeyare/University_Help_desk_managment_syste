const Ticket = require('../models/Ticket');

const generateTicketNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Ticket.countDocuments();
  const nextNum = count + 1;
  const paddedNum = nextNum.toString().padStart(6, '0');
  return `HD-${year}-${paddedNum}`;
};

module.exports = { generateTicketNumber };
