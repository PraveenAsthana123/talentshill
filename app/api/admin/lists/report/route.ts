import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('lists', 'read')(async () => {
  const all = db.select().from(schema.lists).orderBy(desc(schema.lists.updatedAt)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalLists: all.length,
    lists: all.map((l) => ({
      name: l.name, type: l.type, memberCount: l.memberCount, lastSyncedAt: l.lastSyncedAt ?? null,
    })),
  });
});
