import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getDocumentStats } from '@/lib/db/rag-document-queries';
import { getAllEmbeddings } from '@/lib/db/rag-embedding-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async () => {
  const documentStats = getDocumentStats();
  const allDocs = db.select().from(schema.ragDocuments).all();
  const totalEmbeddings = getAllEmbeddings().length;
  const totalChunks = db.select().from(schema.ragChunks).all().length;
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'rag')).all();
  const scored = allDocs.filter((d) => d.readinessScore !== null && d.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalDocuments: allDocs.length,
      totalChunks,
      totalEmbeddings,
      unscored: allDocs.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, d) => s + (d.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byStatus: documentStats.byStatus,
    embeddingProvider: 'nomic-embed-text:latest (real local Ollama, 768-dim) -- previously DummyEmbeddingProvider (random 384-dim vectors)',
  });
});
