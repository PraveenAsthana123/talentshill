import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('templates', 'read')(async () => {
  const all = db.select().from(schema.emailTemplates).orderBy(desc(schema.emailTemplates.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalTemplates: all.length,
    templates: all.map((t) => ({
      name: t.name, category: t.category, isActive: t.isActive, readinessScore: t.readinessScore ?? null,
    })),
  });
});
