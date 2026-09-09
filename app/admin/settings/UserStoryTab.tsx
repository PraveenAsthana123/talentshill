import styles from './SettingsShared.module.css';

const STORIES = [
  { role: 'Admin', want: 'to edit site name/description/contact email and social links', so: 'I can manage site configuration in one place', status: 'Built — Manual tab (pre-existing form), now with real transactional history; feature toggles moved to the real Feature Flags page' },
  { role: 'Admin/Marketing', want: 'my edited social links to actually appear on the live site', so: 'updating LinkedIn/Facebook/WhatsApp here has a real effect, not a cosmetic one', status: 'Built — real fix: added GET /api/settings/public + wired Footer.tsx to read it, overriding the previous build-time env-var-only links. Verified live' },
  { role: 'Admin', want: 'a setting checked for real integrity (value present, correct format, actually wired to public output)', so: 'I know whether editing a setting here will have any real effect before relying on it', status: 'Built — Pipeline tab, writes to real site_settings.quality_score, verified live' },
  { role: 'Admin', want: 'an AI agent to recommend the top integrity fix for a setting', so: 'I get a fast, grounded suggestion instead of manually checking every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for settings integrity automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
