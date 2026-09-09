import styles from './BlogShared.module.css';

const STORIES = [
  { role: 'Content Editor', want: 'to draft, edit, publish/unpublish, and delete blog posts with real view/subscriber analytics', so: 'I can manage the blog without touching the database directly', status: 'Built — Manual tab (pre-existing, now with real transactional history)' },
  { role: 'Content Editor', want: 'each post scored for SEO/publish-readiness from real fields (title/summary length, content substance, meta tags, cover image, categories, tags)', so: 'I know what is missing before publishing, not after', status: 'Built — Pipeline tab, writes to real blog_posts.seo_readiness_score field, verified live' },
  { role: 'Content Editor', want: 'an AI agent to recommend the single highest-impact improvement for a post', so: 'I get a fast, grounded suggestion instead of guessing what to fix first', status: 'Built — Agentic tab, local Ollama, advisory only, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats and Ollama health for blog readiness automation', so: 'I know the automation is actually working and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget' },
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
