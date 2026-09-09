import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('email_compose', 'read')(async () => {
  const all = db.select().from(schema.emailComposeLog).orderBy(desc(schema.emailComposeLog.createdAt)).limit(50).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalComposeLogs: all.length,
    logs: all.map((c) => ({
      to: c.to, subject: c.subject, sent: c.sent, readinessScore: c.readinessScore ?? null, createdAt: c.createdAt,
    })),
  });
});
