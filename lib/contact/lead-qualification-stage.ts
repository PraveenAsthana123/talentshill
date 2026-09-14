export type QualificationStage = 'unqualified' | 'mql' | 'sql' | 'opportunity' | 'customer';

export const QUALIFICATION_STAGE_ORDER: QualificationStage[] = ['unqualified', 'mql', 'sql', 'opportunity', 'customer'];

// Deterministic starting stage from the real computed tier. This is a
// default, not a locked-in verdict -- an admin can manually promote or
// demote a lead (e.g. mql -> sql after a real qualifying call) via the
// PATCH endpoint. Cold/cool leads start unqualified; warm leads start as
// Marketing Qualified (meets minimum real-data criteria for follow-up);
// hot leads start as Sales Qualified (ready for direct sales engagement).
// This mapping is a starting point, matching common B2B convention, not
// a claim that a human never needs to review it.
export function classifyQualificationStage(tier: 'hot' | 'warm' | 'cool' | 'cold'): QualificationStage {
  if (tier === 'hot') return 'sql';
  if (tier === 'warm') return 'mql';
  return 'unqualified';
}

export function isValidStageTransition(from: QualificationStage, to: QualificationStage): boolean {
  return QUALIFICATION_STAGE_ORDER.includes(from) && QUALIFICATION_STAGE_ORDER.includes(to);
}

// Deterministic re-scoring must never silently undo a human's manual
// promotion. Bug caught live 2026-09-14: an admin promoted a lead to
// 'opportunity', then a routine pipeline re-run (e.g. after an admin
// edits the lead's project stage) unconditionally overwrote it back to
// 'sql' from the tier-based default. This picks whichever stage is
// further along the funnel, so a re-score can only ever advance or hold
// a manually-set stage, never regress it.
export function resolveQualificationStageOnRescore(currentStage: QualificationStage, autoClassified: QualificationStage): QualificationStage {
  const currentIdx = QUALIFICATION_STAGE_ORDER.indexOf(currentStage);
  const autoIdx = QUALIFICATION_STAGE_ORDER.indexOf(autoClassified);
  return autoIdx > currentIdx ? autoClassified : currentStage;
}
