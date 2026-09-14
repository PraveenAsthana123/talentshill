import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';

// Aggregate-only, same PII discipline as chat.ts/voice-ai.ts -- message
// bodies and phone numbers must never leak to whoever holds a
// share-link URL. Only counts and channel breakdown.
registerReportResolver('broadcasts', 're_engagement_summary', async () => {
  const messages = db.select().from(schema.reEngagementMessages).all();

  return {
    title: 'Re-engagement Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalMessages: messages.length,
      byChannel: messages.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.channel]: (acc[m.channel] ?? 0) + 1 }), {}),
      byStatus: messages.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.status]: (acc[m.status] ?? 0) + 1 }), {}),
    },
  };
});
