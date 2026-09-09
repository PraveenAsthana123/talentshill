import styles from './MaintenanceShared.module.css';

const STORIES = [
  { role: 'Admin/Engineer', want: 'to take the public site down for real maintenance with a clear message to visitors', so: 'I can safely perform a migration or deploy without visitors hitting a half-updated site', status: 'Fixed — the toggle previously had zero real effect; now a real 503 page is served, verified live' },
  { role: 'Admin/Engineer', want: 'a scheduled maintenance window to actually end on its own', so: 'I don\'t have to remember to manually flip the switch back off', status: 'Fixed — scheduledEnd was stored but never checked; now auto-expires for real' },
  { role: 'Admin/Engineer', want: 'a real, live self-test confirming enforcement is actually working right now', so: 'I can trust the toggle instead of hoping it works', status: 'Built — Pipeline tab makes a real HTTP request to the live homepage and reports the real observed status code, verified live' },
  { role: 'Admin/Engineer', want: 'an AI agent to flag if enforcement ever drifts from expected', so: 'I get an early warning instead of discovering it during a real incident', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
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
