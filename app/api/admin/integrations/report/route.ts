import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('integrations', 'read')(async () => {
  const accounts = db.select().from(schema.integrationAccounts).orderBy(desc(schema.integrationAccounts.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAccounts: accounts.length,
    accounts: accounts.map((a) => ({
      name: a.name, status: a.status, hasCredentials: !!a.credentials, readinessScore: a.readinessScore ?? null,
    })),
  });
});
