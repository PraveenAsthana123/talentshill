import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async () => {
  const all = db.select().from(schema.ragDocuments).orderBy(desc(schema.ragDocuments.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalDocuments: all.length,
    documents: all.map((d) => ({
      name: d.name, sourceType: d.sourceType, status: d.status, chunkCount: d.chunkCount, readinessScore: d.readinessScore ?? null,
    })),
  });
});
