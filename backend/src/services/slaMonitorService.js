const Ticket = require('../models/Ticket');
const notificationService = require('./notificationService');

const TERMINAL_STATUSES = ['resolved', 'closed', 'cancelled'];
const WARNING_WINDOW_MS = 60 * 60 * 1000;

const monitorSLADeadlines = async () => {
  const now = new Date();
  const warningDeadline = new Date(now.getTime() + WARNING_WINDOW_MS);
  const tickets = await Ticket.find({
    isDeleted: false,
    status: { $nin: TERMINAL_STATUSES },
    slaDueResolution: { $ne: null, $lte: warningDeadline },
    $or: [
      { slaDueResolution: { $lte: now }, slaBreachNotified: { $ne: true } },
      {
        slaDueResolution: { $gt: now, $lte: warningDeadline },
        slaApproachingNotified: { $ne: true },
      },
    ],
  }).select('ticketNumber assignedAgent department slaDueResolution slaResolutionBreached slaApproachingNotified slaBreachNotified');

  for (const ticket of tickets) {
    if (ticket.slaDueResolution <= now) {
      ticket.slaResolutionBreached = true;
      await notificationService.notifySLABreach(ticket);
      ticket.slaBreachNotified = true;
    } else {
      await notificationService.notifySLAApproaching(ticket);
      ticket.slaApproachingNotified = true;
    }
    await ticket.save();
  }
};

exports.startSLAMonitor = () => {
  const runMonitor = () => monitorSLADeadlines().catch((error) => {
    console.error('SLA deadline monitor failed:', error.message);
  });

  runMonitor();
  const timer = setInterval(runMonitor, 60 * 1000);
  timer.unref?.();
};

exports.monitorSLADeadlines = monitorSLADeadlines;
