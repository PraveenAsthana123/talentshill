import styles from './CampaignsShared.module.css';

const STORIES = [
  { role: 'Marketer', want: 'to create and launch a real email campaign end-to-end', so: 'I can run outreach without engineering help', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Marketer', want: 'to check whether a campaign is actually ready to launch before I click launch', so: 'I don\'t discover a missing audience or sender profile after launching', status: 'Built — Pipeline tab, verified live against a real campaign missing 2 real prerequisites' },
  { role: 'Marketer', want: 'AI-drafted subject line options grounded in whether the campaign is actually ready', so: 'I get a fast starting point without writing 3 options by hand', status: 'Built — Agentic tab, local Ollama, verified live (43.3s, real suggestions referencing the real campaign name)' },
  { role: 'Admin', want: 'to see the real campaign_send job queue status for launched campaigns', so: 'I know if sending is actually progressing, not just that I clicked launch', status: 'Built — Monitoring tab, real jobs-table integration' },
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
