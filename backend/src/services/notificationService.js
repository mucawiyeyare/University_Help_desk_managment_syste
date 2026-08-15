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
// 1. TICKET CREATED
//    - In-app notification to Admin & Department Manager
//    - Real Gmail notification ONLY to Department Manager (NO email to Admin)
// ═══════════════════════════════════════════════════════════════════════════════
exports.notifyTicketCreated = async (ticket) => {
  let requester = ticket.requester;
  if (requester && (!requester.name || !requester.email)) {
    try {
      requester = await User.findById(getId(ticket.requester)).select('name email requesterType');
    } catch (_) {}
  }

  // 1. In-app notification to System Admins (NO EMAIL TO ADMIN)
  try {
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id name email');
    await Promise.all(
      admins.map(async (admin) => {
        await exports.createNotification({
          recipient: admin._id,
          type: 'ticket_created',
          title: 'New Ticket Created',
          message: `Ticket ${ticket.ticketNumber} was created by ${requester?.name || 'a user'}`,
          ticket: ticket._id,
        });
      })
    );
  } catch (adminErr) {
    console.error('[Notification] Failed to notify admins in-app:', adminErr.message);
  }

  // 2. Department manager lookup
  const managers = await getDepartmentManagers(ticket.department);

  // 3. In-app notification + Asynchronous Gmail ONLY to Department Managers
  await Promise.all(
    managers.map(async (manager) => {
      await exports.createNotification({
        recipient: manager._id,
        type: 'department_ticket_created',
        title: 'New Department Ticket',
        message: `Ticket ${ticket.ticketNumber} was created in your department by ${requester?.name || 'a user'}`,
        ticket: ticket._id,
      });

      // Background non-blocking email dispatch
      setImmediate(async () => {
        try {
          if (manager.email) {
            await emailService.sendNewTicketToManager(ticket, manager, requester || {});
          }
        } catch (emailErr) {
          console.error(`[Email] Failed to send ticket creation email to manager ${manager.email}:`, emailErr.message);
        }
      });
    })
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TICKET ASSIGNED TO AGENT
//    - Automatically send Agent an email notification (with ticket info + link)
//    - In-app notification for Agent
// ═══════════════════════════════════════════════════════════════════════════════
exports.notifyTicketAssigned = async (ticket, agent, previousAgent) => {
  const recipient = agent?._id || agent;
  const wasReassigned = previousAgent && !isSameUser(previousAgent, recipient);

  // 1. In-app for assigned agent
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

    // 2. Background non-blocking email notification to assigned agent
    setImmediate(async () => {
      try {
        let agentRecord = ticket.assignedAgent;
        if (!agentRecord?.email) {
          agentRecord = await User.findById(getId(recipient)).select('name email');
        }

        let requester = ticket.requester;
        if (requester && (!requester.name || !requester.email)) {
          try {
            requester = await User.findById(getId(ticket.requester)).select('name email requesterType');
          } catch (_) {}
        }

        if (agentRecord?.email) {
          await emailService.sendTicketAssignedToAgent(ticket, agentRecord, requester || {});
        }
      } catch (emailErr) {
        console.error(`[Email] Failed to send assignment email to agent:`, emailErr.message);
      }
    });
  }

  // 3. In-app notification for previous agent (if reassigned)
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
// 3. TICKET RESOLVED
//    - Automatically send email notification to Student (Requester)
//    - In-app notification to Student
// ═══════════════════════════════════════════════════════════════════════════════
exports.notifyTicketResolved = async (ticket, actor) => {
  const requesterId = getId(ticket.requester);

  // 1. In-app notification to student
  if (!isSameUser(ticket.requester, actor)) {
    await exports.createNotification({
      recipient: requesterId,
      type: 'ticket_resolved',
      title: 'Ticket Resolved',
      message: `Ticket ${ticket.ticketNumber} has been resolved`,
      ticket: ticket._id,
    });
  }

  // 2. Background non-blocking email notification to student
  setImmediate(async () => {
    try {
      let requesterRecord = ticket.requester;
      if (!requesterRecord?.email) {
        requesterRecord = await User.findById(requesterId).select('name email');
      }

      if (requesterRecord?.email) {
        await emailService.sendTicketResolvedToStudent(ticket, requesterRecord);
      }
    } catch (emailErr) {
      console.error(`[Email] Failed to send ticket resolved email to student:`, emailErr.message);
    }
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Other notification workflows
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
