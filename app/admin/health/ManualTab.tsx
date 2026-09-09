'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import styles from './AdminHealth.module.css';
import sharedStyles from './HealthShared.module.css';

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

export default function ManualTab() {
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

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>System status, database metrics, and job queue overview — real live reads, no mutations in this module.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Fixed bug in this build</h4>
        <p><code>db.run(sql.raw(...))</code> executes a SQL statement but discards SELECT result rows (it returns a RunResult, not query rows) — every table row count on this page was silently 0 regardless of real table size. Fixed to <code>db.get(...)</code>, which actually returns the row.</p>
      </div>

      {loading ? <div className={styles.empty}>Loading health data...</div> : (
        <div>
          <div className={styles.refreshRow}>
            <Button size="sm" variant="ghost" onClick={fetchHealth}>Refresh</Button>
            <span className={styles.timestamp}>Last check: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}</span>
          </div>

          <div className={health?.status === 'healthy' ? styles.statusHealthy : styles.statusUnhealthy}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>{health?.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}</span>
          </div>

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

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Job Queue</h2>
            <div className={styles.queueGrid}>
              <div className={styles.queueItem}><span className={styles.queueLabel}>Pending</span><span className={styles.queueValue}>{health?.queue.pending || 0}</span></div>
              <div className={styles.queueItem}><span className={styles.queueLabel}>Running</span><span className={styles.queueValue}>{health?.queue.running || 0}</span></div>
              <div className={styles.queueItem}><span className={styles.queueLabel}>Completed</span><span className={styles.queueValue}>{health?.queue.completed || 0}</span></div>
              <div className={styles.queueItem}><span className={styles.queueLabel}>Failed</span><span className={styles.queueValue}>{health?.queue.failed || 0}</span></div>
            </div>
          </div>

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
      )}
    </div>
  );
}
