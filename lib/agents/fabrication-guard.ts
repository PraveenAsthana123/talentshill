// Shared deterministic backstop for open-ended content-generation agents.
// Live-verified 2026-09-14 (AI Content Factory use case) that the local
// model (phi4-mini) does not reliably follow "don't invent statistics"
// instructions on open-ended generation -- it fabricated percentages and
// a fake customer case study despite explicit prompting. Prompting alone
// is not a sufficient safeguard for this model size on this task class;
// every generation agent that produces free-text creative copy (not just
// narrating already-computed real numbers) must run its output through
// this check and surface the result to the human reviewer.
export function containsSuspiciousStatistics(text: string): boolean {
  return /\d+(\.\d+)?\s*%/.test(text) || /\$\s?\d/.test(text);
}
