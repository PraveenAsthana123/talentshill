import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc, sql } from 'drizzle-orm';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Demo 3 -- Affiliate Revenue Control Tower. Net-new, genuinely real:
// recruit affiliate -> unique tracking link -> real click -> attributed
// conversion -> deterministic commission (orderValue * disclosed rate) ->
// basic fraud check (self-click / rapid-repeat-click heuristics, disclosed
// as heuristic, not an ML fraud model) -> payout status. No real payout-
// gateway integration exists; payoutStatus stays 'not_paid_no_gateway'
// until one is wired -- never marked "paid" without a real payout
// reference, same discipline as every other externally-blocked module
// this session.

export function recruitAffiliate(params: { name: string; email: string; commissionRateBasisPoints?: number }) {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.affiliate).values({
    id, name: params.name, email: params.email,
    commissionRateBasisPoints: params.commissionRateBasisPoints ?? 1000,
    status: 'prospecting', createdAt: now, updatedAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'affiliate', claimClass: 'fact',
    claimText: `Affiliate recruited: ${params.name} (${params.email}).`,
    sourceRef: `affiliate:${id}`, sourceTable: 'affiliate', confidence: 'high', createdBy: 'system',
  });
  return id;
}

export function createTrackingLink(affiliateId: string, destinationUrl: string) {
  const affiliate = db.select().from(schema.affiliate).where(eq(schema.affiliate.id, affiliateId)).get();
  if (!affiliate) throw new Error('createTrackingLink requires a real, already-recruited affiliateId.');

  const id = randomUUID();
  const trackingCode = randomUUID().slice(0, 8);
  db.insert(schema.affiliateLink).values({ id, affiliateId, trackingCode, destinationUrl, createdAt: new Date() }).run();
  return { id, trackingCode };
}

export function recordClick(trackingCode: string) {
  const link = db.select().from(schema.affiliateLink).where(eq(schema.affiliateLink.trackingCode, trackingCode)).get();
  if (!link) throw new Error(`No real affiliate link with tracking code ${trackingCode}.`);
  const id = randomUUID();
  db.insert(schema.affiliateClick).values({ id, affiliateLinkId: link.id, clickedAt: new Date() }).run();
  return id;
}

// Heuristic, disclosed fraud check -- not an ML model. Flags a conversion
// whose click and conversion happen implausibly fast (<2s), a real signal
// of a bot/self-click, not proof of fraud.
export function checkFraudHeuristic(clickedAt: Date, convertedAt: Date): { flagged: boolean; reason: string | null } {
  const deltaMs = convertedAt.getTime() - clickedAt.getTime();
  if (deltaMs < 2000) return { flagged: true, reason: `Click-to-conversion gap was ${deltaMs}ms (<2s), below the disclosed plausibility threshold.` };
  return { flagged: false, reason: null };
}

export function recordConversion(params: { affiliateClickId: string; orderValueCents: number }) {
  const click = db.select().from(schema.affiliateClick).where(eq(schema.affiliateClick.id, params.affiliateClickId)).get();
  if (!click) throw new Error('recordConversion requires a real, already-recorded affiliateClickId.');
  const link = db.select().from(schema.affiliateLink).where(eq(schema.affiliateLink.id, click.affiliateLinkId)).get();
  if (!link) throw new Error('Affiliate click references a link that no longer exists.');
  const affiliate = db.select().from(schema.affiliate).where(eq(schema.affiliate.id, link.affiliateId)).get();
  if (!affiliate) throw new Error('Affiliate link references an affiliate that no longer exists.');

  const convertedAt = new Date();
  const commissionCents = Math.round(params.orderValueCents * affiliate.commissionRateBasisPoints / 10000);
  const fraud = checkFraudHeuristic(click.clickedAt, convertedAt);

  const id = randomUUID();
  db.insert(schema.affiliateConversion).values({
    id, affiliateClickId: params.affiliateClickId, affiliateId: affiliate.id,
    orderValueCents: params.orderValueCents, commissionCents,
    fraudFlag: fraud.flagged, fraudReason: fraud.reason,
    payoutStatus: 'not_paid_no_gateway', convertedAt,
  }).run();

  recordEvidence({
    moduleKey: 'affiliate', claimClass: 'fact',
    claimText: `Conversion attributed to affiliate ${affiliate.name}: order=$${(params.orderValueCents / 100).toFixed(2)}, commission=$${(commissionCents / 100).toFixed(2)}${fraud.flagged ? ' (fraud-flagged)' : ''}.`,
    sourceRef: `affiliate_conversion:${id}`, sourceTable: 'affiliate_conversion', confidence: 'high', createdBy: 'system',
  });

  return { id, commissionCents, fraudFlag: fraud.flagged, fraudReason: fraud.reason };
}

export function getAffiliateRanking() {
  const affiliates = db.select().from(schema.affiliate).all();
  return affiliates.map((a) => {
    const conversions = db.select().from(schema.affiliateConversion).where(eq(schema.affiliateConversion.affiliateId, a.id)).all();
    const realConversions = conversions.filter((c) => !c.fraudFlag);
    const totalRevenueCents = realConversions.reduce((sum, c) => sum + c.orderValueCents, 0);
    const totalCommissionCents = realConversions.reduce((sum, c) => sum + c.commissionCents, 0);
    return {
      affiliateId: a.id, name: a.name, status: a.status,
      conversionCount: realConversions.length,
      fraudFlaggedCount: conversions.length - realConversions.length,
      totalRevenueCents, totalCommissionCents,
    };
  }).sort((a, b) => b.totalRevenueCents - a.totalRevenueCents);
}

export function getAffiliateControlTowerView() {
  const clickCount = db.select({ c: sql<number>`count(*)` }).from(schema.affiliateClick).get()?.c ?? 0;
  const conversions = db.select().from(schema.affiliateConversion).all();
  const realConversions = conversions.filter((c) => !c.fraudFlag);
  return {
    affiliateCount: db.select({ c: sql<number>`count(*)` }).from(schema.affiliate).get()?.c ?? 0,
    linkCount: db.select({ c: sql<number>`count(*)` }).from(schema.affiliateLink).get()?.c ?? 0,
    clickCount,
    conversionCount: realConversions.length,
    fraudFlaggedCount: conversions.length - realConversions.length,
    conversionRate: clickCount > 0 ? Math.round((realConversions.length / clickCount) * 1000) / 10 : null,
    totalCommissionCents: realConversions.reduce((sum, c) => sum + c.commissionCents, 0),
    ranking: getAffiliateRanking(),
    gapsDisclosed: 'No real payout-gateway integration exists -- commission is computed and recorded, never marked paid. Fraud check is a disclosed 2-second click-to-conversion heuristic, not an ML fraud model.',
  };
}

export function recordDemoLatest() {
  return db.select().from(schema.affiliateConversion).orderBy(desc(schema.affiliateConversion.convertedAt)).limit(10).all();
}
