import styles from './AnalysisShared.module.css';

const STORIES = [
  { role: 'AI Governance Analyst', want: 'to evaluate a project against a real analysis framework with per-item scoring', so: 'I can produce a structured, comparable assessment rather than an ad-hoc review', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'AI Governance Analyst', want: 'each assessment checked for real completeness and recency', so: 'I catch a stale or abandoned assessment before it silently rots unreviewed', status: 'Built — Pipeline tab, writes to real analysis_assessments.health_score field, verified live' },
  { role: 'AI Governance Analyst', want: 'an AI agent to recommend whether an assessment needs attention', so: 'I get a fast, grounded prioritization signal instead of scanning every project manually', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for analysis automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
