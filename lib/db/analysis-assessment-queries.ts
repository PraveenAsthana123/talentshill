import { randomUUID } from 'crypto';
import { eq, count, desc, and } from 'drizzle-orm';
import { db, schema } from './index';

const { analysisAssessments } = schema;

export function createAssessment(data: {
  frameworkId: string;
  projectName: string;
  assessorId?: string;
  totalItems: number;
}) {
  const id = randomUUID();
  const now = new Date();
  const itemScores: unknown[] = [];
  db.insert(analysisAssessments)
    .values({
      id,
      frameworkId: data.frameworkId,
      projectName: data.projectName,
      assessorId: data.assessorId,
      status: 'not_started',
      totalItems: data.totalItems,
      completedItems: 0,
      itemScores: JSON.stringify(itemScores),
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function getAssessmentById(id: string) {
  return db.select().from(analysisAssessments).where(eq(analysisAssessments.id, id)).get();
}

export function getAssessmentsByFramework(frameworkId: string) {
  return db
    .select()
    .from(analysisAssessments)
    .where(eq(analysisAssessments.frameworkId, frameworkId))
    .orderBy(desc(analysisAssessments.updatedAt))
    .all();
}

export function getAssessmentsByProject(projectName: string) {
  return db
    .select()
    .from(analysisAssessments)
    .where(eq(analysisAssessments.projectName, projectName))
    .orderBy(desc(analysisAssessments.updatedAt))
    .all();
}

export function getAssessments(
  offset = 0,
  limit = 50,
  filters?: { frameworkId?: string; projectName?: string; status?: string }
) {
  const conditions = [];
  if (filters?.frameworkId) conditions.push(eq(analysisAssessments.frameworkId, filters.frameworkId));
  if (filters?.projectName) conditions.push(eq(analysisAssessments.projectName, filters.projectName));
  if (filters?.status) conditions.push(eq(analysisAssessments.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(analysisAssessments)
    .where(where)
    .orderBy(desc(analysisAssessments.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getAssessmentCount(filters?: { frameworkId?: string; status?: string }) {
  const conditions = [];
  if (filters?.frameworkId) conditions.push(eq(analysisAssessments.frameworkId, filters.frameworkId));
  if (filters?.status) conditions.push(eq(analysisAssessments.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = db.select({ cnt: count() }).from(analysisAssessments).where(where).get();
  return result?.cnt ?? 0;
}

export function updateItemScores(
  id: string,
  itemScores: unknown[],
  completedItems: number,
  overallScore: number | null
) {
  const status = completedItems === 0 ? 'not_started' : 'in_progress';
  db.update(analysisAssessments)
    .set({
      itemScores: JSON.stringify(itemScores),
      completedItems,
      overallScore,
      status,
      updatedAt: new Date(),
    })
    .where(eq(analysisAssessments.id, id))
    .run();
}

export function completeAssessment(id: string, overallScore: number) {
  db.update(analysisAssessments)
    .set({
      status: 'completed',
      overallScore,
      updatedAt: new Date(),
    })
    .where(eq(analysisAssessments.id, id))
    .run();
}

export function deleteAssessment(id: string) {
  db.delete(analysisAssessments).where(eq(analysisAssessments.id, id)).run();
}
