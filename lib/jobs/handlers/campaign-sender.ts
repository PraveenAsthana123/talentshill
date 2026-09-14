import { registerHandler } from '../handlers';
import { JOB_TYPES } from '../types';
import type { JobContext } from '../types';
import {
  getCampaignById,
  getCampaignRecipients,
  updateRecipientStatus,
  updateCampaign,
  updateCampaignCounters,
  getCampaignVariants,
} from '@/lib/db/campaign-queries';
import { getContactById } from '@/lib/db/contact-crm-queries';
import { getTemplateById, renderTemplate } from '@/lib/db/template-queries';
import { sendWithProfile } from '@/lib/email/profile-mailer';
import { logEmailEvent } from '@/lib/db/email-event-queries';
import { createUnsubscribeToken } from '@/lib/db/tracking-queries';
import { injectTrackingPixel } from '@/lib/tracking/pixel';
import { rewriteLinks, injectUnsubscribeLink } from '@/lib/tracking/links';

const BATCH_SIZE = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic, stable A/B split -- same recipient always lands in the
// same variant if the job retries, not re-randomized per attempt.
export function assignVariant(recipientId: string, variantCount: number): number {
  let hash = 0;
  for (let i = 0; i < recipientId.length; i++) hash = (hash * 31 + recipientId.charCodeAt(i)) >>> 0;
  return hash % variantCount;
}

async function handleCampaignSend(ctx: JobContext) {
  const { campaignId } = ctx.payload as { campaignId: string };

  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  ctx.log('info', `Starting campaign send: ${campaign.name}`, { campaignId });

  updateCampaign(campaignId, { status: 'sending', startedAt: new Date() });

  // Real A/B variants (added 2026-09-14): if this campaign has real
  // campaign_variants rows (created manually or via
  // campaign-variant-generation-agent), each recipient is deterministically
  // assigned to exactly one variant's subject/template. Falls back to the
  // original single campaign.subject/templateId behavior when no variants
  // exist, so pre-existing campaigns are unaffected.
  const variants = getCampaignVariants(campaignId);

  const defaultTemplate = campaign.templateId ? getTemplateById(campaign.templateId) : null;
  let defaultSubject = campaign.subject || '(no subject)';
  if (defaultTemplate?.subject && !campaign.subject) defaultSubject = defaultTemplate.subject;

  const variantContent = variants.length > 0
    ? variants.map((v) => {
      const template = v.templateId ? getTemplateById(v.templateId) : defaultTemplate;
      return {
        name: v.name,
        subject: v.subject || defaultSubject,
        html: template?.htmlContent || `<p>${v.subject || defaultSubject}</p>`,
      };
    })
    : [{ name: 'A', subject: defaultSubject, html: defaultTemplate?.htmlContent || `<p>${defaultSubject}</p>` }];

  const throttlePerMinute = campaign.throttlePerMinute ?? 60;
  const delayBetweenEmails = Math.max(Math.floor(60_000 / throttlePerMinute), 100);

  let sentCount = 0;
  let failedCount = 0;

  while (true) {
    const recipients = getCampaignRecipients(campaignId, { status: 'pending', limit: BATCH_SIZE, offset: 0 });
    if (recipients.length === 0) break;

    for (const recipient of recipients) {
      const contact = getContactById(recipient.contactId);
      if (!contact || contact.status !== 'active') {
        updateRecipientStatus(recipient.id, 'failed', { error: contact ? 'Contact inactive' : 'Contact not found' });
        failedCount++;
        continue;
      }

      try {
        const variant = variantContent[assignVariant(recipient.id, variantContent.length)];

        // Real per-recipient personalization -- previously the raw,
        // unrendered template was sent to every recipient with
        // {{firstName}} etc. literally in the email. Now rendered with
        // the real contact's own data.
        let html = renderTemplate(variant.html, {
          firstName: contact.firstName || 'there',
          lastName: contact.lastName || '',
          company: contact.company || '',
          email: contact.email,
        });

        // Real open/click tracking -- previously never invoked by this
        // sender despite the pixel/link-rewrite helpers and receiving
        // routes (/api/t/o, /api/t/c) already existing and being unit
        // tested in isolation. Without this, opened/clicked events could
        // never be produced by a real send.
        html = injectTrackingPixel(html, recipient.id);
        html = rewriteLinks(html, recipient.id);
        const unsubToken = createUnsubscribeToken(contact.id, campaignId);
        html = injectUnsubscribeLink(html, unsubToken);

        const result = await sendWithProfile('campaign', { to: contact.email, subject: variant.subject, html });

        if (result.success) {
          updateRecipientStatus(recipient.id, 'sent', { messageId: result.messageId, sentAt: new Date() });
          logEmailEvent({ emailMessageId: result.messageId, recipientId: recipient.id, contactId: contact.id, campaignId, eventType: 'sent' });
          sentCount++;
          updateCampaignCounters(campaignId, 'totalSent', 1);
        } else {
          updateRecipientStatus(recipient.id, 'failed', { error: 'Send failed' });
          failedCount++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        updateRecipientStatus(recipient.id, 'failed', { error: errorMsg });
        failedCount++;
        ctx.log('warn', `Failed to send to ${contact.email}: ${errorMsg}`);
      }

      await sleep(delayBetweenEmails);
    }

    ctx.log('info', `Progress: ${sentCount} sent, ${failedCount} failed`);
  }

  updateCampaign(campaignId, { status: 'completed', completedAt: new Date() });
  ctx.log('info', `Campaign completed: ${sentCount} sent, ${failedCount} failed`);

  return { sentCount, failedCount };
}

registerHandler(JOB_TYPES.CAMPAIGN_SEND, handleCampaignSend);
