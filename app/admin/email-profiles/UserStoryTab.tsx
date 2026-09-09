import styles from './ProfilesShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'to manage sender identities, SMTP configs, and event routing in one place', so: 'different email flows (support, broadcasts, campaigns) can send from the right identity', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin', want: 'each profile checked for real send-readiness, especially whether SMTP is actually linked', so: 'I catch a profile that looks configured but silently falls back to env-var credentials', status: 'Built — Pipeline tab, writes to real email_profiles.readiness_score field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the top fix for an under-configured profile', so: 'I get a fast, grounded suggestion instead of manually checking every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for profile readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
