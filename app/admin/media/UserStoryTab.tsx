import styles from './MediaShared.module.css';

const STORIES = [
  { role: 'Marketing/Content Editor', want: 'to upload, browse, and delete media files with drag-and-drop', so: 'I can manage images and documents without touching the filesystem directly', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Marketing/Content Editor', want: 'a media file checked for real integrity', so: 'I catch a file deleted outside the app, a size mismatch, or a missing alt tag before a broken image reaches a page', status: 'Built — Pipeline tab, writes to real media.readiness_score field, verified live' },
  { role: 'Marketing/Content Editor', want: 'an AI agent to recommend the top integrity fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every file', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for media integrity automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
  { role: 'Admin/Security', want: 'uploads to a controlled folder path to be rejected if they attempt to escape the upload directory', so: 'a malicious or malformed folder value cannot write files outside the intended storage tree', status: 'Built — path-traversal fix in lib/media/upload.ts, see Governance tab' },
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
