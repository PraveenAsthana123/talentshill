import styles from './InfluencerVideoShared.module.css';

const STORIES = [
  { role: 'Marketing/Partnerships', want: 'to track influencer partnerships and deliverables', so: 'I have a real system of record for prospecting through completion', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Partnerships', want: 'a campaign checked for real readiness', so: 'I catch a missing contact, deliverables, or fee before calling a deal confirmed', status: 'Built — Pipeline tab, writes to real influencer_campaigns.readiness_score' },
  { role: 'Marketing/Partnerships', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
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
