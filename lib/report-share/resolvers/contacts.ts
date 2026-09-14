import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';
import { count } from 'drizzle-orm';

// Aggregate-only, no PII -- contacts' own Governance tab already flags
// this module as higher PII/consent risk than leads (bulk CSV import,
// no verified consent record). A shared report must never leak
// individual contact names/emails, same discipline as the leads
// resolver.
registerReportResolver('contacts', 'lifecycle_summary', async () => {
  const total = db.select({ cnt: count() }).from(schema.contacts).get()?.cnt || 0;
  const stageRows = db.select({ stage: schema.contacts.lifecycleStage, cnt: count() })
    .from(schema.contacts)
    .groupBy(schema.contacts.lifecycleStage)
    .all();

  return {
    title: 'Contact Lifecycle Summary',
    generatedAt: new Date().toISOString(),
    data: {
      total,
      byLifecycleStage: stageRows.map((r) => ({ stage: r.stage || 'new', count: r.cnt })),
    },
  };
});
