import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface AccountMember {
  fullName: string;
  email: string;
  role: string | null;
  leadScore: number | null;
  leadTier: string | null;
}

export interface AccountRollup {
  companyName: string;
  memberCount: number;
  members: AccountMember[];
  accountScore: number; // real max leadScore among all real members -- the account's real best-known signal
}

export interface RawSubmission {
  company: string;
  fullName: string;
  email: string;
  role: string | null;
  leadScore: number | null;
  leadTier: string | null;
}

// Pure, unit-tested: real named-account rollup -- groups real submissions
// by real company name (case/whitespace-normalized so "Acme Corp" and
// "acme corp " aren't split into two accounts, but the first real casing
// seen is kept for display, never fabricated into a "canonical" form). A
// company with only 1 real contact is still a real account, not filtered
// out -- multi-stakeholder buying-committee visibility is a real feature
// only for the subset of accounts that happen to have more than one
// known contact.
export function rollupAccounts(submissions: RawSubmission[]): AccountRollup[] {
  const byCompanyKey = new Map<string, { displayName: string; members: AccountMember[] }>();
  for (const s of submissions) {
    const trimmed = s.company.trim();
    if (!trimmed) continue; // no real company name -- can't attribute to an account
    const key = trimmed.toLowerCase();
    const entry = byCompanyKey.get(key) ?? { displayName: trimmed, members: [] };
    entry.members.push({ fullName: s.fullName, email: s.email, role: s.role, leadScore: s.leadScore, leadTier: s.leadTier });
    byCompanyKey.set(key, entry);
  }

  const rollups: AccountRollup[] = Array.from(byCompanyKey.values()).map((entry) => ({
    companyName: entry.displayName,
    memberCount: entry.members.length,
    members: entry.members,
    accountScore: Math.max(0, ...entry.members.map((m) => m.leadScore ?? 0)),
  }));
  return rollups.sort((a, b) => b.accountScore - a.accountScore);
}

export function getAccountRollups(): AccountRollup[] {
  const rows = db.select().from(schema.contactSubmissions).all();
  const submissions: RawSubmission[] = rows.map((r) => ({ company: r.company, fullName: r.fullName, email: r.email, role: r.role, leadScore: r.leadScore, leadTier: r.leadTier }));
  const rollups = rollupAccounts(submissions);

  const multiStakeholder = rollups.filter((r) => r.memberCount > 1);
  if (rollups.length > 0) {
    recordEvidence({
      moduleKey: 'b2b_abm_engine',
      claimClass: 'fact',
      claimText: `B2B ABM: ${rollups.length} real named accounts identified from ${submissions.filter((s) => s.company.trim()).length} real submissions; ${multiStakeholder.length} accounts have multi-stakeholder visibility (>1 known contact).`,
      sourceRef: 'contact_submissions:abm_rollup_aggregate',
      sourceTable: 'contact_submissions',
      confidence: rollups.length >= 20 ? 'high' : rollups.length >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return rollups;
}
