'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDateDisplay, formatTimeSlot, getLeadTier } from '@/lib/booking-utils';
import styles from './AdminAppointments.module.css';

interface AppointmentRow {
  id: string;
  service: { category: string; service: string };
  dateTime: { date: string; time: string; duration: string };
  contact: { name: string; email: string; company: string };
  status: string;
  leadScore: number;
  leadTier: string;
  createdAt: string;
}

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  byStatus: { pending: number; confirmed: number; completed: number; cancelled: number };
  byTier: { hot: number; warm: number; cool: number; cold: number };
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, statsRes] = await Promise.all([
        fetch(`/api/appointments?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        fetch('/api/appointments?stats=true'),
      ]);
      const apptData = await apptRes.json();
      const statsData = await statsRes.json();
      setAppointments(apptData.appointments || []);
      setStats(statsData.stats || null);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const statusClass = (s: string) => {
    switch (s) {
      case 'pending': return styles.statusPending;
      case 'confirmed': return styles.statusConfirmed;
      case 'completed': return styles.statusCompleted;
      case 'cancelled': return styles.statusCancelled;
      default: return '';
    }
  };

  const scoreClass = (tier: string) => {
    switch (tier) {
      case 'hot': return styles.scoreHot;
      case 'warm': return styles.scoreWarm;
      case 'cool': return styles.scoreCool;
      case 'cold': return styles.scoreCold;
      default: return '';
    }
  };

  return (
    <div className={styles.page}>
      <div className="container section">
        <SectionHeader label="Admin" title="Appointment Dashboard" subtitle="Manage bookings, track leads, and monitor conversion." />

        {stats && (
          <>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>Total Bookings</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.today}</div>
                <div className={styles.statLabel}>Today</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.thisWeek}</div>
                <div className={styles.statLabel}>This Week</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.byStatus.pending}</div>
                <div className={styles.statLabel}>Pending</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{stats.byStatus.confirmed}</div>
                <div className={styles.statLabel}>Confirmed</div>
              </div>
            </div>

            <div className={styles.tierGrid}>
              <span className={cn(styles.tierBadge, styles.tierHot)}>Hot: {stats.byTier.hot}</span>
              <span className={cn(styles.tierBadge, styles.tierWarm)}>Warm: {stats.byTier.warm}</span>
              <span className={cn(styles.tierBadge, styles.tierCool)}>Cool: {stats.byTier.cool}</span>
              <span className={cn(styles.tierBadge, styles.tierCold)}>Cold: {stats.byTier.cold}</span>
            </div>
          </>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { window.location.href = '/api/appointments/export'; }}>
            Export CSV
          </Button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : appointments.length === 0 ? (
            <div className={styles.empty}>No appointments found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{formatDateDisplay(a.dateTime.date)} {formatTimeSlot(a.dateTime.time)}</td>
                    <td className={styles.nameCell}>{a.contact.name}</td>
                    <td className={styles.companyCell}>{a.contact.company}</td>
                    <td>{a.service.service}</td>
                    <td>
                      <span className={cn(styles.statusBadge, statusClass(a.status))}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <span className={cn(styles.scoreBadge, scoreClass(a.leadTier))}>
                        {a.leadScore}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/appointments/${a.id}`} className={styles.viewLink}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
