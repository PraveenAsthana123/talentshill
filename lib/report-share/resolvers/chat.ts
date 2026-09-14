import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';

// Aggregate-only, same PII discipline as leads.ts/contacts.ts --
// visitor emails/names and full conversation content must never leak
// to whoever holds a share-link URL. Only counts and tier breakdowns.
registerReportResolver('chat', 'sales_qualification_summary', async () => {
  const requests = db.select().from(schema.chatRequests).all();
  const qualified = requests.filter((r) => r.qualificationTier !== null && r.qualificationTier !== undefined);

  return {
    title: 'Chat Sales Qualification Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalRequests: requests.length,
      qualifiedRequests: qualified.length,
      byTier: qualified.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.qualificationTier!]: (acc[r.qualificationTier!] ?? 0) + 1 }), {}),
      contactsLinkedFromChat: requests.filter((r) => r.contactId !== null && r.contactId !== undefined).length,
    },
  };
});
