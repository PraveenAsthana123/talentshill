import styles from './AppointmentsShared.module.css';

const STORIES = [
  { role: 'Sales/Admin', want: 'to see every real booking with search/filter by status, plus a booking-time lead score', so: 'I can prioritize which bookings need attention first', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Admin', want: 'each booking scored for follow-up urgency based on its current status, tier, and how long it has sat pending', so: 'I know which bookings are going stale and need action now, distinct from the one-time booking score', status: 'Built — Pipeline tab, writes to real appointments.followUpUrgency field, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the next follow-up action for a specific booking', so: 'I get a fast, grounded suggestion without reviewing every field manually', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for booking follow-up automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
