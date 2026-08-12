const sendEmail = require('../config/email');

exports.sendTicketCreatedEmail = async (ticket, requester) => {
  const html = `<h2>Ticket Created: ${ticket.ticketNumber}</h2><p>Hi ${requester.name},</p><p>Your ticket "${ticket.subject}" has been created successfully.</p>`;
  await sendEmail({ to: requester.email, subject: `Ticket Created - ${ticket.ticketNumber}`, html });
};

exports.sendTicketAssignedEmail = async (ticket, agent) => {
  const html = `<h2>Ticket Assigned: ${ticket.ticketNumber}</h2><p>Hi ${agent.name},</p><p>Ticket "${ticket.subject}" has been assigned to you.</p>`;
  await sendEmail({ to: agent.email, subject: `Ticket Assigned - ${ticket.ticketNumber}`, html });
};

exports.sendAgentReplyEmail = async (ticket, requester, comment) => {
  const html = `<h2>New Reply on Ticket: ${ticket.ticketNumber}</h2><p>Hi ${requester.name},</p><p>An agent has replied to your ticket:</p><p>${comment.body}</p>`;
  await sendEmail({ to: requester.email, subject: `New Reply - ${ticket.ticketNumber}`, html });
};

exports.sendTicketResolvedEmail = async (ticket, requester) => {
  const html = `<h2>Ticket Resolved: ${ticket.ticketNumber}</h2><p>Hi ${requester.name},</p><p>Your ticket has been marked as resolved.</p><p>Summary: ${ticket.resolutionSummary}</p>`;
  await sendEmail({ to: requester.email, subject: `Ticket Resolved - ${ticket.ticketNumber}`, html });
};

exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `<h2>Password Reset Request</h2><p>Please click the link below to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`;
  await sendEmail({ to: user.email, subject: 'Password Reset', html });
};
