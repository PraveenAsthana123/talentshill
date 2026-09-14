import { describe, it, expect, afterAll } from 'vitest';
import { computeDaysSince, evaluateReEngagementEligibility, personalizeMessage, runReEngagementTriggerPipeline } from '@/lib/pipelines/re-engagement-trigger-pipeline';
import { createContact } from '@/lib/db/contact-crm-queries';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

describe('computeDaysSince (pure)', () => {
  it('returns null for a never-engaged contact (negative case)', () => {
    expect(computeDaysSince(null, new Date('2026-01-15'))).toBeNull();
  });
  it('computes an exact real day difference (positive case)', () => {
    expect(computeDaysSince(new Date('2026-01-01'), new Date('2026-01-15'))).toBe(14);
  });
  it('floors a partial day (boundary)', () => {
    expect(computeDaysSince(new Date('2026-01-01T12:00:00Z'), new Date('2026-01-02T06:00:00Z'))).toBe(0);
  });
});

describe('evaluateReEngagementEligibility (pure)', () => {
  const now = new Date('2026-01-15');

  it('rejects a contact whose lifecycle_stage is not at_risk (negative case)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'engaged', phone: '+15550100', lastEngagedAt: null, lastMessagedAt: null }, now, 14, 7);
    expect(result.eligible).toBe(false);
  });

  it('rejects an at_risk contact with no real phone number (negative case)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'at_risk', phone: null, lastEngagedAt: null, lastMessagedAt: null }, now, 14, 7);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('phone');
  });

  it('accepts an eligible at_risk contact with a real phone, never engaged, never messaged (positive case)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'at_risk', phone: '+15550100', lastEngagedAt: null, lastMessagedAt: null }, now, 14, 7);
    expect(result.eligible).toBe(true);
    expect(result.reason).toContain('never engaged');
  });

  it('rejects a contact still within the staleness threshold (boundary)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'at_risk', phone: '+15550100', lastEngagedAt: new Date('2026-01-05'), lastMessagedAt: null }, now, 14, 7);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('threshold');
  });

  it('accepts a contact exactly at the staleness threshold (boundary)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'at_risk', phone: '+15550100', lastEngagedAt: new Date('2026-01-01'), lastMessagedAt: null }, now, 14, 7);
    expect(result.eligible).toBe(true);
  });

  it('rejects a contact already messaged within the cooldown window (negative case)', () => {
    const result = evaluateReEngagementEligibility({ lifecycleStage: 'at_risk', phone: '+15550100', lastEngagedAt: new Date('2025-12-01'), lastMessagedAt: new Date('2026-01-10') }, now, 14, 7);
    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('cooldown');
  });
});

describe('personalizeMessage (pure)', () => {
  it('substitutes a real first name (positive case)', () => {
    expect(personalizeMessage('Hi {{firstName}}!', 'Jane')).toBe('Hi Jane!');
  });
  it('falls back to a generic greeting when no real name is on file (negative case)', () => {
    expect(personalizeMessage('Hi {{firstName}}!', null)).toBe('Hi there!');
  });
});

const cleanupContactEmails: string[] = [];

afterAll(() => {
  for (const email of cleanupContactEmails) {
    const c = db.select().from(schema.contacts).where(eq(schema.contacts.email, email)).get();
    if (c) {
      db.delete(schema.reEngagementMessages).where(eq(schema.reEngagementMessages.contactId, c.id)).run();
      db.delete(schema.contacts).where(eq(schema.contacts.id, c.id)).run();
    }
  }
});

describe('runReEngagementTriggerPipeline (real DB)', () => {
  it('writes a real logged message for a real eligible at_risk contact with a phone (positive case)', async () => {
    const email = `__test_re_engage_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'Priya', phone: '+15550199' });
    db.update(schema.contacts).set({ lifecycleStage: 'at_risk', lastEngagedAt: null }).where(eq(schema.contacts.id, contactId)).run();

    const result = await runReEngagementTriggerPipeline({ channel: 'sms', messageTemplate: 'Hi {{firstName}}, come back!', thresholdDays: 14, cooldownDays: 7 });
    const triggeredForThisContact = result.triggered.find((t) => t.contactId === contactId);
    expect(triggeredForThisContact).toBeDefined();

    const messages = db.select().from(schema.reEngagementMessages).where(eq(schema.reEngagementMessages.contactId, contactId)).all();
    expect(messages.length).toBe(1);
    expect(messages[0].messageBody).toBe('Hi Priya, come back!');
    expect(messages[0].status).toBe('logged');
    expect(messages[0].channel).toBe('sms');
  });

  it('does not trigger a second message for the same contact within the cooldown window on a second run (negative case)', async () => {
    const email = `__test_re_engage_cooldown_${Date.now()}@example.com`;
    cleanupContactEmails.push(email);
    const contactId = createContact({ email, firstName: 'Sam', phone: '+15550188' });
    db.update(schema.contacts).set({ lifecycleStage: 'at_risk', lastEngagedAt: null }).where(eq(schema.contacts.id, contactId)).run();

    await runReEngagementTriggerPipeline({ channel: 'sms', messageTemplate: 'Hi {{firstName}}!', thresholdDays: 14, cooldownDays: 7 });
    const secondRun = await runReEngagementTriggerPipeline({ channel: 'sms', messageTemplate: 'Hi {{firstName}}!', thresholdDays: 14, cooldownDays: 7 });

    expect(secondRun.triggered.find((t) => t.contactId === contactId)).toBeUndefined();
    const messages = db.select().from(schema.reEngagementMessages).where(eq(schema.reEngagementMessages.contactId, contactId)).all();
    expect(messages.length).toBe(1);
  });
});
