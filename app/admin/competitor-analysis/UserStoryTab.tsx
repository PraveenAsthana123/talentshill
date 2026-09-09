import styles from './AdminCompetitorAnalysis.module.css';

// Real user stories for this module, kept in sync with what's actually
// built (Manual/Pipeline/Agentic all real as of this tab's creation).
// Per the Operational Portal standard: this tab must reflect what the
// module actually does, not aspirational scope.
const STORIES = [
  {
    role: 'Admin / market researcher',
    want: 'to manually record a competitor\'s offering, pricing, and strengths/weaknesses against one of our services',
    so: 'the team has a real, evidence-based comparison to reference in sales and positioning',
    status: 'Built — Manual tab',
  },
  {
    role: 'Admin',
    want: 'to auto-populate a draft competitor entry from the competitor\'s own public website (title/description) without typing it by hand',
    so: 'starting research on a new competitor is faster, while still leaving qualitative judgment (pricing, strengths/weaknesses) to a human',
    status: 'Built — Pipeline tab',
  },
  {
    role: 'Admin',
    want: 'an AI agent to draft a research plan and an initial offering-summary/analysis for a competitor, clearly marked as needing my review',
    so: 'I get a useful starting point without the agent silently presenting unverified guesses as fact',
    status: 'Built — Agentic tab (local Ollama model, honest "insufficient data" behavior verified live)',
  },
  {
    role: 'Admin',
    want: 'to see, at a glance, which of our services have zero competitor research and how much AI/automation activity has run',
    so: 'I know where the real gaps are without manually cross-checking every service',
    status: 'Built — Dashboard tab',
  },
  {
    role: 'Admin / stakeholder',
    want: 'a compiled report of all competitor research grouped by service',
    so: 'I can review or share findings without digging through the raw entry list',
    status: 'Built — Report tab',
  },
  {
    role: 'Admin',
    want: 'to see real-time status of every manual/pipeline/agentic run, including token usage for AI runs',
    so: 'I can tell whether automation is actually working and what it\'s costing (in tokens), not just assume it is',
    status: 'Built — Monitoring tab',
  },
];

export default function UserStoryTab() {
  return (
    <div className={styles.subSection}>
      <h4>User stories (kept current — reflects what&apos;s actually built)</h4>
      {STORIES.map((s, i) => (
        <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
          <p><strong>As a</strong> {s.role}, <strong>I want</strong> {s.want}, <strong>so that</strong> {s.so}.</p>
          <p className={styles.empty}>{s.status}</p>
        </div>
      ))}
    </div>
  );
}
