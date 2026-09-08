import { randomUUID } from 'crypto';
import { eq, desc, and, like, sql, count } from 'drizzle-orm';
import { db, schema } from './index';

const { contactSubmissions } = schema;

// ── Types ──

type ContactStatus = 'new' | 'contacted' | 'qualified' | 'closed';
type LeadTier = 'hot' | 'warm' | 'cool' | 'cold';

export interface ContactSubmissionRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string;
  role: string | null;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange: string | null;
  timeline: string;
  message: string;
  consent: boolean;
  leadScore: number | null;
  leadTier: string | null;
  status: string;
  ipHash: string | null;
  userAgent: string | null;
  sourcePage: string | null;
  createdAt: Date;
}

export interface ContactStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  closed: number;
  hotLeads: number;
  warmLeads: number;
  byIndustry: { industry: string; count: number }[];
}

// ── Helper to parse interestAreas JSON ──

function parseSubmission(row: typeof contactSubmissions.$inferSelect): ContactSubmissionRow {
  let interestAreas: string[] = [];
  try {
    interestAreas = JSON.parse(row.interestAreas);
  } catch {
    interestAreas = [];
  }
  return {
    ...row,
    interestAreas,
  };
}

// ── Create ──

export function createSubmission(data: {
  fullName: string;
  email: string;
  phone?: string;
  company: string;
  role?: string;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange?: string;
  timeline: string;
  message: string;
  consent: boolean;
  leadScore?: number;
  leadTier?: LeadTier;
  status?: ContactStatus;
  ipHash?: string;
  userAgent?: string;
  sourcePage?: string;
}): ContactSubmissionRow {
  const id = randomUUID();
  const now = new Date();

  const row = db.insert(contactSubmissions).values({
    id,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone || null,
    company: data.company,
    role: data.role || null,
    industry: data.industry,
    interestAreas: JSON.stringify(data.interestAreas),
    projectStage: data.projectStage,
    budgetRange: data.budgetRange || null,
    timeline: data.timeline,
    message: data.message,
    consent: data.consent,
    leadScore: data.leadScore ?? 0,
    leadTier: data.leadTier || 'cold',
    status: data.status || 'new',
    ipHash: data.ipHash || null,
    userAgent: data.userAgent || null,
    sourcePage: data.sourcePage || null,
    createdAt: now,
  }).returning().get();

  return parseSubmission(row);
}

// ── Read by ID ──

export function getSubmissionById(id: string): ContactSubmissionRow | null {
  const row = db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).get();
  if (!row) return null;
  return parseSubmission(row);
}

// ── Paginated List with Filters ──

export function getAllSubmissions(options: {
  offset?: number;
  limit?: number;
  status?: ContactStatus | 'all';
  industry?: string;
  search?: string;
  leadTier?: LeadTier | 'all';
} = {}): { submissions: ContactSubmissionRow[]; total: number } {
  const { offset = 0, limit = 20, status, industry, search, leadTier } = options;

  const conditions = [];
  if (status && status !== 'all') {
    conditions.push(eq(contactSubmissions.status, status as ContactStatus));
  }
  if (industry) {
    conditions.push(eq(contactSubmissions.industry, industry));
  }
  if (leadTier && leadTier !== 'all') {
    conditions.push(eq(contactSubmissions.leadTier, leadTier as LeadTier));
  }
  if (search) {
    conditions.push(
      sql`(${contactSubmissions.fullName} LIKE ${'%' + search + '%'} OR ${contactSubmissions.email} LIKE ${'%' + search + '%'} OR ${contactSubmissions.company} LIKE ${'%' + search + '%'})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db.select({ cnt: count() }).from(contactSubmissions).where(where).get();
  const total = totalResult?.cnt || 0;

  const rows = db.select().from(contactSubmissions)
    .where(where)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const submissions = rows.map(parseSubmission);
  return { submissions, total };
}

// ── Update Status ──

export function updateSubmissionStatus(
  id: string,
  status: ContactStatus,
  userId?: string
): ContactSubmissionRow | null {
  const existing = db.select().from(contactSubmissions).where(eq(contactSubmissions.id, id)).get();
  if (!existing) return null;

  const row = db.update(contactSubmissions)
    .set({ status })
    .where(eq(contactSubmissions.id, id))
    .returning()
    .get();

  return parseSubmission(row);
}

// ── Stats ──

export function getContactStats(): ContactStats {
  const total = db.select({ cnt: count() }).from(contactSubmissions).get()?.cnt || 0;
  const newCount = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new')).get()?.cnt || 0;
  const contacted = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'contacted')).get()?.cnt || 0;
  const qualified = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'qualified')).get()?.cnt || 0;
  const closed = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'closed')).get()?.cnt || 0;
  const hotLeads = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.leadTier, 'hot')).get()?.cnt || 0;
  const warmLeads = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.leadTier, 'warm')).get()?.cnt || 0;

  const industryRows = db
    .select({ industry: contactSubmissions.industry, cnt: count() })
    .from(contactSubmissions)
    .groupBy(contactSubmissions.industry)
    .orderBy(desc(count()))
    .all();

  const byIndustry = industryRows.map((r) => ({
    industry: r.industry,
    count: r.cnt,
  }));

  return {
    total,
    new: newCount,
    contacted,
    qualified,
    closed,
    hotLeads,
    warmLeads,
    byIndustry,
  };
}

// ── Export (no pagination) ──

export function getAllSubmissionsForExport(filters?: {
  status?: ContactStatus | 'all';
  industry?: string;
  leadTier?: LeadTier | 'all';
}): ContactSubmissionRow[] {
  const conditions = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(contactSubmissions.status, filters.status as ContactStatus));
  }
  if (filters?.industry) {
    conditions.push(eq(contactSubmissions.industry, filters.industry));
  }
  if (filters?.leadTier && filters.leadTier !== 'all') {
    conditions.push(eq(contactSubmissions.leadTier, filters.leadTier as LeadTier));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = db.select().from(contactSubmissions)
    .where(where)
    .orderBy(desc(contactSubmissions.createdAt))
    .all();

  return rows.map(parseSubmission);
}
