const Notification = require('../models/Notification');

exports.createNotification = async ({ recipient, type, title, message, ticket }) => {
  const notification = await Notification.create({ recipient, type, title, message, ticket });
  if (global.io) {
    global.io.to(recipient.toString()).emit('notification', notification);
  }
  return notification;
};

exports.notifyTicketCreated = async (ticket) => {
  if (ticket.assignedAgent) {
    await this.createNotification({
      recipient: ticket.assignedAgent,
      type: 'ticket_created',
      title: 'New Ticket',
      message: `Ticket ${ticket.ticketNumber} created`,
      ticket: ticket._id
    });
  }
};

exports.notifyTicketAssigned = async (ticket, agent) => {
  const recipient = agent?._id || agent;
  if (!recipient) return null;

  await this.createNotification({
    recipient,
    type: 'ticket_assigned',
    title: 'Ticket Assigned',
    message: `Ticket ${ticket.ticketNumber} assigned to you`,
    ticket: ticket._id
  });
};

exports.notifyNewReply = async (ticket, author) => {
  const authorId = author?._id || author;
  const authorRole = author?.role;
  const recipient = authorRole === 'requester'
    ? (ticket.assignedAgent?._id || ticket.assignedAgent)
    : (ticket.requester?._id || ticket.requester);

  if (!recipient || String(recipient) === String(authorId)) return null;

  return this.createNotification({
    recipient,
    type: authorRole === 'requester' ? 'requester_replied' : 'agent_replied',
    title: 'New Reply',
    message: `New reply on ticket ${ticket.ticketNumber}`,
    ticket: ticket._id
  });
};

exports.notifyStatusChanged = async (ticket, oldStatus, newStatus) => {
  await this.createNotification({
    recipient: ticket.requester,
    type: 'status_changed',
    title: 'Status Changed',
    message: `Ticket ${ticket.ticketNumber} status changed to ${newStatus}`,
    ticket: ticket._id
  });
};

exports.notifyTicketResolved = async (ticket) => {
  await this.createNotification({
    recipient: ticket.requester,
    type: 'ticket_resolved',
    title: 'Ticket Resolved',
    message: `Ticket ${ticket.ticketNumber} resolved`,
    ticket: ticket._id
  });
};

exports.notifySLABreach = async (ticket) => {
  if (ticket.assignedAgent) {
    await this.createNotification({
      recipient: ticket.assignedAgent,
      type: 'sla_breach',
      title: 'SLA Breach',
      message: `Ticket ${ticket.ticketNumber} breached SLA`,
      ticket: ticket._id
    });
  }
};
