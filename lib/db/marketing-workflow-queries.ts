import { randomUUID } from 'crypto';
import { eq, count, desc, and } from 'drizzle-orm';
import { db, schema } from './index';

const { marketingWorkflows, workflowComments } = schema;

export function createWorkflow(data: {
  name: string;
  contentId?: string;
  assetId?: string;
  listId?: string;
  campaignId?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(marketingWorkflows)
    .values({
      id,
      name: data.name,
      status: 'draft',
      currentStep: 0,
      contentId: data.contentId,
      assetId: data.assetId,
      listId: data.listId,
      campaignId: data.campaignId,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function getWorkflowById(id: string) {
  return db.select().from(marketingWorkflows).where(eq(marketingWorkflows.id, id)).get();
}

export function getWorkflows(
  offset = 0,
  limit = 50,
  filters?: { status?: string }
) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(marketingWorkflows.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(marketingWorkflows)
    .where(where)
    .orderBy(desc(marketingWorkflows.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getWorkflowCount(filters?: { status?: string }) {
  const conditions = [];
  if (filters?.status) conditions.push(eq(marketingWorkflows.status, filters.status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const result = db.select({ cnt: count() }).from(marketingWorkflows).where(where).get();
  return result?.cnt ?? 0;
}

export function updateWorkflowStep(id: string, step: number, data?: Partial<{
  contentId: string;
  assetId: string;
  shareLinkIds: string[];
  listId: string;
  campaignId: string;
  metadata: Record<string, unknown>;
}>) {
  const updates: Record<string, unknown> = {
    currentStep: step,
    updatedAt: new Date(),
  };
  if (data?.contentId !== undefined) updates.contentId = data.contentId;
  if (data?.assetId !== undefined) updates.assetId = data.assetId;
  if (data?.shareLinkIds !== undefined) updates.shareLinkIds = JSON.stringify(data.shareLinkIds);
  if (data?.listId !== undefined) updates.listId = data.listId;
  if (data?.campaignId !== undefined) updates.campaignId = data.campaignId;
  if (data?.metadata !== undefined) updates.metadata = JSON.stringify(data.metadata);
  db.update(marketingWorkflows).set(updates).where(eq(marketingWorkflows.id, id)).run();
}

export function updateWorkflowStatus(id: string, status: string) {
  const updates: Record<string, unknown> = { status, updatedAt: new Date() };
  if (status === 'completed') updates.completedAt = new Date();
  db.update(marketingWorkflows).set(updates).where(eq(marketingWorkflows.id, id)).run();
}

export function approveWorkflow(id: string, approvedBy: string) {
  db.update(marketingWorkflows)
    .set({
      status: 'approved',
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(marketingWorkflows.id, id))
    .run();
}

export function deleteWorkflow(id: string) {
  db.delete(marketingWorkflows).where(eq(marketingWorkflows.id, id)).run();
}

// ── Workflow Comments ──

export function addComment(data: {
  workflowId: string;
  userId?: string;
  content: string;
  stepIndex?: number;
}) {
  const id = randomUUID();
  db.insert(workflowComments)
    .values({
      id,
      workflowId: data.workflowId,
      userId: data.userId,
      content: data.content,
      stepIndex: data.stepIndex,
      createdAt: new Date(),
    })
    .run();
  return id;
}

export function getComments(workflowId: string) {
  return db
    .select()
    .from(workflowComments)
    .where(eq(workflowComments.workflowId, workflowId))
    .orderBy(desc(workflowComments.createdAt))
    .all();
}
