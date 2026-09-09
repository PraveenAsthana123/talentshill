import styles from './AnalyticsShared.module.css';

const STORIES = [
  { role: 'Marketing Manager', want: 'to see real campaign open/click/bounce rates and contact-base composition in one view', so: 'I understand overall email-program performance without digging through individual campaigns', status: 'Built — Manual tab (pre-existing rollup view, unchanged logic)' },
  { role: 'Marketing Manager', want: 'a real, benchmarked health score for the whole program, tracked over time', so: 'I can see whether performance is trending up or down, not just a single point-in-time number', status: 'Built — Pipeline tab, writes a new analytics_snapshots row per run, verified live' },
  { role: 'Marketing Manager', want: 'an AI agent to recommend the single biggest lever to improve', so: 'I get a fast, grounded prioritization signal instead of eyeballing four separate metrics', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for analytics automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
