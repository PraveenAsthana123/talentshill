import { randomUUID } from 'crypto';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import { db, schema } from './index';

const { ragRuns, ragRunSteps, ragRunMetrics, ragConfigs } = schema;

// ── Create run ──
export function createRun(data: {
  type: string;
  config?: Record<string, unknown>;
  documentIds?: string[];
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(ragRuns)
    .values({
      id,
      type: data.type,
      status: 'pending',
      config: data.config ? JSON.stringify(data.config) : undefined,
      documentIds: data.documentIds ? JSON.stringify(data.documentIds) : undefined,
      createdBy: data.createdBy,
      createdAt: new Date(),
    })
    .run();
  return id;
}

// ── Update run status ──
export function updateRunStatus(
  id: string,
  status: string,
  error?: string
) {
  const updates: Record<string, unknown> = { status };

  if (status === 'running') {
    updates.startedAt = new Date();
  }
  if (status === 'completed' || status === 'failed') {
    updates.completedAt = new Date();
  }
  if (error !== undefined) {
    updates.error = error;
  }

  db.update(ragRuns)
    .set(updates)
    .where(eq(ragRuns.id, id))
    .run();
}

// ── Add run step ──
export function addRunStep(data: {
  runId: string;
  stepName: string;
  status: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  durationMs?: number;
}) {
  const id = randomUUID();
  db.insert(ragRunSteps)
    .values({
      id,
      runId: data.runId,
      stepName: data.stepName,
      status: data.status,
      input: data.input ? JSON.stringify(data.input) : undefined,
      output: data.output ? JSON.stringify(data.output) : undefined,
      durationMs: data.durationMs,
      createdAt: new Date(),
    })
    .run();
  return id;
}

// ── Update run step ──
export function updateRunStep(
  id: string,
  status: string,
  output?: Record<string, unknown>,
  durationMs?: number
) {
  const updates: Record<string, unknown> = { status };
  if (output !== undefined) {
    updates.output = JSON.stringify(output);
  }
  if (durationMs !== undefined) {
    updates.durationMs = durationMs;
  }

  db.update(ragRunSteps)
    .set(updates)
    .where(eq(ragRunSteps.id, id))
    .run();
}

// ── Add run metric ──
export function addRunMetric(data: {
  runId: string;
  metricName: string;
  value: number;
  details?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(ragRunMetrics)
    .values({
      id,
      runId: data.runId,
      metricName: data.metricName,
      value: data.value,
      details: data.details ? JSON.stringify(data.details) : undefined,
      createdAt: new Date(),
    })
    .run();
  return id;
}

// ── Get run by ID (with steps and metrics) ──
export function getRunById(id: string) {
  const run = db.select().from(ragRuns).where(eq(ragRuns.id, id)).get();
  if (!run) return undefined;

  const steps = db
    .select()
    .from(ragRunSteps)
    .where(eq(ragRunSteps.runId, id))
    .orderBy(ragRunSteps.createdAt)
    .all();

  const metrics = db
    .select()
    .from(ragRunMetrics)
    .where(eq(ragRunMetrics.runId, id))
    .orderBy(ragRunMetrics.createdAt)
    .all();

  return { ...run, steps, metrics };
}

// ── Get all runs (filtered, paginated) ──
export function getAllRuns(options: {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { type, status, limit = 50, offset = 0 } = options;

  const conditions = [];
  if (type) conditions.push(eq(ragRuns.type, type));
  if (status) conditions.push(eq(ragRuns.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db
    .select({ cnt: count() })
    .from(ragRuns)
    .where(where)
    .get();
  const total = totalResult?.cnt ?? 0;

  const items = db
    .select()
    .from(ragRuns)
    .where(where)
    .orderBy(desc(ragRuns.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  return { items, total };
}

// ── Get active RAG config ──
export function getActiveConfig() {
  return db
    .select()
    .from(ragConfigs)
    .where(eq(ragConfigs.isActive, true))
    .get();
}

// ── Create RAG config version ──
export function createConfig(data: {
  name: string;
  config: Record<string, unknown>;
  changedBy?: string;
}) {
  // Determine next version number
  const latest = db
    .select({ version: ragConfigs.version })
    .from(ragConfigs)
    .orderBy(desc(ragConfigs.version))
    .limit(1)
    .get();

  const nextVersion = (latest?.version ?? 0) + 1;
  const id = randomUUID();

  db.insert(ragConfigs)
    .values({
      id,
      name: data.name,
      version: nextVersion,
      config: JSON.stringify(data.config),
      isActive: false,
      changedBy: data.changedBy,
      createdAt: new Date(),
    })
    .run();

  return id;
}

// ── Activate a RAG config ──
export function activateConfig(id: string) {
  // Deactivate all configs
  db.update(ragConfigs)
    .set({ isActive: false })
    .run();

  // Activate the specified config
  db.update(ragConfigs)
    .set({ isActive: true })
    .where(eq(ragConfigs.id, id))
    .run();
}

// ── Get config history ──
export function getConfigHistory() {
  return db
    .select()
    .from(ragConfigs)
    .orderBy(desc(ragConfigs.version))
    .all();
}
