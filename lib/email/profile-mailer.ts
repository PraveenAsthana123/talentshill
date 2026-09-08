import nodemailer from 'nodemailer';
import { getProfileForEvent, getDefaultProfile, getSmtpForProfile } from '@/lib/db/email-profile-queries';

/**
 * Send email using a profile resolved from an event type.
 * Falls back to default profile, then to env vars.
 */
export async function sendWithProfile(
  eventType: string,
  options: { to: string; subject: string; html: string }
): Promise<{ success: boolean; messageId?: string }> {
  // Try to resolve profile from event route
  let profile = getProfileForEvent(eventType);

  // Fall back to default profile
  if (!profile) {
    profile = getDefaultProfile();
  }

  let smtpConfig;
  if (profile) {
    smtpConfig = getSmtpForProfile(profile.id);
  }

  // Build transport
  const host = smtpConfig?.host || process.env.SMTP_HOST;
  const port = smtpConfig?.port || parseInt(process.env.SMTP_PORT || '587', 10);
  const user = smtpConfig?.username || process.env.SMTP_USER;
  const pass = smtpConfig?.password || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Dev fallback
    console.log('[EMAIL DEV]', { to: options.to, subject: options.subject, eventType, profile: profile?.name || 'none' });
    return { success: true, messageId: 'dev-' + Date.now() };
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: smtpConfig?.secure || port === 465,
    auth: { user, pass },
  });

  const fromName = profile?.fromName || 'TalentsHill';
  const fromEmail = profile?.fromEmail || process.env.SMTP_FROM || 'noreply@talentshill.com';
  const replyTo = profile?.replyTo;

  // Append signature if present
  let html = options.html;
  if (profile?.signature) {
    html += `<br/><br/>${profile.signature}`;
  }

  try {
    const result = await transport.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html,
      replyTo: replyTo || undefined,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    return { success: false };
  }
}
