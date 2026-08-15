const Notification = require('../models/Notification');
const User = require('../models/User');
const emailService = require('./emailService');

const getId = (value) => value?._id || value;
const isSameUser = (first, second) => first && second && String(getId(first)) === String(getId(second));

// ─── Department manager lookup ────────────────────────────────────────────────
const getDepartmentManagers = async (department) => {
  const departmentId = getId(department);
  if (!departmentId) return [];
  return User.find({ department: departmentId, role: 'manager', isActive: true }).select('_id name email');
};

// ─── SLA recipient lookup ─────────────────────────────────────────────────────
const getSLARecipients = async (ticket) => {
  const recipients = new Map();
  const assignedAgent = getId(ticket.assignedAgent);
  if (assignedAgent) recipients.set(String(assignedAgent), assignedAgent);
  const managers = await getDepartmentManagers(ticket.department);
  managers.forEach((manager) => recipients.set(String(manager._id), manager._id));
  return [...recipients.values()];
};

// ─── Core: create in-app notification + emit via socket ──────────────────────
exports.createNotification = async ({ recipient, type, title, message, ticket }) => {
  const notification = await Notification.create({ recipient, type, title, message, ticket });
  if (global.io) {
    global.io.to(recipient.toString()).emit('notification', notification);
  }
  return notification;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🎫 TICKET CREATED — notify managers via in-app + Gmail
// ═══════════════════════════════════════════════════════════════════════════════
exports.notifyTicketCreated = async (ticket) => {
  // 1. In-app notification for assigned agent (if any)
  if (ticket.assignedAgent) {
    await exports.createNotification({
      recipient: getId(ticket.assignedAgent),
      type: 'ticket_created',
      title: 'New Ticket',
      message: `Ticket ${ticket.ticketNumber} was created and assigned to you`,
      ticket: ticket._id,
    });
  }

  // 2. Fetch department managers with full profile (name + email)
  const managers = await getDepartmentManagers(ticket.department);

  // 3. Fetch requester full profile (need name, email, requesterType)
  let requester = ticket.requester;
  if (requester && !requester.requesterType) {
    try {
      requester = await User.findById(getId(ticket.requester)).select('name email requesterType');
    } catch (_) { /* use what we have */ }
  }

  // 4. For each manager: in-app notification + Gmail
  await Promise.all(
    managers.map(async (manager) => {
      // In-app notification
      await exports.createNotification({
        recipient: manager._id,
        type: 'department_ticket_created',
        title: 'New Department Ticket',
        message: `Ticket ${ticket.ticketNumber} was created in your department by ${requester?.name || 'a user'}`,
        ticket: ticket._id,
      });

      // Gmail notification to manager
      try {
        await emailService.sendNewTicketToManager(ticket, manager, requester || {});
        console.log(`[Email] New-ticket email sent to manager: ${manager.email}`);
      } catch (emailErr) {
        console.error(`[Email] Failed to send new-ticket email to manager ${manager.email}:`, emailErr.message);
      }
    })
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 TICKET ASSIGNED — notify agent via in-app + Gmail
// ═══════════════════════════════════════════════════════════════════════════════
exports.notifyTicketAssigned = async (ticket, agent, previousAgent) => {
  const recipient = agent?._id || agent;
  const wasReassigned = previousAgent && !isSameUser(previousAgent, recipient);

  // 1. In-app for new agent
  if (recipient) {
    await exports.createNotification({
      recipient,
      type: wasReassigned ? 'ticket_reassigned' : 'ticket_assigned',
      title: wasReassigned ? 'Ticket Reassigned' : 'Ticket Assigned',
      message: wasReassigned
        ? `Ticket ${ticket.ticketNumber} was reassigned to you`
        : `Ticket ${ticket.ticketNumber} was assigned to you`,
      ticket: ticket._id,
    });

    // 2. Gmail for new agent — fetch full agent record (name + email) if needed
    try {
      let agentRecord = ticket.assignedAgent;
      if (!agentRecord?.email) {
        agentRecord = await User.findById(getId(recipient)).select('name email');
      }

      // Fetch requester full profile for the "submitted by" field
      let requester = ticket.requester;
      if (requester && !requester.requesterType) {
        try {
          requester = await User.findById(getId(ticket.requester)).select('name email requesterType');
        } catch (_) { /* use what we have */ }
      }

      if (agentRecord?.email) {
        await emailService.sendTicketAssignedToAgent(ticket, agentRecord, requester || {});
        console.log(`[Email] Assignment email sent to agent: ${agentRecord.email}`);
      }
    } catch (emailErr) {
      console.error(`[Email] Failed to send assignment email to agent:`, emailErr.message);
    }
  }

  // 3. In-app notification for previous agent (unassigned / reassigned)
  if (previousAgent && !isSameUser(previousAgent, recipient)) {
    await exports.createNotification({
      recipient: previousAgent,
      type: 'ticket_reassigned',
      title: 'Ticket Reassigned',
      message: recipient
        ? `Ticket ${ticket.ticketNumber} was reassigned to another agent`
        : `Ticket ${ticket.ticketNumber} is no longer assigned to you`,
      ticket: ticket._id,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// Remaining notification helpers (this → exports fix applied throughout)
// ═══════════════════════════════════════════════════════════════════════════════

exports.notifyNewReply = async (ticket, author) => {
  const authorId = author?._id || author;
  const authorRole = author?.role;
  const recipient = authorRole === 'requester'
    ? (ticket.assignedAgent?._id || ticket.assignedAgent)
    : (ticket.requester?._id || ticket.requester);

  if (!recipient || String(recipient) === String(authorId)) return null;

  return exports.createNotification({
    recipient,
    type: authorRole === 'requester' ? 'requester_replied' : 'agent_replied',
    title: 'New Reply',
    message: `New reply on ticket ${ticket.ticketNumber}`,
    ticket: ticket._id,
  });
};

exports.notifyStatusChanged = async (ticket, oldStatus, newStatus, actor) => {
  if (isSameUser(ticket.requester, actor)) return null;
  await exports.createNotification({
    recipient: getId(ticket.requester),
    type: 'status_changed',
    title: 'Status Changed',
    message: `Ticket ${ticket.ticketNumber} status changed to ${newStatus}`,
    ticket: ticket._id,
  });
};

exports.notifyTicketResolved = async (ticket, actor) => {
  if (isSameUser(ticket.requester, actor)) return null;
  await exports.createNotification({
    recipient: getId(ticket.requester),
    type: 'ticket_resolved',
    title: 'Ticket Resolved',
    message: `Ticket ${ticket.ticketNumber} resolved`,
    ticket: ticket._id,
  });
};

exports.notifySLABreach = async (ticket) => {
  const recipients = await getSLARecipients(ticket);
  await Promise.all(
    recipients.map((recipient) =>
      exports.createNotification({
        recipient,
        type: 'sla_breach',
        title: 'SLA Breach',
        message: `Ticket ${ticket.ticketNumber} has breached its resolution SLA`,
        ticket: ticket._id,
      })
    )
  );
};

exports.notifySLAApproaching = async (ticket) => {
  const recipients = await getSLARecipients(ticket);
  await Promise.all(
    recipients.map((recipient) =>
      exports.createNotification({
        recipient,
        type: 'sla_approaching',
        title: 'SLA Approaching',
        message: `Ticket ${ticket.ticketNumber} is due within the next hour`,
        ticket: ticket._id,
      })
    )
  );
};
