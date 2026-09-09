import styles from './ComposeShared.module.css';

const STORIES = [
  { role: 'Sales/Support rep', want: 'to send a one-off email to any recipient, from a specific sender identity when I choose one', so: 'a customer sees the right sender for the context, not always the same default identity', status: 'Fixed — the selected sender profile was previously silently dropped; now honored end-to-end, verified live' },
  { role: 'Sales/Support rep', want: 'a real pre-send readiness check on my draft', so: 'I catch a malformed recipient or an empty body before I click Send', status: 'Built — Pipeline tab, writes to the real email_compose_log table, verified live' },
  { role: 'Sales/Support rep', want: 'an AI agent to recommend the top pre-send fix', so: 'I get a fast, grounded suggestion instead of guessing what to fix', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for compose readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
