import { randomUUID } from 'crypto';
import { eq, desc, and, sql, asc, lte } from 'drizzle-orm';
import { db, schema } from './index';

const { jobs, jobRuns, jobLogs } = schema;

// ── Create job ──
export function createJob(data: {
  type: string;
  payload?: Record<string, unknown>;
  priority?: number;
  maxRetries?: number;
  scheduledAt?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(jobs)
    .values({
      id,
      type: data.type,
      status: 'pending',
      payload: data.payload ? JSON.stringify(data.payload) : undefined,
      priority: data.priority ?? 0,
      maxRetries: data.maxRetries ?? 3,
      attempts: 0,
      scheduledAt: data.scheduledAt,
      createdBy: data.createdBy,
      createdAt: new Date(),
    })
    .run();
  return id;
}

// ── Get job by ID ──
export function getJob(id: string) {
  return db.select().from(jobs).where(eq(jobs.id, id)).get();
}

// ── Get jobs list (paginated, filterable) ──
export function getJobs(options: {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { type, status, limit = 50, offset = 0 } = options;

  let query = db.select().from(jobs).$dynamic();

  if (type) {
    query = query.where(eq(jobs.type, type));
  }
  if (status) {
    query = query.where(eq(jobs.status, status));
  }

  return query
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

// ── Get job count ──
export function getJobCount(options: { type?: string; status?: string } = {}) {
  let conditions = [];
  if (options.type) conditions.push(eq(jobs.type, options.type));
  if (options.status) conditions.push(eq(jobs.status, options.status));

  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(jobs)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .get();

  return result?.count ?? 0;
}

// ── Claim next pending job ──
export function claimNextJob(): typeof jobs.$inferSelect | undefined {
  const now = new Date();

  // Find next pending job that is either not scheduled or scheduled in the past
  const job = db
    .select()
    .from(jobs)
    .where(
      and(
        eq(jobs.status, 'pending'),
        sql`(${jobs.scheduledAt} IS NULL OR ${jobs.scheduledAt} <= ${Math.floor(now.getTime() / 1000)})`
      )
    )
    .orderBy(desc(jobs.priority), asc(jobs.createdAt))
    .limit(1)
    .get();

  if (!job) return undefined;

  // Atomically claim it
  db.update(jobs)
    .set({
      status: 'running',
      startedAt: now,
      attempts: (job.attempts ?? 0) + 1,
    })
    .where(and(eq(jobs.id, job.id), eq(jobs.status, 'pending')))
    .run();

  return { ...job, status: 'running', startedAt: now, attempts: (job.attempts ?? 0) + 1 };
}

// ── Update job status ──
export function updateJobStatus(
  id: string,
  status: string,
  extra?: { error?: string; completedAt?: Date }
) {
  db.update(jobs)
    .set({
      status,
      error: extra?.error,
      completedAt: extra?.completedAt,
    })
    .where(eq(jobs.id, id))
    .run();
}

// ── Pause job ──
export function pauseJob(id: string) {
  db.update(jobs)
    .set({ status: 'paused' })
    .where(and(eq(jobs.id, id), eq(jobs.status, 'running')))
    .run();
}

// ── Cancel job ──
export function cancelJob(id: string) {
  db.update(jobs)
    .set({ status: 'cancelled', completedAt: new Date() })
    .where(eq(jobs.id, id))
    .run();
}

// ── Retry job ──
export function retryJob(id: string) {
  db.update(jobs)
    .set({ status: 'pending', error: undefined, completedAt: undefined, startedAt: undefined })
    .where(eq(jobs.id, id))
    .run();
}

// ── Get job runs ──
export function getJobRuns(jobId: string) {
  return db
    .select()
    .from(jobRuns)
    .where(eq(jobRuns.jobId, jobId))
    .orderBy(desc(jobRuns.attempt))
    .all();
}

// ── Create job run ──
export function createJobRun(jobId: string, attempt: number) {
  const id = randomUUID();
  db.insert(jobRuns)
    .values({
      id,
      jobId,
      attempt,
      status: 'running',
      startedAt: new Date(),
    })
    .run();
  return id;
}

// ── Complete job run ──
export function completeJobRun(
  runId: string,
  status: 'completed' | 'failed',
  result?: Record<string, unknown>,
  error?: string
) {
  db.update(jobRuns)
    .set({
      status,
      completedAt: new Date(),
      result: result ? JSON.stringify(result) : undefined,
      error,
    })
    .where(eq(jobRuns.id, runId))
    .run();
}

// ── Add job log ──
export function addJobLog(
  jobId: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, unknown>
) {
  db.insert(jobLogs)
    .values({
      id: randomUUID(),
      jobId,
      level,
      message,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
      createdAt: new Date(),
    })
    .run();
}

// ── Get job logs ──
export function getJobLogs(jobId: string) {
  return db
    .select()
    .from(jobLogs)
    .where(eq(jobLogs.jobId, jobId))
    .orderBy(desc(jobLogs.createdAt))
    .all();
}

// ── Get jobs by type ──
export function getJobsByType(type: string) {
  return db
    .select()
    .from(jobs)
    .where(eq(jobs.type, type))
    .orderBy(desc(jobs.createdAt))
    .all();
}

// ── Get queue stats ──
export function getQueueStats() {
  const pending = getJobCount({ status: 'pending' });
  const running = getJobCount({ status: 'running' });
  const completed = getJobCount({ status: 'completed' });
  const failed = getJobCount({ status: 'failed' });
  return { pending, running, completed, failed, total: pending + running + completed + failed };
}
