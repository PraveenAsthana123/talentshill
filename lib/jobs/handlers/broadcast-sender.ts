import { registerHandler } from '../handlers';
import { JOB_TYPES } from '../types';
import type { JobContext } from '../types';
import {
  getBroadcastById,
  updateBroadcast,
  updateBroadcastCounters,
  launchBroadcast,
  completeBroadcast,
} from '@/lib/db/broadcast-queries';
import { getContacts } from '@/lib/db/contact-crm-queries';
import { getListMembers, getListMemberCount } from '@/lib/db/list-queries';
import { sendWithProfile } from '@/lib/email/profile-mailer';
import { logEmailEvent } from '@/lib/db/email-event-queries';

const BATCH_SIZE = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleBroadcastSend(ctx: JobContext) {
  const { broadcastId } = ctx.payload as { broadcastId: string };

  const broadcast = getBroadcastById(broadcastId);
  if (!broadcast) throw new Error(`Broadcast ${broadcastId} not found`);

  ctx.log('info', `Starting broadcast send: ${broadcast.name}`, { broadcastId });

  // Mark as sending
  launchBroadcast(broadcastId);

  const throttlePerMinute = broadcast.throttlePerMinute ?? 60;
  const delayBetweenEmails = Math.max(Math.floor(60_000 / throttlePerMinute), 100);

  let sentCount = 0;
  let failedCount = 0;
  let offset = 0;

  // Resolve recipients based on audience type
  while (true) {
    let recipients: Array<{ email: string; contactId?: string }> = [];

    if (broadcast.audienceType === 'list' && broadcast.audienceId) {
      const members = getListMembers(broadcast.audienceId, { limit: BATCH_SIZE, offset });
      recipients = members
        .filter((m) => m.status === 'active')
        .map((m) => ({ email: m.email, contactId: m.contactId }));
    } else {
      // audienceType === 'all' — send to all active contacts
      const contacts = getContacts({ status: 'active', limit: BATCH_SIZE, offset });
      recipients = contacts.map((c) => ({ email: c.email, contactId: c.id }));
    }

    if (recipients.length === 0) break;

    for (const recipient of recipients) {
      try {
        const result = await sendWithProfile('broadcast', {
          to: recipient.email,
          subject: broadcast.subject,
          html: broadcast.htmlContent,
        });

        if (result.success) {
          sentCount++;
          if (recipient.contactId) {
            logEmailEvent({
              emailMessageId: result.messageId,
              contactId: recipient.contactId,
              eventType: 'sent',
              metadata: { broadcastId },
            });
          }
        } else {
          failedCount++;
        }
      } catch (err) {
        failedCount++;
        const errorMsg = err instanceof Error ? err.message : String(err);
        ctx.log('warn', `Failed to send to ${recipient.email}: ${errorMsg}`);
      }

      await sleep(delayBetweenEmails);
    }

    offset += BATCH_SIZE;
    ctx.log('info', `Progress: ${sentCount} sent, ${failedCount} failed`);
  }

  // Update counters and mark completed
  updateBroadcastCounters(broadcastId, sentCount, failedCount);
  completeBroadcast(broadcastId);
  ctx.log('info', `Broadcast completed: ${sentCount} sent, ${failedCount} failed`);

  return { sentCount, failedCount };
}

registerHandler(JOB_TYPES.BROADCAST_SEND, handleBroadcastSend);
