'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminRuns.module.css';

interface Run {
  id: string;
  type: string;
  entityId: string | null;
  name: string;
  status: string;
  config: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface RunEvent {
  id: string;
  runId: string;
  eventType: string;
  message: string;
  metadata: string | null;
  createdAt: string;
}

export default function AdminRunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Run | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/runs?${params}`);
      const data = await res.json();
      setRuns(data.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchRuns(); }, [typeFilter, statusFilter]);

  const viewTimeline = async (run: Run) => {
    setSelected(run);
    try {
      const res = await fetch(`/api/admin/runs/${run.id}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch { /* empty */ }
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, scheduled: styles.statusScheduled, active: styles.statusActive,
      paused: styles.statusPaused, completed: styles.statusCompleted, failed: styles.statusFailed,
    };
    return map[s] || styles.statusDraft;
  };

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleString();
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Run Console" subtitle="View all system operations and their event timelines." />

      <div className={styles.filters}>
        <select className={styles.filterSelect} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="campaign">Campaign</option>
          <option value="broadcast">Broadcast</option>
          <option value="import">Import</option>
          <option value="survey">Survey</option>
          <option value="form">Form</option>
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : runs.length === 0 ? <div className={styles.empty}>No runs found.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Started</th><th>Completed</th><th>Actions</th></tr></thead>
            <tbody>
              {runs.map(r => (
                <tr key={r.id} className={selected?.id === r.id ? styles.selectedRow : ''}>
                  <td className={styles.nameCell}>{r.name}</td>
                  <td><span className={styles.typeBadge}>{typeLabel(r.type)}</span></td>
                  <td><span className={cn(styles.statusBadge, statusClass(r.status))}>{r.status}</span></td>
                  <td className={styles.dateCell}>{formatDate(r.startedAt)}</td>
                  <td className={styles.dateCell}>{formatDate(r.completedAt)}</td>
                  <td><button className={styles.actionBtn} onClick={() => viewTimeline(r)}>Timeline</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className={styles.timelineCard}>
          <div className={styles.timelineHeader}>
            <span className={styles.timelineTitle}>{selected.name} — Timeline</span>
            <button className={styles.closeBtn} onClick={() => setSelected(null)}>Close</button>
          </div>
          {events.length === 0 ? <div className={styles.empty}>No events recorded.</div> : (
            <div className={styles.timeline}>
              {events.map(e => (
                <div key={e.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineEvent}>{e.eventType}: {e.message}</div>
                    <div className={styles.timelineTime}>{formatDate(e.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
