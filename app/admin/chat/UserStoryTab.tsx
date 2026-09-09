import styles from './ChatShared.module.css';

const STORIES = [
  { role: 'Support Agent', want: 'to triage chat sessions and requests, then respond by email', so: 'I can resolve visitor questions without a dedicated live-chat tool', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Support Agent', want: 'my response checked by the same pii/toxicity/bias/safety/compliance evaluator the automated bot already uses', so: 'I catch an accidental data leak or unsafe wording before it reaches a real customer -- previously only bot-generated responses were evaluated', status: 'Built — Pipeline tab, closes the human-response evaluation gap, writes chat_requests.response_quality_score, verified live' },
  { role: 'Support Agent', want: 'an AI agent to recommend the top fix for a flagged response', so: 'I get a fast, grounded suggestion instead of re-reading the whole thread', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for chat safety automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
