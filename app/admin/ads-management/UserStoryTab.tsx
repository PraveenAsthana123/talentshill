import styles from './AdsManagementShared.module.css';

const STORIES = [
  { role: 'Marketing/Ads Manager', want: 'to track ad campaigns across platforms in one place', so: 'I have a single system of record even before real platform-API sync exists', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Ads Manager', want: 'a campaign checked for real readiness before launch', so: 'I catch a missing objective, budget, creative, or audience before spending real money', status: 'Built — Pipeline tab, writes to real ad_campaigns.readiness_score' },
  { role: 'Marketing/Ads Manager', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
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
