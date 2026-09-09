import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('campaigns', 'read')(async (_request: NextRequest, _context: unknown) => {
  const campaigns = db.select().from(schema.campaigns).orderBy(desc(schema.campaigns.createdAt)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalCampaigns: campaigns.length,
    campaigns: campaigns.map((c) => ({
      name: c.name, type: c.type, status: c.status, subject: c.subject,
      audienceCount: c.audienceCount, totalSent: c.totalSent, totalOpened: c.totalOpened, totalClicked: c.totalClicked,
    })),
  });
});
