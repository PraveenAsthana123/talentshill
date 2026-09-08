import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { sql, eq } from 'drizzle-orm';
import { getQueueStats } from '@/lib/db/job-queries';
import { initJobRunner } from '@/lib/jobs/init';
import { isJobRunnerRunning } from '@/lib/jobs/runner';
import { withPermission } from '@/lib/security/rbac';
import * as fs from 'fs';
import * as path from 'path';

// Auto-start job runner when health endpoint is first hit
initJobRunner();

export const GET = withPermission('health', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    // DB file size
    const dbPath = path.join(process.cwd(), 'data', 'talentshill.db');
    let dbSize = 0;
    try {
      const stats = fs.statSync(dbPath);
      dbSize = Math.round(stats.size / 1024 / 1024 * 100) / 100; // MB
    } catch { /* empty */ }

    // Table row counts
    const tables: Record<string, number> = {};
    const tableNames = [
      'users', 'blog_posts', 'contacts', 'campaigns', 'email_templates',
      'lists', 'jobs', 'runs', 'broadcasts', 'media', 'banners',
      'feature_flags', 'roles', 'email_profiles',
    ];
    for (const table of tableNames) {
      try {
        const result = db.run(sql.raw(`SELECT count(*) as count FROM ${table}`));
        tables[table] = (result as unknown as { count: number })?.count || 0;
      } catch {
        tables[table] = 0;
      }
    }

    // Job queue stats
    const queueStats = getQueueStats();

    // Recent errors (from job_logs)
    const recentErrors = db.select().from(schema.jobLogs)
      .where(eq(schema.jobLogs.level, 'error'))
      .orderBy(sql`created_at DESC`)
      .limit(10)
      .all();

    return NextResponse.json({
      status: 'healthy',
      jobRunner: isJobRunnerRunning(),
      database: { sizeMB: dbSize, tables },
      queue: queueStats,
      recentErrors: recentErrors.map(e => ({
        jobId: e.jobId,
        message: e.message,
        createdAt: e.createdAt,
      })),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Health check failed', status: 'unhealthy' }, { status: 500 });
  }
});
