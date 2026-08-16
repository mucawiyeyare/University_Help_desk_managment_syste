const nodemailer = require('nodemailer');

const createTransporter = () => {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const hasOAuth2 = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN;

  if (hasOAuth2) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: process.env.GMAIL_ACCESS_TOKEN || undefined,
      },
      tls: { rejectUnauthorized: false },
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '465', 10),
    secure: process.env.EMAIL_PORT === '465' || !process.env.EMAIL_PORT,
    auth: {
      user: user,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const sendEmail = async (options) => {
  const user = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const hasOAuth2 = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN;

  if (!user || (!pass && !hasOAuth2) || user.includes('your_gmail')) {
    console.warn('[Email] Real EMAIL_USER or GMAIL OAuth2 credentials not configured in .env. Skipping dispatch.');
    return { success: false, skipped: true, reason: 'Credentials not configured' };
  }

  if (!options.to || !options.to.includes('@')) {
    console.warn('[Email] Invalid recipient email address:', options.to);
    return { success: false, skipped: true, reason: 'Invalid recipient email address' };
  }

  try {
    const transporter = createTransporter();
    const fromAddress = `"Hormuud University Help Desk" <${user}>`;

    // Generate plain-text fallback from HTML if text not explicitly provided
    const plainText = options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    const message = {
      from: fromAddress,
      to: options.to.toLowerCase().trim(),
      subject: options.subject,
      html: options.html,
      text: plainText,
      // Pass through CID attachments (embedded images)
      attachments: options.attachments || [],
    };

    const info = await transporter.sendMail(message);
    console.log('[Email] Message sent successfully to %s (ID: %s)', options.to, info.messageId);
    return { success: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    console.error('[Email Error] Failed to send email to %s:', options.to, err.message);
    throw err;
  }
};

module.exports = sendEmail;
