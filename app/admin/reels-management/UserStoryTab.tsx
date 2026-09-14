import styles from './ReelsManagementShared.module.css';

const STORIES = [
  { role: 'Marketing/Content', want: 'a real content calendar for short-form video (Reels/Shorts/TikTok)', so: 'I can track ideas through published in one place', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Content', want: 'a reel checked for real readiness before scheduling', so: 'I catch a missing caption or asset before it\'s supposed to go live', status: 'Built — Pipeline tab, writes to real reels.readiness_score' },
  { role: 'Marketing/Content', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
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
