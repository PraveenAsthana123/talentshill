import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';

// Aggregate-only, same PII discipline as chat.ts/voice-ai.ts/broadcasts.ts
// -- registrant names/emails and engagement notes must never leak to
// whoever holds a share-link URL. Only counts and tier breakdown.
registerReportResolver('appointments', 'webinar_pipeline_summary', async () => {
  const webinars = db.select().from(schema.webinars).all();
  const registrants = db.select().from(schema.webinarRegistrants).all();
  const qualified = registrants.filter((r) => r.qualificationTier === 'hot' || r.qualificationTier === 'warm');

  return {
    title: 'Webinar-to-Pipeline Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalWebinars: webinars.length,
      totalRegistrants: registrants.length,
      attendedCount: registrants.filter((r) => r.attended === true).length,
      qualifiedCount: qualified.length,
      pipelineLinkedCount: registrants.filter((r) => r.contactSubmissionId !== null && r.contactSubmissionId !== undefined).length,
      byTier: registrants.reduce((acc: Record<string, number>, r) => {
        if (!r.qualificationTier) return acc;
        return { ...acc, [r.qualificationTier]: (acc[r.qualificationTier] ?? 0) + 1 };
      }, {}),
    },
  };
});
