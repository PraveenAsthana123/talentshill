'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './AppointmentsShared.module.css';

interface AppointmentRow { name: string; email: string; company: string; service: string; status: string; leadTier: string; followUpUrgency: number | null }
interface WebinarRow { title: string; topic: string; status: string; scheduledAt: string; registrantCount: number; attendedCount: number; qualifiedCount: number }
interface ReportData { generatedAt: string; totalAppointments: number; appointments: AppointmentRow[]; webinars: WebinarRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/appointments/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/appointments/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Bookings Report (by follow-up urgency)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalAppointments} total bookings.</p>
      {data.appointments.length === 0 && <p className={styles.empty}>No bookings yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Service</th><th>Tier</th><th>Urgency</th><th>Status</th></tr></thead>
        <tbody>
          {data.appointments.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td><td>{a.email}</td><td>{a.company}</td><td>{a.service}</td>
              <td><Badge variant={a.leadTier === 'hot' ? 'success' : a.leadTier === 'warm' ? 'accent' : 'default'}>{a.leadTier}</Badge></td>
              <td>{a.followUpUrgency ?? '—'}</td>
              <td>{a.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Webinar-to-Pipeline Report</h4>
      {data.webinars.length === 0 ? <p className={styles.empty}>No webinars yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Topic</th><th>Status</th><th>Scheduled</th><th>Registrants</th><th>Attended</th><th>Qualified</th></tr></thead>
          <tbody>
            {data.webinars.map((w, i) => (
              <tr key={i}>
                <td>{w.title}</td><td>{w.topic}</td><td>{w.status}</td><td>{new Date(w.scheduledAt).toLocaleDateString()}</td>
                <td>{w.registrantCount}</td><td>{w.attendedCount}</td><td>{w.qualifiedCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
