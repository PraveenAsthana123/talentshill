import styles from './VideosShared.module.css';

const STORIES = [
  { role: 'Marketing/Content Editor', want: 'to create, edit, and delete the videos shown on the real public /videos page', so: 'I can keep the site\'s video library current without a code deploy', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Content Editor', want: 'each video record scored for real public-page readiness — thumbnail, summary substance, tags, category, duration, active status', so: 'I know which records are too thin to be live', status: 'Built — Pipeline tab, writes to real videos.content_score field, verified live' },
  { role: 'Content Editor', want: 'an AI agent to recommend the top content improvement for a video record', so: 'I get a fast, grounded suggestion instead of guessing what to add', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for video content-scoring automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
