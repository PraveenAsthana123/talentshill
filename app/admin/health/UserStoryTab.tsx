import styles from './HealthShared.module.css';

const STORIES = [
  { role: 'Admin/Engineer', want: 'to see real job-queue stats, DB size, and table row counts at a glance', so: 'I can spot a stalled queue or an empty table before it becomes a support ticket', status: 'Built — Manual tab (pre-existing, real db.run->db.get bug fixed in this build)' },
  { role: 'Admin/Engineer', want: 'a real, benchmarked health score for the whole system, tracked over time', so: 'I can see whether operational health is trending up or down, not just a single point-in-time snapshot', status: 'Built — Pipeline tab, writes a new health_snapshots row per run, verified live' },
  { role: 'Admin/Engineer', want: 'an AI agent to recommend the single biggest operational risk to address', so: 'I get a fast, grounded prioritization signal instead of eyeballing four separate metrics', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for health-check automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
