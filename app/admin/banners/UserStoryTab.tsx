import styles from './BannersShared.module.css';

const STORIES = [
  { role: 'Marketing/Operator', want: 'to create, schedule, enable/disable, and delete site-wide banners', so: 'I can run time-boxed promotions and notices without a code deploy', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Operator', want: 'each banner checked for real integrity issues — a schedule conflict, a banner still marked active after its own end date, a half-set CTA', so: 'I catch live site bugs before a customer does', status: 'Built — Pipeline tab, writes to real banners.health_score field, verified live' },
  { role: 'Operator', want: 'an AI agent to recommend the specific fix for a banner with a health issue', so: 'I get a fast, grounded suggestion instead of manually diffing every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for banner-check automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
