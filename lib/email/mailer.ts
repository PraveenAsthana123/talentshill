import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@talentshill.com';

function createTransport() {
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return null;
}

const transport = createTransport();

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; messageId?: string }> {
  if (!transport) {
    // Dev mode fallback: log to console
    console.log('[EMAIL DEV]', { to: options.to, subject: options.subject });
    console.log('[EMAIL DEV] HTML length:', options.html.length);
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  try {
    const result = await transport.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return { success: false };
  }
}
