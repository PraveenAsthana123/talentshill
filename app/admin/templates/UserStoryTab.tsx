import styles from './TemplatesShared.module.css';

const STORIES = [
  { role: 'Marketing/Content Editor', want: 'to create and manage email templates with real merge-variable support', so: 'I can build reusable, personalized email content', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Content Editor', want: 'each template checked for real send-readiness — HTML/text/subject substance, and every {{placeholder}} matched to a declared variable', so: 'I catch a broken merge tag before it ships literally unfilled in a real email', status: 'Built — Pipeline tab, writes to real email_templates.readiness_score field, verified live' },
  { role: 'Content Editor', want: 'an AI agent to recommend the top improvement for a template', so: 'I get a fast, grounded suggestion instead of guessing what to fix', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for template readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
