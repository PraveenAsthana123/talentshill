import styles from './VoiceAiShared.module.css';

const STORIES = [
  { role: 'Marketing/Content', want: 'to track voice scripts, recordings, and transcripts', so: 'I have a real system of record even before voice-cloning/TTS/STT API integration exists', status: 'Built — Manual tab, real CRUD, real transactional history' },
  { role: 'Marketing/Content', want: 'an asset checked for real readiness', so: 'I catch a missing script/recording file or duration before calling it done', status: 'Built — Pipeline tab, writes to real voice_assets.readiness_score' },
  { role: 'Marketing/Content', want: 'an AI agent to recommend the top readiness fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only' },
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
