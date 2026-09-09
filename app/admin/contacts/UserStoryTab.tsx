import styles from './ContactsShared.module.css';

const STORIES = [
  { role: 'Sales/Admin', want: 'a real contact database with search/filter, CSV import/export', so: 'I can manage the CRM contact list without ad-hoc spreadsheets', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin', want: 'each contact scored deterministically for data-quality + engagement potential from real fields (name, company, phone, tags, source, status)', so: 'I can prioritize which contacts are worth active outreach', status: 'Built — Pipeline tab, writes to real contacts.leadScore field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend how to engage a specific contact', so: 'I get a fast, grounded suggestion without guessing', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for contact scoring automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
