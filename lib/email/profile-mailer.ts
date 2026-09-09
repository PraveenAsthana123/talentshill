import nodemailer from 'nodemailer';
import { getProfileForEvent, getProfileById, getDefaultProfile, getSmtpForProfile } from '@/lib/db/email-profile-queries';

/**
 * Send email using a profile resolved from an explicit profileId (if
 * given), else from an event type, else the default profile, else env
 * vars. options.profileId used to be silently accepted by callers (the
 * email-compose route) and dropped -- an admin's explicit sender-profile
 * choice in the Compose UI was always ignored in favor of the
 * eventType-based route. Fixed here so an explicit profileId wins.
 */
export async function sendWithProfile(
  eventType: string,
  options: { to: string; subject: string; html: string; profileId?: string }
): Promise<{ success: boolean; messageId?: string }> {
  // An explicit profileId always wins over event-route resolution.
  let profile = options.profileId ? getProfileById(options.profileId) : undefined;

  // Try to resolve profile from event route
  if (!profile) {
    profile = getProfileForEvent(eventType);
  }

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
