'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminRag.module.css';
import sharedStyles from './RagShared.module.css';

interface HealthData {
  total: number;
  pending: number;
  ingested: number;
  embedded: number;
  failed: number;
  pipelineStatus: string;
  lastRunAt: string | null;
}
interface RecentRun {
  id: string;
  type: string;
  status: string;
  documentIds: string[];
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [runs, setRuns] = useState<RecentRun[]>([]);
  const [opRuns, setOpRuns] = useState<RunEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [healthRes, runsRes] = await Promise.all([
        fetch('/api/admin/rag/health'),
        fetch('/api/admin/rag/runs?limit=5'),
      ]);
      const healthData = await healthRes.json();
      const runsData = await runsRes.json();
      setHealth(healthData);
      setRuns(runsData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=rag&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setOpRuns(d.runs || [])).catch(() => {});
  }, []);

  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');
  const statusClass = (s: string) => {
    const map: Record<string, string> = { pending: styles.statusPending, running: styles.statusRunning, completed: styles.statusCompleted, failed: styles.statusFailed };
    return map[s] || styles.statusPending;
  };

  if (loading) return <div className={styles.empty}>Loading RAG dashboard...</div>;

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Document ingestion pipeline (upload/URL/sitepage → real chunking → real local-Ollama embeddings), hybrid search, and configuration — real infrastructure, now with a real embedding provider instead of random vectors (see Governance tab).</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Upload or link a document, then trigger ingestion from the Documents page</li><li>The job queue processes ingestion within ~5s (auto-started on first admin page load)</li><li>Run Pipeline readiness scoring on a document once chunked/embedded to prove real end-to-end retrieval</li><li>Use Agentic for a grounded, source-cited answer over the whole ingested corpus</li></ul>
      </div>

      <div className={health?.pipelineStatus === 'healthy' ? styles.healthBannerOk : styles.healthBannerError}>
        <span className={styles.healthDot} />
        <span className={styles.healthText}>{health?.pipelineStatus === 'healthy' ? 'Pipeline Healthy' : 'Pipeline Issues Detected'}</span>
        {health?.lastRunAt && <span className={styles.healthMeta}>Last run: {formatDate(health.lastRunAt)}</span>}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statValue}>{health?.total || 0}</div><div className={styles.statLabel}>Total Documents</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{health?.pending || 0}</div><div className={styles.statLabel}>Pending</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{health?.ingested || 0}</div><div className={styles.statLabel}>Ingested</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{health?.embedded || 0}</div><div className={styles.statLabel}>Embedded</div></div>
        <div className={styles.statCard}><div className={styles.statValue}>{health?.failed || 0}</div><div className={styles.statLabel}>Failed</div></div>
      </div>

      <div className={styles.actions}>
        <Link href="/admin/rag/documents"><Button size="sm" variant="primary">Upload Document</Button></Link>
        <Link href="/admin/rag/search"><Button size="sm" variant="ghost">Search</Button></Link>
        <Link href="/admin/rag/runs"><Button size="sm" variant="ghost">View Runs</Button></Link>
        <Link href="/admin/rag/config"><Button size="sm" variant="ghost">Configuration</Button></Link>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Runs</h2>
          <Link href="/admin/rag/runs" className={styles.viewAllLink}>View All</Link>
        </div>
        {runs.length === 0 ? (
          <div className={styles.empty}>No recent runs.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Type</th><th>Status</th><th>Documents</th><th>Started</th><th>Completed</th></tr></thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.typeCell}>{r.type}</td>
                    <td><span className={`${styles.statusBadge} ${statusClass(r.status)}`}>{r.status}</span></td>
                    <td className={styles.dateCell}>{r.documentIds.length} doc(s)</td>
                    <td className={styles.dateCell}>{formatDate(r.startedAt)}</td>
                    <td className={styles.dateCell}>{formatDate(r.completedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Transactional history</h4>
        {opRuns.length === 0 && <p className={sharedStyles.empty}>No manual operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{opRuns.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.operationName}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
