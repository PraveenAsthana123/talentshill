import { randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';

const { reportShareTokens } = schema;

// Opaque 256-bit token, never a sequential ID or a guessable value.
function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function createReportShareToken(params: {
  moduleKey: string;
  reportType: string;
  entityId?: string | null;
  createdBy?: string | null;
  expiresInDays?: number;
}): { id: string; token: string } {
  const id = randomUUID();
  const token = generateToken();
  const now = new Date();
  const expiresAt = params.expiresInDays
    ? new Date(now.getTime() + params.expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  db.insert(reportShareTokens).values({
    id,
    token,
    moduleKey: params.moduleKey,
    reportType: params.reportType,
    entityId: params.entityId ?? null,
    createdBy: params.createdBy ?? null,
    expiresAt,
    revoked: false,
    createdAt: now,
  }).run();
  return { id, token };
}

export interface ResolvedShareToken {
  id: string;
  token: string;
  moduleKey: string;
  reportType: string;
  entityId: string | null;
  valid: boolean;
  reason?: string;
}

// Returns valid:false with a reason rather than throwing, so the public
// route can render a clear "link expired/revoked" page instead of a 500.
export function resolveReportShareToken(token: string): ResolvedShareToken | null {
  const row = db.select().from(reportShareTokens).where(eq(reportShareTokens.token, token)).get();
  if (!row) return null;
  if (row.revoked) return { ...row, valid: false, reason: 'This link has been revoked.' };
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ...row, valid: false, reason: 'This link has expired.' };
  }
  return { ...row, valid: true };
}

export function revokeReportShareToken(id: string) {
  db.update(reportShareTokens).set({ revoked: true }).where(eq(reportShareTokens.id, id)).run();
}

export function listReportShareTokensForModule(moduleKey: string) {
  return db.select().from(reportShareTokens).where(eq(reportShareTokens.moduleKey, moduleKey)).all();
}
