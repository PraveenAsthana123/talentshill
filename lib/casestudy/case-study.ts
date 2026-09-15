import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';

export interface CreateCaseStudyInput {
  title: string;
  clientContext: string;
  challenge: string;
  solutionText: string;
  outcome: string;
  evidenceId?: string;
  createdBy?: string;
}

export function createCaseStudy(input: CreateCaseStudyInput): string {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.caseStudy).values({
    id, title: input.title, clientContext: input.clientContext, challenge: input.challenge,
    solutionText: input.solutionText, outcome: input.outcome, evidenceId: input.evidenceId ?? null,
    status: 'draft', createdBy: input.createdBy ?? null, createdAt: now,
  }).run();
  return id;
}

// Pure: a case study can only publish with a real, non-empty evidenceId.
// Whether that ID actually resolves to a real row is checked separately
// by publishCaseStudy (a DB lookup) -- this function only enforces the
// structural rule.
export function canPublish(evidenceId: string | null | undefined): boolean {
  return !!evidenceId && evidenceId.trim().length > 0;
}

export function publishCaseStudy(id: string): { published: boolean; reason?: string } {
  const study = db.select().from(schema.caseStudy).where(eq(schema.caseStudy.id, id)).get();
  if (!study) return { published: false, reason: 'case study not found' };
  if (!canPublish(study.evidenceId)) return { published: false, reason: 'no evidenceId citation -- cannot publish without real evidence' };

  const evidence = db.select().from(schema.evidenceRecord).where(eq(schema.evidenceRecord.id, study.evidenceId as string)).get();
  if (!evidence) return { published: false, reason: 'evidenceId does not reference a real evidence_record row' };

  db.update(schema.caseStudy).set({ status: 'published', publishedAt: new Date() }).where(eq(schema.caseStudy.id, id)).run();
  return { published: true };
}

export function getCaseStudies() {
  return db.select().from(schema.caseStudy).all();
}
