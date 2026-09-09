'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminRuns.module.css';
import sharedStyles from './RunsShared.module.css';

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
interface OpRunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const FORCEABLE_STATUSES = ['draft', 'scheduled', 'active', 'paused', 'completed', 'failed'];

export default function ManualTab() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Run | null>(null);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [forcing, setForcing] = useState(false);
  const [opRuns, setOpRuns] = useState<OpRunEntry[]>([]);

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

  const loadOpRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=runs&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setOpRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => { fetchRuns(); }, [typeFilter, statusFilter]);
  useEffect(() => { loadOpRuns(); }, []);

  const viewTimeline = async (run: Run) => {
    setSelected(run);
    try {
      const res = await fetch(`/api/admin/runs/${run.id}`);
      const data = await res.json();
      setEvents(data.events || []);
    } catch { /* empty */ }
  };

  const handleForceStatus = async (newStatus: string) => {
    if (!selected) return;
    setForcing(true);
    try {
      await fetch(`/api/admin/runs/${selected.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }),
      });
      await fetchRuns();
      await viewTimeline({ ...selected, status: newStatus });
      loadOpRuns();
    } finally { setForcing(false); }
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, scheduled: styles.statusScheduled, active: styles.statusActive,
      paused: styles.statusPaused, completed: styles.statusCompleted, failed: styles.statusFailed,
    };
    return map[s] || styles.statusDraft;
  };

  const typeLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
  const formatDate = (d: string | null) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Cross-module Run Console — real execution tracking for business operations (currently: broadcast sends), with a real event timeline per run and a manual Force Status control for stuck/incorrect runs.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Use Force Status only after confirming via the timeline that a run is genuinely stuck or mis-recorded</li><li>Run Pipeline health scoring on a run to catch staleness or an inconsistent completion state before forcing anything</li></ul>
      </div>

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
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            {FORCEABLE_STATUSES.filter((s) => s !== selected.status).map((s) => (
              <button key={s} className={styles.actionBtn} disabled={forcing} onClick={() => handleForceStatus(s)}>
                Force → {s}
              </button>
            ))}
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

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
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
