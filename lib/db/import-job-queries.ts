import { randomUUID } from 'crypto';
import { eq, desc, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { importJobs } = schema;

export function createImportJob(data: {
  fileName: string;
  totalRows?: number;
  columnMapping?: Record<string, string>;
  createdBy?: string;
}) {
  const id = randomUUID();
  db.insert(importJobs).values({
    id,
    fileName: data.fileName,
    totalRows: data.totalRows ?? 0,
    status: 'pending',
    columnMapping: data.columnMapping ? JSON.stringify(data.columnMapping) : null,
    createdBy: data.createdBy ?? null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function updateImportJob(id: string, data: {
  processedRows?: number;
  importedCount?: number;
  duplicateCount?: number;
  errorCount?: number;
  status?: string;
  errors?: string[];
  totalRows?: number;
}) {
  const updates: Record<string, unknown> = {};
  if (data.processedRows !== undefined) updates.processedRows = data.processedRows;
  if (data.importedCount !== undefined) updates.importedCount = data.importedCount;
  if (data.duplicateCount !== undefined) updates.duplicateCount = data.duplicateCount;
  if (data.errorCount !== undefined) updates.errorCount = data.errorCount;
  if (data.totalRows !== undefined) updates.totalRows = data.totalRows;
  if (data.status !== undefined) {
    updates.status = data.status;
    if (data.status === 'completed' || data.status === 'failed') {
      updates.completedAt = new Date();
    }
  }
  if (data.errors !== undefined) updates.errors = JSON.stringify(data.errors);

  db.update(importJobs).set(updates).where(eq(importJobs.id, id)).run();
}

export function getImportJob(id: string) {
  return db.select().from(importJobs).where(eq(importJobs.id, id)).get();
}

export function getAllImportJobs(options: {
  limit?: number;
  offset?: number;
} = {}) {
  const { limit = 50, offset = 0 } = options;
  return db.select().from(importJobs)
    .orderBy(desc(importJobs.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getImportJobCount() {
  const result = db.select({ count: sql<number>`count(*)` })
    .from(importJobs).get();
  return result?.count ?? 0;
}
