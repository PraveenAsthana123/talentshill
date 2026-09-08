'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminHealth.module.css';

interface HealthData {
  status: string;
  database: {
    sizeMB: number;
    tables: Record<string, number>;
  };
  queue: {
    pending: number;
    running: number;
    completed: number;
    failed: number;
    total: number;
  };
  recentErrors: { jobId: string; message: string; createdAt: string }[];
  uptime: number;
  timestamp: string;
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      const data = await res.json();
      setHealth(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchHealth(); }, []);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  if (loading) return <div className={styles.page}><div className={styles.empty}>Loading health data...</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="System" title="Health Monitor" subtitle="System status, database metrics, and job queue overview." />

      <div className={styles.refreshRow}>
        <Button size="sm" variant="ghost" onClick={fetchHealth}>Refresh</Button>
        <span className={styles.timestamp}>Last check: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}</span>
      </div>

      {/* Status Banner */}
      <div className={health?.status === 'healthy' ? styles.statusHealthy : styles.statusUnhealthy}>
        <span className={styles.statusDot} />
        <span className={styles.statusText}>{health?.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}</span>
      </div>

      {/* Overview Cards */}
      <div className={styles.cardsGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Database Size</div>
          <div className={styles.cardValue}>{health?.database.sizeMB || 0} MB</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Uptime</div>
          <div className={styles.cardValue}>{health ? formatUptime(health.uptime) : '—'}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Jobs Pending</div>
          <div className={styles.cardValue}>{health?.queue.pending || 0}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Jobs Failed</div>
          <div className={styles.cardValue}>{health?.queue.failed || 0}</div>
        </div>
      </div>

      {/* Table Row Counts */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Table Row Counts</h2>
        <div className={styles.tableGrid}>
          {health?.database.tables && Object.entries(health.database.tables).map(([table, count]) => (
            <div key={table} className={styles.tableItem}>
              <span className={styles.tableName}>{table}</span>
              <span className={styles.tableCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Job Queue */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Job Queue</h2>
        <div className={styles.queueGrid}>
          <div className={styles.queueItem}><span className={styles.queueLabel}>Pending</span><span className={styles.queueValue}>{health?.queue.pending || 0}</span></div>
          <div className={styles.queueItem}><span className={styles.queueLabel}>Running</span><span className={styles.queueValue}>{health?.queue.running || 0}</span></div>
          <div className={styles.queueItem}><span className={styles.queueLabel}>Completed</span><span className={styles.queueValue}>{health?.queue.completed || 0}</span></div>
          <div className={styles.queueItem}><span className={styles.queueLabel}>Failed</span><span className={styles.queueValue}>{health?.queue.failed || 0}</span></div>
        </div>
      </div>

      {/* Recent Errors */}
      {(health?.recentErrors?.length || 0) > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Errors</h2>
          <div className={styles.errorList}>
            {health?.recentErrors.map((e, i) => (
              <div key={i} className={styles.errorItem}>
                <span className={styles.errorMsg}>{e.message}</span>
                <span className={styles.errorTime}>{new Date(e.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
