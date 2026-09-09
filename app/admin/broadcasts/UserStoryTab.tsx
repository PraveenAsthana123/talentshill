import styles from './BroadcastsShared.module.css';

const STORIES = [
  { role: 'Marketing/Content Editor', want: 'to create and launch bulk email broadcasts to a list or all contacts', so: 'I can reach my audience with a single send', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Content Editor', want: 'each broadcast checked for real launch-readiness before I click Launch', so: 'I catch a missing audience or sender profile before it silently sends to nobody', status: 'Built — Pipeline tab, writes to real broadcasts.readiness_score field, verified live' },
  { role: 'Content Editor', want: 'an AI agent to recommend the top pre-launch fix', so: 'I get a fast, grounded suggestion instead of guessing what to fix', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for broadcast readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
