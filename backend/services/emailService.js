const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send new contact message notification to admin
 */
const sendContactNotification = async ({ full_name, email, phone, subject, message }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP not configured — skipping email notification');
    return;
  }
  try {
    await getTransporter().sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL_NOTIFY,
      subject: `📬 New Message: ${subject || 'Contact Form'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#00d4ff">New Contact Message</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold">Name:</td><td>${full_name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email:</td><td>${email}</td></tr>
            ${phone ? `<tr><td style="padding:8px;font-weight:bold">Phone:</td><td>${phone}</td></tr>` : ''}
            ${subject ? `<tr><td style="padding:8px;font-weight:bold">Subject:</td><td>${subject}</td></tr>` : ''}
          </table>
          <hr/>
          <h3>Message:</h3>
          <p style="background:#f5f5f5;padding:16px;border-radius:8px">${message}</p>
          <p style="color:#999;font-size:12px">Received at ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    logger.info(`Contact notification sent to ${process.env.ADMIN_EMAIL_NOTIFY}`);
  } catch (err) {
    logger.error('Failed to send contact notification:', err.message);
  }
};

/**
 * Reply to a visitor message
 */
const sendReplyEmail = async ({ to, name, replyText, originalMessage }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP not configured');
  }
  await getTransporter().sendMail({
    from: `"Abdulmalik Nure Jemal" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Re: Your message',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#00d4ff">Hello ${name},</h2>
        <p>${replyText}</p>
        <hr/>
        <p style="color:#999;font-size:12px">Original message: ${originalMessage}</p>
      </div>
    `,
  });
};

module.exports = { sendContactNotification, sendReplyEmail };
