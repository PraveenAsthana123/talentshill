'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import styles from './AdminRagRuns.module.css';

interface RagRun {
  id: string;
  type: string;
  status: string;
  documentIds: string[];
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  steps: RunStep[];
  metrics: Record<string, number>;
}

interface RunStep {
  id: string;
  name: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  message: string | null;
}

const TYPE_TABS = ['all', 'ingestion', 'embedding', 'evaluation', 'retrieval'] as const;
const STATUS_TABS = ['all', 'pending', 'running', 'completed', 'failed'] as const;

export default function AdminRagRunsPage() {
  const [runs, setRuns] = useState<RagRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/rag/runs?${params}`);
      const data = await res.json();
      setRuns(data.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchRuns(); }, [typeFilter, statusFilter]);

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

  const stepStatusClass = (s: string) => {
    const map: Record<string, string> = {
      pending: styles.stepPending,
      running: styles.stepRunning,
      completed: styles.stepCompleted,
      failed: styles.stepFailed,
    };
    return map[s] || styles.stepPending;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        label="RAG"
        title="Pipeline Runs"
        subtitle="View all RAG pipeline operations and their execution details."
      />

      <Link href="/admin/rag" className={styles.backLink}>&#8592; Back to RAG Dashboard</Link>

      {/* Type Filter */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Type:</span>
        <div className={styles.tabs}>
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${typeFilter === tab ? styles.tabActive : ''}`}
              onClick={() => setTypeFilter(tab)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className={styles.filterGroup}>
        <span className={styles.filterLabel}>Status:</span>
        <div className={styles.tabs}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${statusFilter === tab ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Loading runs...</div>
        ) : runs.length === 0 ? (
          <div className={styles.empty}>No runs found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Error</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <>
                  <tr
                    key={run.id}
                    className={expandedId === run.id ? styles.selectedRow : ''}
                    onClick={() => toggleExpand(run.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className={styles.typeCell}>{run.type}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${statusClass(run.status)}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{run.documentIds.length} doc(s)</td>
                    <td className={styles.dateCell}>{formatDate(run.startedAt)}</td>
                    <td className={styles.dateCell}>{formatDate(run.completedAt)}</td>
                    <td className={styles.errorCell}>
                      {run.error ? run.error.slice(0, 60) + (run.error.length > 60 ? '...' : '') : '\u2014'}
                    </td>
                    <td className={styles.expandCell}>
                      {expandedId === run.id ? '\u25B2' : '\u25BC'}
                    </td>
                  </tr>
                  {expandedId === run.id && (
                    <tr key={`${run.id}-detail`}>
                      <td colSpan={7} className={styles.detailCell}>
                        <div className={styles.detailContent}>
                          {/* Steps Timeline */}
                          {run.steps && run.steps.length > 0 && (
                            <div className={styles.stepsSection}>
                              <h4 className={styles.detailSectionTitle}>Steps</h4>
                              <div className={styles.timeline}>
                                {run.steps.map((step) => (
                                  <div key={step.id} className={styles.timelineItem}>
                                    <div className={`${styles.timelineDot} ${stepStatusClass(step.status)}`} />
                                    <div className={styles.timelineBody}>
                                      <div className={styles.stepName}>{step.name}</div>
                                      <div className={styles.stepMeta}>
                                        <span className={`${styles.stepBadge} ${stepStatusClass(step.status)}`}>
                                          {step.status}
                                        </span>
                                        {step.startedAt && (
                                          <span className={styles.stepTime}>{formatDate(step.startedAt)}</span>
                                        )}
                                      </div>
                                      {step.message && (
                                        <div className={styles.stepMessage}>{step.message}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Metrics */}
                          {run.metrics && Object.keys(run.metrics).length > 0 && (
                            <div className={styles.metricsSection}>
                              <h4 className={styles.detailSectionTitle}>Metrics</h4>
                              <table className={styles.metricsTable}>
                                <thead>
                                  <tr>
                                    <th>Metric</th>
                                    <th>Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(run.metrics).map(([key, value]) => (
                                    <tr key={key}>
                                      <td className={styles.metricName}>{key}</td>
                                      <td className={styles.metricValue}>
                                        {typeof value === 'number' ? value.toFixed(4) : String(value)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Error detail */}
                          {run.error && (
                            <div className={styles.errorDetail}>
                              <h4 className={styles.detailSectionTitle}>Error</h4>
                              <pre className={styles.errorPre}>{run.error}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
