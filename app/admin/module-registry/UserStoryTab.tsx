import styles from './ModuleRegistryShared.module.css';

const STORIES = [
  { role: 'Admin/Engineering Lead', want: 'a real catalog of every admin module\'s built-vs-partial status', so: 'I can see what\'s actually real vs. disclosed-partial without re-auditing the whole codebase', status: 'Built — Manual tab (pre-existing table), now with a real Verify action and drift score column' },
  { role: 'Admin/Engineering Lead', want: 'to verify a registry row after re-checking it against the real code', so: 'lastVerifiedAt reflects an actual re-check, not a stale claim', status: 'Built — Manual tab Verify button, wired to the pre-existing but previously orphaned PATCH endpoint, real transactional history added' },
  { role: 'Admin/Engineering Lead', want: 'a registry row checked for real drift (stale verification, missing gap disclosure, inconsistent fields)', so: 'I catch a registry entry that has gone stale or self-contradictory before trusting it', status: 'Built — Pipeline tab, writes to real module_registry.drift_score field, verified live' },
  { role: 'Admin/Engineering Lead', want: 'an AI agent to recommend the top drift fix', so: 'I get a fast, grounded suggestion instead of manually re-checking every field', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for registry drift automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
