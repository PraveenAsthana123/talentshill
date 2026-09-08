import { registerHandler } from '../handlers';
import { JOB_TYPES } from '../types';
import type { JobContext } from '../types';
import {
  getCampaignById,
  getCampaignRecipients,
  updateRecipientStatus,
  updateCampaign,
  updateCampaignCounters,
} from '@/lib/db/campaign-queries';
import { getContactById } from '@/lib/db/contact-crm-queries';
import { getTemplateById } from '@/lib/db/template-queries';
import { sendWithProfile } from '@/lib/email/profile-mailer';
import { logEmailEvent } from '@/lib/db/email-event-queries';

const BATCH_SIZE = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleCampaignSend(ctx: JobContext) {
  const { campaignId } = ctx.payload as { campaignId: string };

  const campaign = getCampaignById(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  ctx.log('info', `Starting campaign send: ${campaign.name}`, { campaignId });

  // Update campaign status to sending
  updateCampaign(campaignId, { status: 'sending', startedAt: new Date() });

  // Load template if specified
  let htmlTemplate = '';
  let subjectLine = campaign.subject || '(no subject)';
  if (campaign.templateId) {
    const template = getTemplateById(campaign.templateId);
    if (template) {
      htmlTemplate = template.htmlContent;
      if (template.subject && !campaign.subject) {
        subjectLine = template.subject;
      }
    }
  }

  const throttlePerMinute = campaign.throttlePerMinute ?? 60;
  const delayBetweenEmails = Math.max(Math.floor(60_000 / throttlePerMinute), 100);

  let sentCount = 0;
  let failedCount = 0;
  let offset = 0;

  while (true) {
    const recipients = getCampaignRecipients(campaignId, {
      status: 'pending',
      limit: BATCH_SIZE,
      offset: 0, // Always fetch from start since we update status
    });

    if (recipients.length === 0) break;

    for (const recipient of recipients) {
      const contact = getContactById(recipient.contactId);
      if (!contact || contact.status !== 'active') {
        updateRecipientStatus(recipient.id, 'failed', {
          error: contact ? 'Contact inactive' : 'Contact not found',
        });
        failedCount++;
        updateCampaignCounters(campaignId, 'totalSent', 0);
        continue;
      }

      try {
        const html = htmlTemplate || `<p>${subjectLine}</p>`;
        const result = await sendWithProfile('campaign', {
          to: contact.email,
          subject: subjectLine,
          html,
        });

        if (result.success) {
          updateRecipientStatus(recipient.id, 'sent', {
            messageId: result.messageId,
            sentAt: new Date(),
          });
          logEmailEvent({
            emailMessageId: result.messageId,
            recipientId: recipient.id,
            contactId: contact.id,
            campaignId,
            eventType: 'sent',
          });
          sentCount++;
          updateCampaignCounters(campaignId, 'totalSent', 1);
        } else {
          updateRecipientStatus(recipient.id, 'failed', {
            error: 'Send failed',
          });
          failedCount++;
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        updateRecipientStatus(recipient.id, 'failed', { error: errorMsg });
        failedCount++;
        ctx.log('warn', `Failed to send to ${contact.email}: ${errorMsg}`);
      }

      // Throttle
      await sleep(delayBetweenEmails);
    }

    offset += BATCH_SIZE;
    ctx.log('info', `Progress: ${sentCount} sent, ${failedCount} failed`);
  }

  // Mark campaign completed
  updateCampaign(campaignId, { status: 'completed', completedAt: new Date() });
  ctx.log('info', `Campaign completed: ${sentCount} sent, ${failedCount} failed`);

  return { sentCount, failedCount };
}

registerHandler(JOB_TYPES.CAMPAIGN_SEND, handleCampaignSend);
