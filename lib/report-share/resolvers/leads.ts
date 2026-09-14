import { registerReportResolver } from '@/lib/report-share/registry';
import { getContactStats } from '@/lib/db/contact-queries';
import { db, schema } from '@/lib/db/index';
import { count } from 'drizzle-orm';

// Aggregate-only summary -- deliberately excludes fullName/email/phone
// and any other PII. Leads' own Governance tab already flags consent/PII
// handling as load-bearing for this module; a customer-self-service link
// must not become a way to leak individual lead contact details to
// whoever holds the URL.
registerReportResolver('leads', 'qualification_summary', async () => {
  const stats = getContactStats();
  const stageRows = db.select({ stage: schema.contactSubmissions.qualificationStage, cnt: count() })
    .from(schema.contactSubmissions)
    .groupBy(schema.contactSubmissions.qualificationStage)
    .all();

  return {
    title: 'Lead Qualification Summary',
    generatedAt: new Date().toISOString(),
    data: {
      total: stats.total,
      hotLeads: stats.hotLeads,
      warmLeads: stats.warmLeads,
      byIndustry: stats.byIndustry,
      byQualificationStage: stageRows.map((r) => ({ stage: r.stage || 'unqualified', count: r.cnt })),
    },
  };
});
