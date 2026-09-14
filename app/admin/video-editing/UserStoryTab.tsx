import styles from './VideoEditingShared.module.css';

const STORIES = [
  { role: 'Marketing/Video Editor', want: 'to track video projects and see real editing/viral-strategy dos-and-donts guidance', so: 'I have a consistent playbook and a system of record even before real Adobe/CapCut/HeyGen integration exists', status: 'Built — Manual tab, real CRUD + a real static strategy playbook, real transactional history' },
  { role: 'Marketing/Video Editor', want: 'a project checked for real readiness before publishing', so: 'I catch a missing strategy plan, output link, or duration before calling it done', status: 'Built — Pipeline tab, writes to real video_projects.readiness_score' },
  { role: 'Marketing/Video Editor', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
  { role: 'Admin', want: 'to see real-time run/token stats for readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
