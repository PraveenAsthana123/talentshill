import styles from './SurveyShared.module.css';

const STORIES = [
  { role: 'Marketing/Sales', want: 'to see all AI-readiness survey responses with maturity distribution and segmentation tags', so: 'I can understand who is filling out the assessment and how AI-mature they are', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Sales', want: 'each response scored for outreach priority from real fields (their own submitted score, whether they gave an email, company, and recency)', so: 'I know which respondents are worth following up with first', status: 'Built — Pipeline tab, writes to real survey_responses.outreach_priority field, verified live' },
  { role: 'Sales', want: 'an AI agent to recommend a follow-up approach for a specific respondent', so: 'I get a fast, grounded suggestion without reviewing every field manually', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for survey outreach automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
