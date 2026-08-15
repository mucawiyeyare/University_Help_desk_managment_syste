const sendEmail = require('../config/email');

// ─── Shared HTML Shell ────────────────────────────────────────────────────────
const emailShell = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a73e8 0%,#0d47a1 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                🎓 University Help Desk
              </h1>
              <p style="margin:6px 0 0;color:#bbdefb;font-size:13px;">Management System — Automated Notification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                This is an automated message from the University Help Desk Management System.<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Priority Badge Helper ────────────────────────────────────────────────────
const priorityBadge = (priority = 'medium') => {
  const colors = {
    low:      { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
    medium:   { bg: '#fff8e1', text: '#f57f17', border: '#ffe082' },
    high:     { bg: '#fce4ec', text: '#c62828', border: '#ef9a9a' },
    critical: { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
  };
  const c = colors[priority.toLowerCase()] || colors.medium;
  return `<span style="display:inline-block;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:700;background:${c.bg};color:${c.text};border:1px solid ${c.border};text-transform:uppercase;letter-spacing:0.5px;">${priority}</span>`;
};

// ─── Info Row Helper ──────────────────────────────────────────────────────────
const infoRow = (label, value) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:40%;">
      <span style="color:#64748b;font-size:13px;font-weight:600;">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
      <span style="color:#1e293b;font-size:13px;">${value}</span>
    </td>
  </tr>`;

// ─── CTA Button Helper ────────────────────────────────────────────────────────
const ctaButton = (href, label) => `
  <div style="text-align:center;margin-top:28px;">
    <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#1a73e8,#0d47a1);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 12px rgba(26,115,232,0.35);">
      ${label}
    </a>
  </div>`;

// ═══════════════════════════════════════════════════════════════════════════════
// 📧 EMAIL 1: New Ticket → Department Manager
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendNewTicketToManager = async (ticket, manager, requester) => {
  const ticketUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/tickets/${ticket._id}`;
  const createdDate = new Date(ticket.createdAt).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const body = `
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">New Ticket in Your Department</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      A new support ticket has been submitted and requires your attention.
    </p>

    <!-- Alert Box -->
    <div style="background:#eff6ff;border-left:4px solid #1a73e8;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#1d4ed8;font-size:14px;font-weight:600;">
        👤 Submitted by: <span style="color:#1e293b;">${requester.name}</span>
        &nbsp;·&nbsp;
        <span style="color:#1a73e8;text-transform:capitalize;">${requester.requesterType || 'User'}</span>
      </p>
    </div>

    <!-- Ticket Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('🎫 Ticket No.', `<strong>${ticket.ticketNumber}</strong>`)}
      ${infoRow('📌 Subject', ticket.subject)}
      ${infoRow('🏢 Department', ticket.department?.name || 'N/A')}
      ${infoRow('📂 Category', ticket.category?.name || 'N/A')}
      ${infoRow('⚡ Priority', priorityBadge(ticket.priority))}
      ${infoRow('🕐 Submitted At', createdDate)}
    </table>

    <!-- Description Snippet -->
    ${ticket.description ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Description</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${ticket.description.substring(0, 300)}${ticket.description.length > 300 ? '...' : ''}</p>
    </div>` : ''}

    ${ctaButton(ticketUrl, '🔍 View Ticket →')}

    <p style="text-align:center;margin-top:16px;color:#94a3b8;font-size:12px;">
      As the department manager, please review and assign this ticket promptly.
    </p>`;

  await sendEmail({
    to: manager.email,
    subject: `🎫 New Ticket [${ticket.ticketNumber}] — ${ticket.subject}`,
    html: emailShell(`New Ticket – ${ticket.ticketNumber}`, body),
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📧 EMAIL 2: Ticket Assigned → Agent
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendTicketAssignedToAgent = async (ticket, agent, requester) => {
  const ticketUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/tickets/${ticket._id}`;
  const assignedDate = new Date().toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const body = `
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">Ticket Assigned to You</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Hi <strong>${agent.name}</strong>, a ticket has been assigned to you. Please review it below.
    </p>

    <!-- Alert Box -->
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">
        👤 Submitted by: <span style="color:#1e293b;">${requester ? requester.name : 'Unknown User'}</span>
        ${requester?.requesterType ? `&nbsp;·&nbsp;<span style="color:#16a34a;text-transform:capitalize;">${requester.requesterType}</span>` : ''}
      </p>
    </div>

    <!-- Ticket Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('🎫 Ticket No.', `<strong>${ticket.ticketNumber}</strong>`)}
      ${infoRow('📌 Subject', ticket.subject)}
      ${infoRow('🏢 Department', ticket.department?.name || 'N/A')}
      ${infoRow('📂 Category', ticket.category?.name || 'N/A')}
      ${infoRow('⚡ Priority', priorityBadge(ticket.priority))}
      ${infoRow('📅 Assigned At', assignedDate)}
    </table>

    <!-- Description Snippet -->
    ${ticket.description ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ticket Description</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${ticket.description.substring(0, 300)}${ticket.description.length > 300 ? '...' : ''}</p>
    </div>` : ''}

    ${ctaButton(ticketUrl, '📋 Open Ticket →')}

    <p style="text-align:center;margin-top:16px;color:#94a3b8;font-size:12px;">
      Please respond within the SLA timeframe for this ticket's priority level.
    </p>`;

  await sendEmail({
    to: agent.email,
    subject: `📋 Ticket Assigned [${ticket.ticketNumber}] — ${ticket.subject}`,
    html: emailShell(`Ticket Assigned – ${ticket.ticketNumber}`, body),
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Existing email functions (preserved)
// ═══════════════════════════════════════════════════════════════════════════════

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
