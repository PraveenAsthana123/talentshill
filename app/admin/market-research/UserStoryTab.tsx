import styles from './MarketResearchShared.module.css';

const STORIES = [
  { role: 'Marketing/Research Analyst', want: 'to log real research briefs distinct from Competitor Analysis', so: 'I have a general topic-research system of record grounded in my own source notes', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Research Analyst', want: 'a brief checked for real readiness before publishing', so: 'I catch a brief with no real source notes or findings before calling it done', status: 'Built — Pipeline tab, writes to real market_research_briefs.readiness_score' },
  { role: 'Marketing/Research Analyst', want: 'an AI agent to draft a findings summary from my own source notes', so: 'I get a fast first-pass synthesis, strictly grounded in what I actually provided, never fabricated statistics', status: 'Built — Agentic tab, real synthesis agent, local Ollama, advisory only (not auto-saved)' },
  { role: 'Admin', want: 'to see real-time run/token stats for research automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
];

export default function UserStoryTab() {
  return (
    <div className={styles.subSection}>
      <h4>User stories</h4>
      {STORIES.map((s, i) => (
        <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
          <p><strong>As a</strong> {s.role}, <strong>I want</strong> {s.want}, <strong>so that</strong> {s.so}.</p>
          <p className={styles.empty}>{s.status}</p>
        </div>
      ))}
    </div>
  );
}
