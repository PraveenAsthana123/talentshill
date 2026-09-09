import styles from './LeadsShared.module.css';

const STORIES = [
  { role: 'Sales/Admin', want: 'to see every real inbound lead in one place with search/filter by status and tier', so: 'I can prioritize outreach without digging through raw form submissions', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin', want: 'to score a lead deterministically from its real form answers (budget, timeline, project stage)', so: 'scoring is consistent and explainable, not a gut-feel guess', status: 'Built — Pipeline tab, verified live (85/100 "hot", math independently checked)' },
  { role: 'Admin', want: 'an AI agent to draft a plain-language qualification narrative from the real lead data', so: 'I get a fast, readable summary without writing one by hand for every lead', status: 'Built — Agentic tab, local Ollama, verified live with a real test lead' },
  { role: 'Admin', want: 'to see real-time run/token stats for lead scoring automation', so: 'I know how much AI activity is happening and what it costs', status: 'Built — Monitoring tab' },
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
