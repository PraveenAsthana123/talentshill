import { randomUUID } from 'crypto';
import { eq, sql, count, sum, lt } from 'drizzle-orm';
import { db, schema } from './index';

const { ragCache } = schema;

// ── Get cached result by query hash ──
export function getCachedResult(queryHash: string) {
  return db
    .select()
    .from(ragCache)
    .where(eq(ragCache.queryHash, queryHash))
    .get();
}

// ── Cache a result ──
export function cacheResult(data: {
  queryHash: string;
  query: string;
  results: string; // JSON string
  expiresAt?: Date;
}) {
  const id = randomUUID();
  db.insert(ragCache)
    .values({
      id,
      queryHash: data.queryHash,
      query: data.query,
      results: data.results,
      hitCount: 0,
      createdAt: new Date(),
      expiresAt: data.expiresAt,
    })
    .run();
  return id;
}

// ── Increment hit count ──
export function incrementHitCount(id: string) {
  db.update(ragCache)
    .set({ hitCount: sql`${ragCache.hitCount} + 1` })
    .where(eq(ragCache.id, id))
    .run();
}

// ── Prune expired cache entries ──
export function pruneExpired() {
  const now = new Date();
  const result = db
    .delete(ragCache)
    .where(
      sql`${ragCache.expiresAt} IS NOT NULL AND ${ragCache.expiresAt} < ${now}`
    )
    .run();
  return result.changes;
}

// ── Get cache stats ──
export function getCacheStats() {
  const totalResult = db
    .select({ cnt: count() })
    .from(ragCache)
    .get();

  const hitsResult = db
    .select({ total: sql<number>`COALESCE(SUM(${ragCache.hitCount}), 0)` })
    .from(ragCache)
    .get();

  return {
    totalEntries: totalResult?.cnt ?? 0,
    totalHits: hitsResult?.total ?? 0,
  };
}
