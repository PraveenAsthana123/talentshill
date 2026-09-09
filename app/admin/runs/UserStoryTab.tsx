import styles from './RunsShared.module.css';

const STORIES = [
  { role: 'Admin/Ops', want: 'a single cross-module console of every real business-operation run with an event timeline', so: 'I can see what\'s currently running or recently failed without checking each module separately', status: 'Built — Manual tab (pre-existing filter/timeline UI), now with the real broadcast-sender integration actually populating it' },
  { role: 'Admin/Ops', want: 'to manually force a stuck run to a correct status', so: 'I can recover from a crashed job without editing the database directly', status: 'Built — Manual tab Force Status control, wired to the pre-existing but previously orphaned PATCH endpoint, logs a real run_event and transactional history' },
  { role: 'Admin/Ops', want: 'a run checked for real health (staleness, missing timestamps, invalid config)', so: 'I catch a stuck or inconsistent run before it silently sits broken', status: 'Built — Pipeline tab, writes to real runs.health_score field, verified live' },
  { role: 'Admin/Ops', want: 'an AI agent to recommend the top health fix for a run', so: 'I get a fast, grounded suggestion instead of manually inspecting the timeline', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for run monitoring automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
