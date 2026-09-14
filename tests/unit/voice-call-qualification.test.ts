import { describe, it, expect, afterAll } from 'vitest';
import { detectCallSignals, runVoiceCallQualificationPipeline } from '@/lib/pipelines/voice-call-qualification-pipeline';
import { createVoiceCallLog } from '@/lib/db/voice-call-queries';
import { getContactByEmail } from '@/lib/db/contact-crm-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

describe('detectCallSignals (pure)', () => {
  it('detects zero signals in idle chit-chat (negative case)', () => {
    const result = detectCallSignals('Hi, nice weather today, how are you?');
    expect(result.score).toBe(0);
    expect(result.tier).toBe('cold');
    expect(result.signals.every((s) => !s.detected)).toBe(true);
  });

  it('detects all 5 BANT+next-step signals in a fully qualified call (positive case)', () => {
    const result = detectCallSignals(
      "What's the budget look like? I'm the decision maker here. We have a real problem with our current process, need this by next month, so let's schedule a follow-up demo."
    );
    expect(result.score).toBe(100);
    expect(result.tier).toBe('hot');
    expect(result.signals.every((s) => s.detected)).toBe(true);
  });

  it('classifies exactly at the warm/hot boundary (boundary)', () => {
    const warm = detectCallSignals('What is the budget for something like this?');
    expect(warm.score).toBe(20);
    expect(warm.tier).toBe('warm');

    const hot = detectCallSignals('Budget is fine, we have a real problem, need this asap, let\'s schedule a follow-up.');
    expect(hot.score).toBe(80);
    expect(hot.tier).toBe('hot');
  });

  it('does not false-positive authority on unrelated text mentioning "decide" casually (boundary)', () => {
    const result = detectCallSignals('I need to think about it and decide later.');
    const authoritySignal = result.signals.find((s) => s.key === 'authority_confirmed');
    expect(authoritySignal?.detected).toBe(false);
  });
});

const cleanupCallIds: string[] = [];
const cleanupContactEmails: string[] = [];

afterAll(() => {
  for (const id of cleanupCallIds) {
    db.delete(schema.voiceCallLogs).where(eq(schema.voiceCallLogs.id, id)).run();
  }
  for (const email of cleanupContactEmails) {
    const c = getContactByEmail(email);
    if (c) db.delete(schema.contacts).where(eq(schema.contacts.id, c.id)).run();
  }
});

describe('runVoiceCallQualificationPipeline (real DB)', () => {
  it('writes score/tier back without linking a contact for a cold call (negative case)', async () => {
    const callId = createVoiceCallLog({ direction: 'outbound', transcript: 'just saying hello, no real interest' });
    cleanupCallIds.push(callId);

    const result = await runVoiceCallQualificationPipeline({ callId });
    expect(result.tier).toBe('cold');
    expect(result.contactId).toBeNull();
  });

  it('creates and links a real contact for a hot call with a real email in the transcript (positive case)', async () => {
    const email = `__test_hot_call_lead_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const callId = createVoiceCallLog({
      direction: 'outbound',
      transcript: `Budget is approved, I'm the decision maker, we have a real problem, need this asap, let's schedule a follow-up -- reach me at ${email}`,
    });
    cleanupCallIds.push(callId);

    const result = await runVoiceCallQualificationPipeline({ callId });
    expect(result.tier).toBe('hot');
    expect(result.contactId).not.toBeNull();
    expect(result.contactCreated).toBe(true);

    const contact = getContactByEmail(email);
    expect(contact?.source).toBe('voice_call');
  });
});
