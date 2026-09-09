import styles from './RolesShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'to create custom RBAC roles and configure their permissions across every real resource in the portal', so: 'I can implement least-privilege access control precisely', status: 'Built — Manual tab, fixed a real bug where the permission grid only covered 20 of 38 real resources' },
  { role: 'Admin', want: 'each role checked for real hygiene — has permissions, and is either in use or a system role', so: 'I catch dead or unused roles before they clutter the access-control system', status: 'Built — Pipeline tab, writes to real roles.hygiene_score field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the fix for a role with a hygiene issue', so: 'I get a fast, grounded suggestion instead of manually auditing every role', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for role-hygiene automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
