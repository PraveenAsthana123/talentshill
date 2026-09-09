import styles from './RagShared.module.css';

const STORIES = [
  { role: 'Admin/Content Editor', want: 'to upload or link a document and have it ingested, chunked, and embedded', so: 'I can build a real searchable knowledge corpus', status: 'Built — Manual tab (pre-existing Documents/Search/Config/Runs pages), real job-queue-driven pipeline, now with a real embedding provider' },
  { role: 'Admin', want: 'a document checked for real end-to-end readiness (not just DB row presence)', so: 'I catch a document whose real embeddings never landed, or whose content isn\'t actually retrievable, before trusting search results', status: 'Built — Pipeline tab, writes to real rag_documents.readiness_score, includes a real retrieval proof step, verified live' },
  { role: 'Admin/End user (future)', want: 'to ask a question and get a grounded answer with real source citations from the ingested corpus', so: 'I get a genuinely RAG-powered answer, not a keyword-matched snippet or a hallucinated response', status: 'Built — Agentic tab, real hybridRetrieve + local Ollama synthesis, sources cited, verified live' },
  { role: 'Admin', want: 'to see real-time run/token stats, the real job-queue pipeline log, and Ollama health for RAG automation', so: 'I know the automation is actually working end-to-end and what it costs', status: 'Built — Monitoring tab, shared OperationHealthCheck widget plus the real rag_runs job-pipeline log' },
  { role: 'Admin/Security', want: 'uploaded document content scanned for PII on ingestion', so: 'I\'m alerted to sensitive content before it\'s embedded and made searchable', status: 'Built — real detectPII() (previously a complete implementation with zero callers) now wired into the real ingest step, informational, never auto-redacts' },
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
