'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './AppointmentsShared.module.css';

interface AppointmentRow { name: string; email: string; company: string; service: string; status: string; leadTier: string; followUpUrgency: number | null }
interface ReportData { generatedAt: string; totalAppointments: number; appointments: AppointmentRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/appointments/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

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
    </div>
  );
}
