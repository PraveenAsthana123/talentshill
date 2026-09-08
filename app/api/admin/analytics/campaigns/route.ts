import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

const { campaigns } = schema;

export const GET = withPermission('analytics', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const allCampaigns = db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).all();

    const totalCampaigns = allCampaigns.length;
    const completedCampaigns = allCampaigns.filter(c => c.status === 'completed').length;
    const totalSent = allCampaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0);
    const totalOpened = allCampaigns.reduce((sum, c) => sum + (c.totalOpened || 0), 0);
    const totalClicked = allCampaigns.reduce((sum, c) => sum + (c.totalClicked || 0), 0);
    const totalBounced = allCampaigns.reduce((sum, c) => sum + (c.totalBounced || 0), 0);

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : '0';
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100).toFixed(1) : '0';

    // Best performing campaigns by open rate
    const topCampaigns = allCampaigns
      .filter(c => (c.totalSent || 0) > 0)
      .map(c => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        sent: c.totalSent || 0,
        opened: c.totalOpened || 0,
        clicked: c.totalClicked || 0,
        openRate: (((c.totalOpened || 0) / (c.totalSent || 1)) * 100).toFixed(1),
        clickRate: (((c.totalClicked || 0) / (c.totalSent || 1)) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.openRate) - parseFloat(a.openRate))
      .slice(0, 10);

    // Recent campaigns
    const recentCampaigns = allCampaigns.slice(0, 10).map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      sent: c.totalSent || 0,
      opened: c.totalOpened || 0,
      clicked: c.totalClicked || 0,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      summary: { totalCampaigns, completedCampaigns, totalSent, totalOpened, totalClicked, totalBounced, openRate, clickRate, bounceRate },
      topCampaigns,
      recentCampaigns,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaign analytics' }, { status: 500 });
  }
});
