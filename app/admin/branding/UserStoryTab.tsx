import styles from './BrandingShared.module.css';

const STORIES = [
  { role: 'Marketing/Brand Manager', want: 'to track brand assets (logos, palettes, typography, guideline docs) with real versioning', so: 'I have a single source of truth for approved brand materials', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Brand Manager', want: 'an asset checked for real readiness before approval', so: 'I catch a missing file or description before calling it approved', status: 'Built — Pipeline tab, writes to real brand_assets.readiness_score' },
  { role: 'Marketing/Brand Manager', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
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
