import styles from './ListsShared.module.css';

const STORIES = [
  { role: 'Marketing Manager', want: 'to create static and dynamic (segment-rule-based) contact lists', so: 'I can target campaigns at the right audience without manually maintaining every list', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Marketing Manager', want: 'a dynamic list\'s segment rules to actually populate real membership, not just a UI preview', so: 'a broadcast I send to that list reaches the real matching contacts instead of nobody', status: 'Fixed — Pipeline tab performs a real sync (evaluate -> diff -> materialize), closing a real gap in lib/jobs/handlers/broadcast-sender.ts, verified live' },
  { role: 'Marketing Manager', want: 'an AI agent to flag a list that looks unhealthy (e.g. zero matches)', so: 'I catch a bad segment-rule definition before a campaign goes out to nobody', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for list-sync automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
