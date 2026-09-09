'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  SERVICE_CATEGORIES,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  DURATION_OPTIONS,
  TIMEZONE_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  formatDateDisplay,
  formatTimeSlot,
} from '@/lib/booking-utils';
import { useUIStore } from '@/store/ui-store';
import styles from '../AdminAppointments.module.css';

interface Appointment {
  id: string;
  service: { category: string; service: string };
  dateTime: { date: string; time: string; timezone: string; duration: string };
  contact: { name: string; email: string; phone: string; company: string; jobTitle: string; companySize: string };
  requirements: { useCase: string; budget: string; timeline: string; goals: string[]; challenges: string };
  status: string;
  leadScore: number;
  leadTier: string;
  createdAt: string;
  updatedAt: string;
}

function findLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label || value;
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const addToast = useUIStore((s) => s.addToast);

  useEffect(() => {
    fetch(`/api/admin/appointments/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAppointment(data.appointment || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAppointment(data.appointment);
      addToast({ type: 'success', message: `Status updated to ${newStatus}` });
    } catch {
      addToast({ type: 'error', message: 'Failed to update status' });
    }
    setStatusUpdating(false);
  };

  if (loading) return <div className={styles.page}><div className="container section"><p>Loading...</p></div></div>;
  if (!appointment) return <div className={styles.page}><div className="container section"><p>Appointment not found.</p></div></div>;

  const category = SERVICE_CATEGORIES.find((c) => c.id === appointment.service.category);
  const service = category?.services.find((s) => s.id === appointment.service.service);

  const tierClass = appointment.leadTier === 'hot' ? styles.tierHot : appointment.leadTier === 'warm' ? styles.tierWarm : appointment.leadTier === 'cool' ? styles.tierCool : styles.tierCold;
  const statusClass = appointment.status === 'pending' ? styles.statusPending : appointment.status === 'confirmed' ? styles.statusConfirmed : appointment.status === 'completed' ? styles.statusCompleted : styles.statusCancelled;

  return (
    <div className={styles.page}>
      <div className="container section">
        <Link href="/admin/appointments" className={styles.backLink}>
          &larr; Back to Dashboard
        </Link>

        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 'var(--space-2)' }}>
          Appointment: {appointment.contact.name}
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-8)', alignItems: 'center' }}>
          <span className={cn(styles.statusBadge, statusClass)}>{appointment.status}</span>
          <span className={cn(styles.tierBadge, tierClass)}>Score: {appointment.leadScore} ({appointment.leadTier})</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ID: {appointment.id}</span>
        </div>

        <div className={styles.detailGrid}>
          <div>
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Service</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{category?.icon} {category?.name || appointment.service.category}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Service</span>
                <span className={styles.detailValue}>{service?.name || appointment.service.service}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Schedule</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>{formatDateDisplay(appointment.dateTime.date)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Time</span>
                <span className={styles.detailValue}>{formatTimeSlot(appointment.dateTime.time)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration</span>
                <span className={styles.detailValue}>{findLabel(DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label })), appointment.dateTime.duration)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Timezone</span>
                <span className={styles.detailValue}>{findLabel(TIMEZONE_OPTIONS, appointment.dateTime.timezone)}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Contact</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name</span>
                <span className={styles.detailValue}>{appointment.contact.name}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{appointment.contact.email}</span>
              </div>
              {appointment.contact.phone && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{appointment.contact.phone}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Company</span>
                <span className={styles.detailValue}>{appointment.contact.company}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Job Title</span>
                <span className={styles.detailValue}>{appointment.contact.jobTitle}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Company Size</span>
                <span className={styles.detailValue}>{findLabel(COMPANY_SIZE_OPTIONS, appointment.contact.companySize)}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Requirements</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Use Case</span>
                <span className={styles.detailValue}>{appointment.requirements.useCase}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Budget</span>
                <span className={styles.detailValue}>{findLabel(BUDGET_OPTIONS, appointment.requirements.budget)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Timeline</span>
                <span className={styles.detailValue}>{findLabel(TIMELINE_OPTIONS, appointment.requirements.timeline)}</span>
              </div>
              {appointment.requirements.goals.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Goals</span>
                  <span className={styles.detailValue}>{appointment.requirements.goals.join(', ')}</span>
                </div>
              )}
              {appointment.requirements.challenges && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Challenges</span>
                  <span className={styles.detailValue}>{appointment.requirements.challenges}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Actions</div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
                  Update Status
                </label>
                <select
                  className={styles.statusSelect}
                  value={appointment.status}
                  onChange={(e) => updateStatus(e.target.value)}
                  disabled={statusUpdating}
                  style={{ width: '100%' }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Metadata</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Created</span>
                <span className={styles.detailValue}>{new Date(appointment.createdAt).toLocaleString()}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Updated</span>
                <span className={styles.detailValue}>{new Date(appointment.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
