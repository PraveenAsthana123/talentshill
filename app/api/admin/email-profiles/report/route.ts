import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('email_profiles', 'read')(async () => {
  const all = db.select().from(schema.emailProfiles).orderBy(desc(schema.emailProfiles.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalProfiles: all.length,
    profiles: all.map((p) => ({
      name: p.name, fromEmail: p.fromEmail, isActive: p.isActive, isDefault: p.isDefault, readinessScore: p.readinessScore ?? null,
    })),
  });
});
