import styles from './FeaturesShared.module.css';

const STORIES = [
  { role: 'Admin/Engineer', want: 'to toggle features on/off with version history and rollback', so: 'I can safely control rollout without a code deploy', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin/Engineer', want: 'each flag checked for real governance completeness', so: 'I catch an undocumented, unowned, or never-versioned flag before it becomes untraceable tech debt', status: 'Built — Pipeline tab, writes to real feature_flags.readiness_score field, verified live' },
  { role: 'Admin/Engineer', want: 'an AI agent to recommend the top governance fix', so: 'I get a fast, grounded suggestion instead of manually auditing every flag', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for flag readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
