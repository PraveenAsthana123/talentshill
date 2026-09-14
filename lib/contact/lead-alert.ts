import { sendEmail } from '@/lib/email/mailer';
import { markAlertSent } from '@/lib/db/contact-queries';

export interface AlertableSubmission {
  id: string;
  fullName: string;
  company: string;
  email: string;
  leadScore: number | null;
  leadTier: string | null;
  alertSentAt: Date | null;
  assignedTo: string | null;
}

// Real, deterministic rule: only 'hot' tier leads get a dedicated alert.
// This is distinct from the generic admin-notification email that fires
// on every submission (app/api/contact/route.ts) -- that one is
// informational; this one is meant to prompt an immediate sales action.
export function shouldSendHotLeadAlert(tier: string, alertSentAt: Date | null): boolean {
  return tier === 'hot' && alertSentAt === null;
}

function buildHotLeadAlertTemplate(data: {
  fullName: string; company: string; email: string; leadScore: number;
  qualificationStage: string; assignedTo: string | null;
}): { subject: string; html: string } {
  return {
    subject: `HOT LEAD: ${data.fullName} (${data.company}) -- score ${data.leadScore}/100`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif">
      <h2 style="color:#ef4444">Hot lead requires action</h2>
      <p><strong>${data.fullName}</strong> from <strong>${data.company}</strong> (${data.email}) scored
      <strong>${data.leadScore}/100</strong> and is now <strong>${data.qualificationStage.toUpperCase()}</strong>.</p>
      <p>${data.assignedTo ? `Assigned to: ${data.assignedTo}` : 'Not yet assigned to a salesperson.'}</p>
      <p>Review in the admin portal and follow up promptly.</p>
    </body></html>`,
  };
}

// Idempotent -- markAlertSent is only called after a successful send, and
// the caller must re-check shouldSendHotLeadAlert against the current DB
// row before calling this, so a lead already alerted is never double
// alerted by a later pipeline re-run.
export async function sendHotLeadAlertIfNeeded(submission: AlertableSubmission, qualificationStage: string): Promise<boolean> {
  if (!shouldSendHotLeadAlert(submission.leadTier || 'cold', submission.alertSentAt)) return false;

  const template = buildHotLeadAlertTemplate({
    fullName: submission.fullName,
    company: submission.company,
    email: submission.email,
    leadScore: submission.leadScore || 0,
    qualificationStage,
    assignedTo: submission.assignedTo,
  });

  const result = await sendEmail({
    to: process.env.SALES_ALERT_EMAIL || process.env.ADMIN_EMAIL || 'admin@talentshill.com',
    subject: template.subject,
    html: template.html,
  });

  // sendEmail catches its own errors and returns {success:false} rather
  // than throwing -- alertSentAt must only be set on a real, confirmed
  // send, never on a failed SMTP attempt that would otherwise silently
  // hide a genuinely un-alerted hot lead.
  if (!result.success) return false;

  markAlertSent(submission.id);
  return true;
}
