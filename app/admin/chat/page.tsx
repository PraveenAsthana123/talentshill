'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdminChat.module.css';

type Tab = 'sessions' | 'requests';

export default function AdminChatPage() {
  const [tab, setTab] = useState<Tab>('sessions');
  const [sessions, setSessions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

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

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat Management</h1>

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
          <thead>
            <tr><th>Visitor</th><th>Status</th><th>Started</th><th>Last Message</th><th></th></tr>
          </thead>
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
          <thead>
            <tr><th>Subject</th><th>Status</th><th>Priority</th><th>Created</th><th></th></tr>
          </thead>
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
  );
}
