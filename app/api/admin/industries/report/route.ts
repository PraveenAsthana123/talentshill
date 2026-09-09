import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('industries', 'read')(async () => {
  const industries = db.select().from(schema.industries).orderBy(desc(schema.industries.contentScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalIndustries: industries.length,
    industries: industries.map((i) => ({
      name: i.name, isActive: i.isActive, contentScore: i.contentScore ?? null, hasIcon: !!i.icon,
    })),
  });
});
