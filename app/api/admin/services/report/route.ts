import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('services', 'read')(async () => {
  const services = db.select().from(schema.services).orderBy(desc(schema.services.contentScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalServices: services.length,
    services: services.map((s) => ({
      name: s.name, category: s.category, isActive: s.isActive, contentScore: s.contentScore ?? null,
    })),
  });
});
