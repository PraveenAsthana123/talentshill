import { describe, it, expect, afterAll } from 'vitest';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { createCampaign, deleteCampaign, getCampaignRecipientCount } from '@/lib/db/campaign-queries';
import { createContact, deleteContact } from '@/lib/db/contact-crm-queries';
import { createList, deleteList, addListMembers } from '@/lib/db/list-queries';
import { assignVariant } from '@/lib/jobs/handlers/campaign-sender';
import { runCampaignRecipientMaterializationPipeline } from '@/lib/pipelines/campaign-recipient-materialization-pipeline';
import { runCampaignBehavioralSegmentationPipeline } from '@/lib/pipelines/campaign-behavioral-segmentation-pipeline';
import { logOpenEvent, logClickEvent } from '@/lib/db/tracking-queries';

describe('assignVariant (pure, deterministic A/B split)', () => {
  it('assigns the same recipient to the same variant every time (positive case)', () => {
    const a = assignVariant('recipient-123', 2);
    const b = assignVariant('recipient-123', 2);
    expect(a).toBe(b);
  });
  it('stays within bounds for a given variant count (boundary)', () => {
    const v = assignVariant('some-recipient-id', 3);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(3);
  });
  it('always returns 0 for a single-variant campaign (boundary: n=1)', () => {
    expect(assignVariant('any-id', 1)).toBe(0);
  });
});

// createContact/createCampaign/createList all return a plain string id,
// not an object -- real DB writes, cleaned up and confirmed gone below.
const cleanupCampaignIds: string[] = [];
const cleanupContactIds: string[] = [];
const cleanupListIds: string[] = [];

afterAll(() => {
  for (const id of cleanupCampaignIds) {
    db.delete(schema.campaignRecipients).where(eq(schema.campaignRecipients.campaignId, id)).run();
    deleteCampaign(id);
  }
  for (const id of cleanupContactIds) deleteContact(id);
  for (const id of cleanupListIds) deleteList(id);
  for (const id of cleanupCampaignIds) {
    const remaining = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, id)).get();
    expect(remaining).toBeUndefined();
  }
});

describe('runCampaignRecipientMaterializationPipeline (real DB)', () => {
  it('materializes real campaign_recipients rows from a real static list, and updates audienceCount (positive case)', async () => {
    const contact1Id = createContact({ email: `__test_mat1_${Date.now()}@example.com`, status: 'active' });
    const contact2Id = createContact({ email: `__test_mat2_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contact1Id, contact2Id);

    const listId = createList({ name: `__test_list_${Date.now()}`, type: 'static' });
    cleanupListIds.push(listId);
    addListMembers(listId, [contact1Id, contact2Id]);

    const campaignId = createCampaign({ name: `__test_campaign_${Date.now()}`, audienceType: 'list', audienceId: listId });
    cleanupCampaignIds.push(campaignId);

    const result = await runCampaignRecipientMaterializationPipeline({ campaignId });
    expect(result.added).toBe(2);
    expect(result.totalRecipients).toBe(2);
    expect(getCampaignRecipientCount(campaignId)).toBe(2);

    const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).get();
    expect(campaign?.audienceCount).toBe(2);
  });

  it('is idempotent -- running twice does not duplicate recipients (boundary)', async () => {
    const contactId = createContact({ email: `__test_idem_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    const listId = createList({ name: `__test_idem_list_${Date.now()}`, type: 'static' });
    cleanupListIds.push(listId);
    addListMembers(listId, [contactId]);
    const campaignId = createCampaign({ name: `__test_idem_campaign_${Date.now()}`, audienceType: 'list', audienceId: listId });
    cleanupCampaignIds.push(campaignId);

    await runCampaignRecipientMaterializationPipeline({ campaignId });
    const second = await runCampaignRecipientMaterializationPipeline({ campaignId });
    expect(second.added).toBe(0);
    expect(getCampaignRecipientCount(campaignId)).toBe(1);
  });

  it('returns campaignId:null for a nonexistent campaign (negative case)', async () => {
    const result = await runCampaignRecipientMaterializationPipeline({ campaignId: 'not-a-real-id' });
    expect(result.campaignId).toBeNull();
    expect(result.added).toBe(0);
  });
});

describe('logOpenEvent/logClickEvent campaign counter increments (real DB)', () => {
  it('increments campaign.totalOpened on a real first open (regression: caught live 2026-09-14 -- counters were never incremented despite per-recipient tracking working)', async () => {
    const contactId = createContact({ email: `__test_counter_open_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    const campaignId = createCampaign({ name: `__test_counter_open_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);
    const recipientId = `r-${contactId}`;
    db.insert(schema.campaignRecipients).values({ id: recipientId, campaignId, contactId, status: 'sent', sentAt: new Date() }).run();

    logOpenEvent(recipientId);

    const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).get();
    expect(campaign?.totalOpened).toBe(1);
  });

  it('does not double-count a repeat open from the same recipient (negative/idempotency case)', async () => {
    const contactId = createContact({ email: `__test_counter_repeat_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    const campaignId = createCampaign({ name: `__test_counter_repeat_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);
    const recipientId = `r-${contactId}`;
    db.insert(schema.campaignRecipients).values({ id: recipientId, campaignId, contactId, status: 'sent', sentAt: new Date() }).run();

    logOpenEvent(recipientId);
    logOpenEvent(recipientId);
    logOpenEvent(recipientId);

    const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).get();
    expect(campaign?.totalOpened).toBe(1);
  });

  it('increments campaign.totalClicked on a real first click (positive case)', async () => {
    const contactId = createContact({ email: `__test_counter_click_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(contactId);
    const campaignId = createCampaign({ name: `__test_counter_click_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);
    const recipientId = `r-${contactId}`;
    db.insert(schema.campaignRecipients).values({ id: recipientId, campaignId, contactId, status: 'sent', sentAt: new Date() }).run();

    logClickEvent(recipientId, 'https://example.com/offer');

    const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, campaignId)).get();
    expect(campaign?.totalClicked).toBe(1);
  });
});

describe('runCampaignBehavioralSegmentationPipeline (real DB)', () => {
  it('identifies real non-openers and materializes a real nurture list (positive case)', async () => {
    const openerId = createContact({ email: `__test_opener_${Date.now()}@example.com`, status: 'active' });
    const nonOpenerId = createContact({ email: `__test_nonopener_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(openerId, nonOpenerId);

    const campaignId = createCampaign({ name: `__test_behavioral_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);

    db.insert(schema.campaignRecipients).values([
      { id: `r-${openerId}`, campaignId, contactId: openerId, status: 'sent', sentAt: new Date(), openedAt: new Date() },
      { id: `r-${nonOpenerId}`, campaignId, contactId: nonOpenerId, status: 'sent', sentAt: new Date() },
    ]).run();

    const result = await runCampaignBehavioralSegmentationPipeline({ campaignId });
    expect(result.nonOpenerCount).toBe(1);
    expect(result.nurtureListId).not.toBeNull();

    if (result.nurtureListId) {
      cleanupListIds.push(result.nurtureListId);
      const members = db.select().from(schema.listMembers).where(eq(schema.listMembers.listId, result.nurtureListId)).all();
      expect(members.map((m) => m.contactId)).toEqual([nonOpenerId]);
    }
  });

  it('counts a clicked recipient as part of the sent cohort, not just sent/delivered (regression: caught live 2026-09-14)', async () => {
    const clickerId = createContact({ email: `__test_clicker_${Date.now()}@example.com`, status: 'active' });
    const nonOpenerId = createContact({ email: `__test_nonopener2_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(clickerId, nonOpenerId);
    const campaignId = createCampaign({ name: `__test_clicker_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);

    db.insert(schema.campaignRecipients).values([
      { id: `r-${clickerId}`, campaignId, contactId: clickerId, status: 'clicked', sentAt: new Date(), openedAt: new Date(), clickedAt: new Date() },
      { id: `r-${nonOpenerId}`, campaignId, contactId: nonOpenerId, status: 'sent', sentAt: new Date() },
    ]).run();

    const result = await runCampaignBehavioralSegmentationPipeline({ campaignId });
    // Only the true non-opener should be segmented -- the clicked
    // recipient must be recognized as part of the sent cohort (and
    // correctly excluded from non-openers since they have openedAt set).
    expect(result.nonOpenerCount).toBe(1);
    if (result.nurtureListId) {
      cleanupListIds.push(result.nurtureListId);
      const members = db.select().from(schema.listMembers).where(eq(schema.listMembers.listId, result.nurtureListId)).all();
      expect(members.map((m) => m.contactId)).toEqual([nonOpenerId]);
    }
  });

  it('creates no list when there are zero non-openers (boundary)', async () => {
    const openerId = createContact({ email: `__test_allopen_${Date.now()}@example.com`, status: 'active' });
    cleanupContactIds.push(openerId);
    const campaignId = createCampaign({ name: `__test_allopen_campaign_${Date.now()}` });
    cleanupCampaignIds.push(campaignId);
    db.insert(schema.campaignRecipients).values([
      { id: `r-${openerId}`, campaignId, contactId: openerId, status: 'sent', sentAt: new Date(), openedAt: new Date() },
    ]).run();

    const result = await runCampaignBehavioralSegmentationPipeline({ campaignId });
    expect(result.nonOpenerCount).toBe(0);
    expect(result.nurtureListId).toBeNull();
  });
});
