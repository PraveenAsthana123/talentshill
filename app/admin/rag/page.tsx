'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminRag.module.css';

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

export default function AdminRagPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [runs, setRuns] = useState<RecentRun[]>([]);
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

  const formatDate = (d: string | null) => {
    if (!d) return '\u2014';
    return new Date(d).toLocaleString();
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      running: styles.statusRunning,
      completed: styles.statusCompleted,
      failed: styles.statusFailed,
    };
    return map[s] || styles.statusPending;
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Loading RAG dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SectionHeader
        label="RAG"
        title="RAG Dashboard"
        subtitle="Document ingestion pipeline, search, and configuration overview."
      />

      {/* Pipeline Health */}
      <div className={health?.pipelineStatus === 'healthy' ? styles.healthBannerOk : styles.healthBannerError}>
        <span className={styles.healthDot} />
        <span className={styles.healthText}>
          {health?.pipelineStatus === 'healthy' ? 'Pipeline Healthy' : 'Pipeline Issues Detected'}
        </span>
        {health?.lastRunAt && (
          <span className={styles.healthMeta}>Last run: {formatDate(health.lastRunAt)}</span>
        )}
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{health?.total || 0}</div>
          <div className={styles.statLabel}>Total Documents</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{health?.pending || 0}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{health?.ingested || 0}</div>
          <div className={styles.statLabel}>Ingested</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{health?.embedded || 0}</div>
          <div className={styles.statLabel}>Embedded</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{health?.failed || 0}</div>
          <div className={styles.statLabel}>Failed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.actions}>
        <Link href="/admin/rag/documents">
          <Button size="sm" variant="primary">Upload Document</Button>
        </Link>
        <Link href="/admin/rag/search">
          <Button size="sm" variant="ghost">Search</Button>
        </Link>
        <Link href="/admin/rag/runs">
          <Button size="sm" variant="ghost">View Runs</Button>
        </Link>
        <Link href="/admin/rag/config">
          <Button size="sm" variant="ghost">Configuration</Button>
        </Link>
      </div>

      {/* Recent Runs */}
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
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Started</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.typeCell}>{r.type}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
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
    </div>
  );
}
