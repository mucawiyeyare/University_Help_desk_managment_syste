const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_USER.includes('your_gmail')) {
      console.warn('[Email] Real EMAIL_USER or EMAIL_PASS not configured in .env. Skipping email dispatch.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const fromAddress = process.env.EMAIL_FROM || `"University Help Desk" <${process.env.EMAIL_USER}>`;

    const message = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
      },
    };

    const info = await transporter.sendMail(message);
    console.log('[Email] Message sent successfully to %s (ID: %s)', options.to, info.messageId);
    return info;
  } catch (err) {
    console.error('[Email Error] Failed to send email to %s:', options.to, err.message);
  }
};

module.exports = sendEmail;
