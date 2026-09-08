import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { sql, eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

const { contacts } = schema;

export const GET = withPermission('analytics', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const totalContacts = db.select({ count: sql<number>`count(*)` }).from(contacts).get()?.count || 0;

    const activeContacts = db.select({ count: sql<number>`count(*)` }).from(contacts)
      .where(eq(contacts.status, 'active')).get()?.count || 0;

    const unsubscribed = db.select({ count: sql<number>`count(*)` }).from(contacts)
      .where(eq(contacts.status, 'unsubscribed')).get()?.count || 0;

    const bounced = db.select({ count: sql<number>`count(*)` }).from(contacts)
      .where(eq(contacts.status, 'bounced')).get()?.count || 0;

    // Source distribution
    const sourceDistribution = db.select({
      source: contacts.source,
      count: sql<number>`count(*)`,
    }).from(contacts).groupBy(contacts.source).all();

    // Lead score distribution (buckets)
    const scoreDistribution = db.select({
      bucket: sql<string>`CASE
        WHEN ${contacts.leadScore} >= 80 THEN 'Hot (80+)'
        WHEN ${contacts.leadScore} >= 50 THEN 'Warm (50-79)'
        WHEN ${contacts.leadScore} >= 20 THEN 'Cool (20-49)'
        ELSE 'Cold (0-19)'
      END`,
      count: sql<number>`count(*)`,
    }).from(contacts).groupBy(sql`1`).all();

    return NextResponse.json({
      summary: { totalContacts, activeContacts, unsubscribed, bounced },
      sourceDistribution,
      scoreDistribution,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch contact analytics' }, { status: 500 });
  }
});
