export type ResearchDepth = 'none' | 'light' | 'deep';

// Pure, deterministic rule lookup -- gates whether a real costed Ollama
// call is worth spending on this lead before the agent makes it. A cold
// lead skips the PLAN call entirely (see lead-qualification-agent.ts).
export function computeResearchDepth(tier: 'hot' | 'warm' | 'cool' | 'cold', budgetRange: string | null | undefined): ResearchDepth {
  if (tier === 'hot') return 'deep';
  if (tier === 'warm') return budgetRange ? 'deep' : 'light';
  if (tier === 'cool') return 'light';
  return 'none';
}
