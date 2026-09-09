import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('chat', 'read')(async () => {
  const all = db.select().from(schema.chatRequests).orderBy(desc(schema.chatRequests.responseQualityScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalRequests: all.length,
    requests: all.map((r) => ({
      subject: r.subject, status: r.status, priority: r.priority, responseQualityScore: r.responseQualityScore ?? null,
    })),
  });
});
