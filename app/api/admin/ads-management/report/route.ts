import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('ads_management', 'read')(async () => {
  const all = db.select().from(schema.adCampaigns).orderBy(desc(schema.adCampaigns.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalCampaigns: all.length,
    campaigns: all.map((c) => ({
      name: c.name, platform: c.platform, status: c.status, budget: c.budget, spend: c.spend, readinessScore: c.readinessScore ?? null,
    })),
  });
});
