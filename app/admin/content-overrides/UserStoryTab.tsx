import styles from './OverridesShared.module.css';

const STORIES = [
  { role: 'Marketing Editor', want: 'to override page content dynamically without a code deploy', so: 'I can make quick content changes without engineering involvement', status: 'Built — Manual tab (pre-existing, now with real transactional history). Honest gap: no live page currently reads these overrides yet.' },
  { role: 'Marketing Editor', want: 'each override checked for real XSS risk before it could ever render on a live page', so: 'I do not accidentally store a script tag that would execute for every visitor once this is wired up', status: 'Built — Pipeline tab, writes to real content_overrides.safety_score field, verified live' },
  { role: 'Marketing Editor', want: 'an AI agent to recommend the top safety fix for an override', so: 'I get a fast, grounded suggestion instead of eyeballing raw text for risk', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for override safety automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
