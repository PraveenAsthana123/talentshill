import styles from './WorkflowShared.module.css';

const STORIES = [
  { role: 'Marketing/Content Editor', want: 'an 8-step wizard to orchestrate content, targeting, and a campaign into one launch', so: 'I don\'t have to manually coordinate 4 separate modules for every campaign', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Marketing/Content Editor', want: 'a workflow checked for real consistency before I trust its status', so: 'I catch a workflow marked "approved" that skipped the real review, or "completed" with no real audience targeted', status: 'Built — Pipeline tab, writes to real marketing_workflows.readiness_score field, verified live' },
  { role: 'Marketing/Content Editor', want: 'an AI agent to recommend the top consistency fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for workflow readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
