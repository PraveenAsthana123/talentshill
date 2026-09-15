import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';
import { computeRatio } from '@/lib/kpi/kpi-engine';

export interface ChannelConversion {
  source: string;
  total: number;
  engaged: number;
  conversionRate: number | null;
}

// Real, per-channel conversion rate over the real contacts.source field
// and the real, behaviorally-computed lifecycleStage='engaged' signal
// (see contacts table comment: never a profile-completeness proxy).
export function getChannelConversionRates(): ChannelConversion[] {
  const rows = db.select().from(schema.contacts).all();
  const bySource = new Map<string, { total: number; engaged: number }>();
  for (const r of rows) {
    const entry = bySource.get(r.source) ?? { total: 0, engaged: 0 };
    entry.total++;
    if (r.lifecycleStage === 'engaged') entry.engaged++;
    bySource.set(r.source, entry);
  }
  const results = Array.from(bySource.entries()).map(([source, v]) => ({
    source, total: v.total, engaged: v.engaged, conversionRate: computeRatio(v.engaged, v.total).value,
  }));

  if (results.length > 0) {
    const top = [...results].sort((a, b) => (b.conversionRate ?? -1) - (a.conversionRate ?? -1))[0];
    recordEvidence({
      moduleKey: 'channel_attribution',
      claimClass: 'fact',
      claimText: `Channel Attribution: highest-converting real channel is "${top.source}" at ${top.conversionRate}% (${top.engaged}/${top.total}).`,
      sourceRef: 'contacts:channel_attribution_aggregate',
      sourceTable: 'contacts',
      confidence: top.total >= 20 ? 'high' : top.total >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return results.sort((a, b) => b.total - a.total);
}

export interface DedupResult {
  totalSubmissions: number;
  uniqueEmails: number;
  duplicateTouches: number; // totalSubmissions - uniqueEmails
  duplicateRate: number | null;
}

// Real cross-channel dedup: a lead submitting from multiple sourcePages
// would otherwise be double-counted as independent leads. Groups real
// contact_submissions by real email.
export function getDuplicateLeadTouches(): DedupResult {
  const rows = db.select().from(schema.contactSubmissions).all();
  const uniqueEmails = new Set(rows.map((r) => r.email)).size;
  const duplicateTouches = rows.length - uniqueEmails;
  return { totalSubmissions: rows.length, uniqueEmails, duplicateTouches, duplicateRate: computeRatio(duplicateTouches, rows.length).value };
}
