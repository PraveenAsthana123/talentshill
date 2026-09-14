import { getAtRiskContacts, getLastReEngagementMessageForContact, createReEngagementMessage } from '@/lib/db/re-engagement-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

// Pure, unit-tested: days between two real dates, floored. Null input
// (never engaged) returns null -- never treated as "0 days ago".
export function computeDaysSince(date: Date | null, now: Date): number | null {
  if (!date) return null;
  const ms = now.getTime() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export interface EligibilityInput {
  lifecycleStage: string | null;
  phone: string | null;
  lastEngagedAt: Date | null;
  lastMessagedAt: Date | null;
}
export interface EligibilityResult { eligible: boolean; reason: string }

// Pure, unit-tested. A contact is eligible for a real re-engagement
// message only if ALL of these real conditions hold:
//  - lifecycle_stage is already 'at_risk' (written by the real
//    contact-activation-pipeline, not recomputed here)
//  - a real phone number is on file (required for SMS/WhatsApp --
//    an email-only contact is not eligible for this channel)
//  - it has been at least `thresholdDays` since last real engagement
//    (or the contact has never engaged at all)
//  - not already messaged within the real `cooldownDays` window
//    (anti-spam -- never re-trigger every single pipeline run)
export function evaluateReEngagementEligibility(
  input: EligibilityInput,
  now: Date,
  thresholdDays: number,
  cooldownDays: number
): EligibilityResult {
  if (input.lifecycleStage !== 'at_risk') return { eligible: false, reason: `lifecycle_stage is '${input.lifecycleStage}', not at_risk` };
  if (!input.phone || !input.phone.trim()) return { eligible: false, reason: 'no real phone number on file' };

  const daysSinceEngaged = computeDaysSince(input.lastEngagedAt, now);
  if (daysSinceEngaged !== null && daysSinceEngaged < thresholdDays) {
    return { eligible: false, reason: `only ${daysSinceEngaged} days since last engagement, below the ${thresholdDays}-day threshold` };
  }

  const daysSinceMessaged = computeDaysSince(input.lastMessagedAt, now);
  if (daysSinceMessaged !== null && daysSinceMessaged < cooldownDays) {
    return { eligible: false, reason: `already messaged ${daysSinceMessaged} days ago, within the ${cooldownDays}-day cooldown` };
  }

  const reasonSuffix = daysSinceEngaged === null ? 'never engaged' : `${daysSinceEngaged} days since last engagement`;
  return { eligible: true, reason: `at_risk, ${reasonSuffix}` };
}

// Pure: substitutes real {{firstName}} placeholders with the contact's
// real first name, falling back to a generic "there" -- never invents
// a name.
export function personalizeMessage(template: string, firstName: string | null): string {
  return template.replace(/\{\{\s*firstName\s*\}\}/gi, firstName?.trim() || 'there');
}

export interface TriggerStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ReEngagementTriggerResult {
  runId: string;
  stages: TriggerStageResult[];
  atRiskCount: number;
  triggeredCount: number;
  skippedCount: number;
  triggered: { contactId: string; reason: string }[];
}

// Real, deterministic. Evaluates the real condition (at_risk +
// real-phone + staleness threshold + cooldown) against every real
// at_risk contact and writes one real re_engagement_messages row per
// eligible contact -- status is always 'logged', never a fabricated
// delivery confirmation, since no real SMS/WhatsApp gateway exists in
// this build (disclosed in the architecture note and Governance tab).
export async function runReEngagementTriggerPipeline(params: {
  channel: 'sms' | 'whatsapp';
  messageTemplate: string;
  thresholdDays?: number;
  cooldownDays?: number;
  triggeredBy?: string | null;
}): Promise<ReEngagementTriggerResult> {
  const thresholdDays = params.thresholdDays ?? 14;
  const cooldownDays = params.cooldownDays ?? 7;
  const stages: TriggerStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'broadcasts',
    operationName: 'pipeline_re_engagement_trigger',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const atRiskContacts = getAtRiskContacts();
  stages.push({ stage: 'fetch_at_risk_contacts', input: {}, process: "Read real contacts with lifecycle_stage='at_risk' (written by the activation pipeline, not recomputed here)", output: `${atRiskContacts.length} contacts`, status: 'ok' });

  const now = new Date();
  const triggered: { contactId: string; reason: string }[] = [];
  let skipped = 0;

  for (const contact of atRiskContacts) {
    const lastMessage = getLastReEngagementMessageForContact(contact.id);
    const eligibility = evaluateReEngagementEligibility(
      { lifecycleStage: contact.lifecycleStage, phone: contact.phone, lastEngagedAt: contact.lastEngagedAt, lastMessagedAt: lastMessage?.triggeredAt ?? null },
      now, thresholdDays, cooldownDays
    );
    if (!eligibility.eligible) { skipped++; continue; }

    const messageBody = personalizeMessage(params.messageTemplate, contact.firstName);
    createReEngagementMessage({
      contactId: contact.id,
      channel: params.channel,
      triggerReason: eligibility.reason,
      messageBody,
      phoneNumberSnapshot: contact.phone ?? undefined,
      status: 'logged',
      triggeredAt: now,
      createdBy: params.triggeredBy ?? undefined,
    });
    triggered.push({ contactId: contact.id, reason: eligibility.reason });
  }

  stages.push({
    stage: 'evaluate_and_trigger',
    input: { thresholdDays, cooldownDays, channel: params.channel },
    process: 'Evaluate the real disclosed eligibility rule per at-risk contact; write a real logged message row for each real eligible contact',
    output: { triggered: triggered.length, skipped },
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { atRiskCount: atRiskContacts.length, triggeredCount: triggered.length, skippedCount: skipped } });
  return { runId, stages, atRiskCount: atRiskContacts.length, triggeredCount: triggered.length, skippedCount: skipped, triggered };
}
