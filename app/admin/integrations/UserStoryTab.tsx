import styles from './IntegrationsShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'to browse available integration providers and connect real accounts', so: 'I can wire up third-party services without engineering involvement', status: 'Built — Manual tab (pre-existing, now with a real credential-exposure fix and transactional history)' },
  { role: 'Admin', want: 'each account checked for real connection-readiness, not just a status label', so: 'I catch an account marked "connected" that has never actually been tested', status: 'Built — Pipeline tab, writes to real integration_accounts.readiness_score field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the top fix for an under-configured account', so: 'I get a fast, grounded suggestion instead of manually checking every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for integration readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
