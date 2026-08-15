const sendEmail = require('../config/email');
const EmailLog = require('../models/EmailLog');

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

          <!-- University Logo Header -->
          <tr>
            <td style="background:#ffffff;padding:24px 40px 0;text-align:center;">
              <img
                src="https://huhelpdesk.iftiinhub.com/hormuud-logo.png"
                alt="Hormuud University"
                width="90"
                style="display:block;margin:0 auto;width:90px;height:auto;"
              />
            </td>
          </tr>

          <!-- Brand Bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#15803d 0%,#166534 100%);padding:20px 40px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                Hormuud University
              </h1>
              <p style="margin:4px 0 0;color:#bbf7d0;font-size:13px;">Help Desk Management System — Automated Notification</p>
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
                This is an automated message from the Hormuud University Help Desk Management System.<br/>
                Please do not reply to this email. Visit <a href="https://huhelpdesk.iftiinhub.com" style="color:#15803d;text-decoration:none;">huhelpdesk.iftiinhub.com</a> for support.
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

// ─── Helper: Check duplicate email ───────────────────────────────────────────
const isDuplicateEmail = async (ticketId, eventType, recipientEmail) => {
  if (!ticketId || !eventType || !recipientEmail) return false;
  const existing = await EmailLog.findOne({
    ticket: ticketId,
    eventType,
    recipientEmail: recipientEmail.toLowerCase().trim(),
    status: 'sent',
  });
  return !!existing;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. New Ticket Notification → Department Manager
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendNewTicketToManager = async (ticket, manager, requester) => {
  const recipientEmail = manager?.email;
  if (!recipientEmail) return;

  const eventType = 'ticket_created';
  const ticketId = ticket._id;

  // Deduplication Check
  const duplicate = await isDuplicateEmail(ticketId, eventType, recipientEmail);
  if (duplicate) {
    console.log(`[Email Deduplication] Skipping duplicate '${eventType}' email to ${recipientEmail} for ticket ${ticket.ticketNumber}`);
    return;
  }

  const baseUrl = process.env.CLIENT_URL || 'https://huhelpdesk.iftiinhub.com';
  const ticketUrl = `${baseUrl}/tickets/${ticket._id}`;
  const createdDate = new Date(ticket.createdAt || Date.now()).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const subject = `New Student Ticket Assigned to Your Department — Ticket #${ticket.ticketNumber}`;

  const html = emailShell(
    `New Ticket – ${ticket.ticketNumber}`,
    `
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">New Student Ticket in Your Department</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Hi <strong>${manager.name || 'Department Manager'}</strong>, a new student ticket has been submitted and assigned to your department.
    </p>

    <div style="background:#eff6ff;border-left:4px solid #1a73e8;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#1d4ed8;font-size:14px;font-weight:600;">
        👤 Student Name: <span style="color:#1e293b;">${requester.name || 'Student'}</span>
        ${requester.requesterType ? `&nbsp;·&nbsp;<span style="color:#1a73e8;text-transform:capitalize;">${requester.requesterType}</span>` : ''}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('🎫 Ticket ID', `<strong>${ticket.ticketNumber}</strong>`)}
      ${infoRow('📌 Subject', ticket.subject)}
      ${infoRow('🏢 Department', ticket.department?.name || 'N/A')}
      ${infoRow('📂 Category', ticket.category?.name || 'N/A')}
      ${infoRow('⚡ Priority', priorityBadge(ticket.priority))}
      ${infoRow('🕐 Created At', createdDate)}
    </table>

    ${ticket.description ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Short Description</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${ticket.description.substring(0, 300)}${ticket.description.length > 300 ? '...' : ''}</p>
    </div>` : ''}

    ${ctaButton(ticketUrl, '🔍 Open Ticket in System →')}
    `
  );

  const text = `University Help Desk Management System — New Ticket Notification\n\n` +
    `Hi ${manager.name || 'Department Manager'},\n\n` +
    `A new student ticket has been submitted and assigned to your department.\n\n` +
    `Student Name: ${requester.name || 'Student'}\n` +
    `Ticket ID: ${ticket.ticketNumber}\n` +
    `Subject: ${ticket.subject}\n` +
    `Department: ${ticket.department?.name || 'N/A'}\n` +
    `Category: ${ticket.category?.name || 'N/A'}\n` +
    `Created At: ${createdDate}\n\n` +
    `Description: ${ticket.description || 'N/A'}\n\n` +
    `Open Ticket in System: ${ticketUrl}\n`;

  try {
    const result = await sendEmail({ to: recipientEmail, subject, html, text });
    if (result?.success) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'sent',
        messageId: result.messageId,
      });
    } else if (result?.skipped) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'skipped',
        error: result.reason,
      });
    }
  } catch (err) {
    await EmailLog.create({
      ticket: ticketId,
      eventType,
      recipientEmail,
      subject,
      status: 'failed',
      error: err.message,
    });
    console.error('[Email Service] Error in sendNewTicketToManager:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Ticket Assignment Notification → Agent
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendTicketAssignedToAgent = async (ticket, agent, requester) => {
  const recipientEmail = agent?.email;
  if (!recipientEmail) return;

  const eventType = 'ticket_assigned';
  const ticketId = ticket._id;

  // Deduplication Check
  const duplicate = await isDuplicateEmail(ticketId, eventType, recipientEmail);
  if (duplicate) {
    console.log(`[Email Deduplication] Skipping duplicate '${eventType}' email to ${recipientEmail} for ticket ${ticket.ticketNumber}`);
    return;
  }

  const baseUrl = process.env.CLIENT_URL || 'https://huhelpdesk.iftiinhub.com';
  const ticketUrl = `${baseUrl}/tickets/${ticket._id}`;
  const assignedDate = new Date().toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const subject = `You Have Been Assigned a Student Ticket — Ticket #${ticket.ticketNumber}`;

  const html = emailShell(
    `Ticket Assigned – ${ticket.ticketNumber}`,
    `
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">You Have Been Assigned a Student Ticket</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Hi <strong>${agent.name || 'Agent'}</strong>, an Administrator or Department Manager has assigned a student support ticket to you.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">
        👤 Student Name: <span style="color:#1e293b;">${requester ? requester.name : 'Student'}</span>
        ${requester?.requesterType ? `&nbsp;·&nbsp;<span style="color:#16a34a;text-transform:capitalize;">${requester.requesterType}</span>` : ''}
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('🎫 Ticket ID', `<strong>${ticket.ticketNumber}</strong>`)}
      ${infoRow('📌 Subject', ticket.subject)}
      ${infoRow('🏢 Department', ticket.department?.name || 'N/A')}
      ${infoRow('📂 Category', ticket.category?.name || 'N/A')}
      ${infoRow('⚡ Priority', priorityBadge(ticket.priority))}
      ${infoRow('📅 Assigned At', assignedDate)}
    </table>

    ${ticket.description ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Ticket Description</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${ticket.description.substring(0, 300)}${ticket.description.length > 300 ? '...' : ''}</p>
    </div>` : ''}

    ${ctaButton(ticketUrl, '📋 Open Ticket in System →')}
    `
  );

  const text = `University Help Desk Management System — Ticket Assignment Notification\n\n` +
    `Hi ${agent.name || 'Agent'},\n\n` +
    `You have been assigned a student support ticket.\n\n` +
    `Student Name: ${requester?.name || 'Student'}\n` +
    `Ticket ID: ${ticket.ticketNumber}\n` +
    `Subject: ${ticket.subject}\n` +
    `Department: ${ticket.department?.name || 'N/A'}\n` +
    `Category: ${ticket.category?.name || 'N/A'}\n` +
    `Assigned At: ${assignedDate}\n\n` +
    `Open Ticket in System: ${ticketUrl}\n`;

  try {
    const result = await sendEmail({ to: recipientEmail, subject, html, text });
    if (result?.success) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'sent',
        messageId: result.messageId,
      });
    } else if (result?.skipped) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'skipped',
        error: result.reason,
      });
    }
  } catch (err) {
    await EmailLog.create({
      ticket: ticketId,
      eventType,
      recipientEmail,
      subject,
      status: 'failed',
      error: err.message,
    });
    console.error('[Email Service] Error in sendTicketAssignedToAgent:', err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Ticket Resolution Notification → Student
// ═══════════════════════════════════════════════════════════════════════════════
exports.sendTicketResolvedToStudent = async (ticket, requester) => {
  const recipientEmail = requester?.email;
  if (!recipientEmail) return;

  const eventType = 'ticket_resolved';
  const ticketId = ticket._id;

  // Deduplication Check
  const duplicate = await isDuplicateEmail(ticketId, eventType, recipientEmail);
  if (duplicate) {
    console.log(`[Email Deduplication] Skipping duplicate '${eventType}' email to ${recipientEmail} for ticket ${ticket.ticketNumber}`);
    return;
  }

  const baseUrl = process.env.CLIENT_URL || 'https://huhelpdesk.iftiinhub.com';
  const ticketUrl = `${baseUrl}/tickets/${ticket._id}`;
  const resolvedDate = new Date(ticket.resolvedAt || Date.now()).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const subject = `Your Student Support Ticket Has Been Resolved — Ticket #${ticket.ticketNumber}`;

  const html = emailShell(
    `Ticket Resolved – ${ticket.ticketNumber}`,
    `
    <h2 style="margin:0 0 6px;color:#1e293b;font-size:20px;font-weight:700;">Your Student Support Ticket Has Been Resolved</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:14px;">
      Hi <strong>${requester.name || 'Student'}</strong>, your support ticket has been marked as <strong>Resolved</strong> by our support team.
    </p>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:6px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">
        ✅ Resolution Status: <span style="color:#16a34a;font-weight:700;">Resolved</span>
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${infoRow('🎫 Ticket ID', `<strong>${ticket.ticketNumber}</strong>`)}
      ${infoRow('📌 Subject', ticket.subject)}
      ${infoRow('🏢 Department', ticket.department?.name || 'N/A')}
      ${infoRow('📂 Category', ticket.category?.name || 'N/A')}
      ${infoRow('📅 Resolved Date', resolvedDate)}
    </table>

    ${ticket.resolutionSummary ? `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin-top:20px;">
      <p style="margin:0 0 6px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Resolution Details</p>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${ticket.resolutionSummary}</p>
    </div>` : ''}

    ${ctaButton(ticketUrl, '🔍 View Resolved Ticket →')}

    <p style="text-align:center;margin-top:20px;color:#94a3b8;font-size:12px;">
      If your issue is not completely resolved or you need further assistance, you can view or re-open the ticket directly from the portal.
    </p>
    `
  );

  const text = `University Help Desk Management System — Ticket Resolution Notification\n\n` +
    `Hi ${requester.name || 'Student'},\n\n` +
    `Your student support ticket has been marked as Resolved.\n\n` +
    `Ticket ID: ${ticket.ticketNumber}\n` +
    `Subject: ${ticket.subject}\n` +
    `Department: ${ticket.department?.name || 'N/A'}\n` +
    `Category: ${ticket.category?.name || 'N/A'}\n` +
    `Resolution Status: Resolved\n` +
    `Resolved Date: ${resolvedDate}\n\n` +
    `${ticket.resolutionSummary ? `Resolution Details: ${ticket.resolutionSummary}\n\n` : ''}` +
    `View Resolved Ticket: ${ticketUrl}\n`;

  try {
    const result = await sendEmail({ to: recipientEmail, subject, html, text });
    if (result?.success) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'sent',
        messageId: result.messageId,
      });
    } else if (result?.skipped) {
      await EmailLog.create({
        ticket: ticketId,
        eventType,
        recipientEmail,
        subject,
        status: 'skipped',
        error: result.reason,
      });
    }
  } catch (err) {
    await EmailLog.create({
      ticket: ticketId,
      eventType,
      recipientEmail,
      subject,
      status: 'failed',
      error: err.message,
    });
    console.error('[Email Service] Error in sendTicketResolvedToStudent:', err.message);
  }
};
