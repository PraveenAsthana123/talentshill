import styles from './UsersShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'to create admin user accounts and assign RBAC roles', so: 'I can control who has access to what', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin', want: 'each account checked for a real security misconfiguration — no roles assigned, or roles that resolve to zero permissions', so: 'I catch dead-end or dangerous accounts before they cause a support ticket', status: 'Built — Pipeline tab, writes to real users.security_score field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the fix for an account with a security issue', so: 'I get a fast, grounded suggestion instead of manually auditing every role', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for account-check automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
