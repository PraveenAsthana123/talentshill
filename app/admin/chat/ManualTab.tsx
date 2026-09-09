'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import styles from './AdminChat.module.css';
import sharedStyles from './ChatShared.module.css';

type Tab = 'sessions' | 'requests';
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  useEffect(() => {
    if (tab === 'sessions') {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      fetch(`/api/admin/chat/sessions?${params}`).then(r => r.json()).then(d => setSessions(d.sessions || []));
    } else {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      fetch(`/api/admin/chat/requests?${params}`).then(r => r.json()).then(d => setRequests(d.requests || []));
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=chat&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  }, []);

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage live chat sessions and support requests — real triage, assignment, and email response control.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Triage new requests to a priority and assignee</li><li>Respond with a substantive, PII-free message before marking resolved</li><li>Run Pipeline or Agentic response-quality scoring after responding</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'sessions' ? styles.tabActive : ''}`} onClick={() => { setTab('sessions'); setStatusFilter(''); }}>Sessions</button>
          <button className={`${styles.tab} ${tab === 'requests' ? styles.tabActive : ''}`} onClick={() => { setTab('requests'); setStatusFilter(''); }}>Requests</button>
        </div>

        <div className={styles.filterRow}>
          {tab === 'sessions' ? (
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          ) : (
            <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="responding">Responding</option>
              <option value="waiting_user">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>

        {tab === 'sessions' && (
          <table className={styles.table}>
            <thead><tr><th>Visitor</th><th>Status</th><th>Started</th><th>Last Message</th><th></th></tr></thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.visitorEmail || 'Anonymous'}</td>
                  <td><span className={`${styles.badge} ${s.status === 'active' ? styles.badgeActive : styles.badgeClosed}`}>{s.status}</span></td>
                  <td>{new Date(s.startedAt).toLocaleString()}</td>
                  <td>{s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleString() : '-'}</td>
                  <td><Link href={`/admin/chat/sessions/${s.id}`} className={styles.link}>View</Link></td>
                </tr>
              ))}
              {sessions.length === 0 && <tr><td colSpan={5} className={styles.empty}>No sessions</td></tr>}
            </tbody>
          </table>
        )}

        {tab === 'requests' && (
          <table className={styles.table}>
            <thead><tr><th>Subject</th><th>Status</th><th>Priority</th><th>Created</th><th></th></tr></thead>
            <tbody>
              {requests.map((r: any) => (
                <tr key={r.id}>
                  <td>{r.subject || 'No subject'}</td>
                  <td><span className={styles.badge}>{r.status}</span></td>
                  <td><span className={`${styles.priorityBadge} ${styles[`priority${r.priority?.charAt(0).toUpperCase()}${r.priority?.slice(1)}`] || ''}`}>{r.priority}</span></td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td><Link href={`/admin/chat/requests/${r.id}`} className={styles.link}>View</Link></td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={5} className={styles.empty}>No requests</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={sharedStyles.empty}>No manual operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.operationName}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
