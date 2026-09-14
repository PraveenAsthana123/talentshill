import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';

// Aggregate-only, same PII discipline as chat.ts/leads.ts/contacts.ts --
// call transcripts and phone numbers must never leak to whoever holds a
// share-link URL. Only counts and tier breakdowns.
registerReportResolver('voice_ai', 'call_qualification_summary', async () => {
  const calls = db.select().from(schema.voiceCallLogs).all();
  const qualified = calls.filter((c) => c.qualificationTier !== null && c.qualificationTier !== undefined);

  return {
    title: 'Voice Call Qualification Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalCalls: calls.length,
      qualifiedCalls: qualified.length,
      byTier: qualified.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.qualificationTier!]: (acc[c.qualificationTier!] ?? 0) + 1 }), {}),
      contactsLinkedFromCalls: calls.filter((c) => c.contactId !== null && c.contactId !== undefined).length,
    },
  };
});
