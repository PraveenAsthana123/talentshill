import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { classifyLifecycleStage, computeActivationScore, runContactActivationPipeline } from '@/lib/pipelines/contact-activation-pipeline';
import { runContactRetentionSegmentationPipeline } from '@/lib/pipelines/contact-retention-segmentation-pipeline';
import { createContact, deleteContact } from '@/lib/db/contact-crm-queries';
import { createCampaign, deleteCampaign } from '@/lib/db/campaign-queries';
import { deleteList } from '@/lib/db/list-queries';

const NOW = new Date('2026-09-14T00:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

describe('classifyLifecycleStage (pure)', () => {
  it('classifies unsubscribed as churned regardless of engagement (positive case: explicit opt-out wins)', () => {
    const stage = classifyLifecycleStage({ status: 'unsubscribed', totalSent: 10, totalOpens: 5, totalClicks: 2, lastEngagedAt: daysAgo(1), createdAt: daysAgo(100), now: NOW });
    expect(stage).toBe('churned');
  });
  it('classifies a contact with zero sends as new (boundary)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 0, totalOpens: 0, totalClicks: 0, lastEngagedAt: null, createdAt: daysAgo(1), now: NOW });
    expect(stage).toBe('new');
  });
  it('classifies a recently-created never-opened contact as new, not at_risk (boundary)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 3, totalOpens: 0, totalClicks: 0, lastEngagedAt: null, createdAt: daysAgo(5), now: NOW });
    expect(stage).toBe('new');
  });
  it('classifies an old never-opened contact as at_risk (negative case)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 3, totalOpens: 0, totalClicks: 0, lastEngagedAt: null, createdAt: daysAgo(30), now: NOW });
    expect(stage).toBe('at_risk');
  });
  it('classifies a recently-engaged contact as engaged (positive case)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 5, totalOpens: 3, totalClicks: 1, lastEngagedAt: daysAgo(10), createdAt: daysAgo(60), now: NOW });
    expect(stage).toBe('engaged');
  });
  it('classifies a contact not engaged in 45 days as at_risk (boundary)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 5, totalOpens: 3, totalClicks: 1, lastEngagedAt: daysAgo(45), createdAt: daysAgo(120), now: NOW });
    expect(stage).toBe('at_risk');
  });
  it('classifies a contact not engaged in 120 days as churned (boundary)', () => {
    const stage = classifyLifecycleStage({ status: 'active', totalSent: 5, totalOpens: 3, totalClicks: 1, lastEngagedAt: daysAgo(120), createdAt: daysAgo(200), now: NOW });
    expect(stage).toBe('churned');
  });
});

describe('computeActivationScore (pure)', () => {
  it('scores 0 for a contact with zero sends (boundary)', () => {
    expect(computeActivationScore({ totalSent: 0, totalOpens: 0, totalClicks: 0, lastEngagedAt: null, now: NOW })).toBe(0);
  });
  it('scores high for a contact who engaged on every send, very recently (positive case)', () => {
    const score = computeActivationScore({ totalSent: 5, totalOpens: 5, totalClicks: 5, lastEngagedAt: daysAgo(0), now: NOW });
    expect(score).toBeGreaterThanOrEqual(95);
  });
  it('never exceeds 100 even with an engagement rate capped input (boundary)', () => {
    const score = computeActivationScore({ totalSent: 2, totalOpens: 10, totalClicks: 10, lastEngagedAt: daysAgo(0), now: NOW });
    expect(score).toBeLessThanOrEqual(100);
  });
  it('scores low for a contact who never engaged despite being sent to (negative case)', () => {
    const score = computeActivationScore({ totalSent: 5, totalOpens: 0, totalClicks: 0, lastEngagedAt: null, now: NOW });
    expect(score).toBe(0);
  });
});

const cleanupContactIds: string[] = [];
const cleanupCampaignIds: string[] = [];
const cleanupListIds: string[] = [];

afterAll(() => {
  for (const id of cleanupCampaignIds) {
    db.delete(schema.campaignRecipients).where(eq(schema.campaignRecipients.campaignId, id)).run();
    deleteCampaign(id);
  }
  for (const id of cleanupContactIds) deleteContact(id);
  for (const id of cleanupListIds) deleteList(id);
  for (const id of cleanupContactIds) {
    const remaining = db.select().from(schema.contacts).where(eq(schema.contacts.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('runContactActivationPipeline (real DB)', () => {
  it('writes real lifecycle_stage/activation_score/last_engaged_at from real campaign_recipients history (positive case)', async () => {
    const contactId = createContact({ email: `__test_activation_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    const campaignId = createCampaign({ name: `__test_activation_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);
    const recipientId = `r-${contactId}`;
    db.insert(schema.campaignRecipients).values({
      id: recipientId, campaignId, contactId, status: 'clicked', sentAt: new Date(), openedAt: new Date(), clickedAt: new Date(),
    }).run();

    const result = await runContactActivationPipeline({});
    expect(result.totalContacts).toBeGreaterThan(0);

    const contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, contactId)).get();
    expect(contact?.lifecycleStage).toBe('engaged');
    expect(contact?.activationScore).toBeGreaterThan(0);
    expect(contact?.lastEngagedAt).not.toBeNull();
  });
});

describe('runContactRetentionSegmentationPipeline (real DB)', () => {
  it('segments real at_risk contacts into a real retention list (positive case)', async () => {
    const contactId = createContact({ email: `__test_atrisk_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    db.update(schema.contacts).set({ lifecycleStage: 'at_risk' }).where(eq(schema.contacts.id, contactId)).run();

    const result = await runContactRetentionSegmentationPipeline({});
    expect(result.atRiskCount).toBeGreaterThanOrEqual(1);
    expect(result.retentionListId).not.toBeNull();

    if (result.retentionListId) {
      cleanupListIds.push(result.retentionListId);
      const members = db.select().from(schema.listMembers).where(eq(schema.listMembers.listId, result.retentionListId)).all();
      expect(members.some((m) => m.contactId === contactId)).toBe(true);
    }
  });
});
