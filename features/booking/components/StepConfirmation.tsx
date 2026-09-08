'use client';

import { useBookingStore } from '@/store/booking-store';
import {
  SERVICE_CATEGORIES,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
  DURATION_OPTIONS,
  TIMEZONE_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  formatTimeSlot,
  formatDateDisplay,
  generateICS,
  getLeadTier,
} from '@/lib/booking-utils';
import { useUIStore } from '@/store/ui-store';
import { generateId } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import styles from './BookingWizard.module.css';

function findLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label || value;
}

export default function StepConfirmation() {
  const store = useBookingStore();
  const addToast = useUIStore((s) => s.addToast);
  const { serviceData, dateTimeData, contactData, requirementsData, isSubmitting, isComplete, appointmentId, leadScore, setStep, setSubmitting, setComplete, reset } = store;

  const category = SERVICE_CATEGORIES.find((c) => c.id === serviceData?.category);
  const service = category?.services.find((s) => s.id === serviceData?.service);

  const handleSubmit = async () => {
    if (!serviceData || !dateTimeData || !contactData || !requirementsData) return;
    setSubmitting(true);
    try {
      const id = generateId();
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, service: serviceData, dateTime: dateTimeData, contact: contactData, requirements: requirementsData }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setComplete(id, data.leadScore);
      addToast({ type: 'success', message: 'Appointment booked successfully!' });
    } catch {
      setSubmitting(false);
      addToast({ type: 'error', message: 'Failed to book appointment. Please try again.' });
    }
  };

  const handleDownloadICS = () => {
    if (!dateTimeData || !serviceData || !contactData || !appointmentId) return;
    const ics = generateICS({
      date: dateTimeData.date,
      time: dateTimeData.time,
      duration: dateTimeData.duration,
      service: service?.name || serviceData.service,
      category: category?.name || serviceData.category,
      name: contactData.name,
      email: contactData.email,
      company: contactData.company,
      appointmentId,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talentshill-appointment-${appointmentId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isComplete && appointmentId) {
    const tier = leadScore ? getLeadTier(leadScore) : 'cool';
    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>&#10003;</div>
        <h2 className={styles.successTitle}>Appointment Confirmed!</h2>
        <p className={styles.successText}>
          Your demo session has been scheduled. We will send a calendar invite with a meeting link to{' '}
          <strong>{contactData?.email}</strong>.
        </p>
        <div className={styles.appointmentId}>Booking ID: {appointmentId}</div>
        <div className={cn(
          styles.leadBadge,
          tier === 'hot' && styles.leadHot,
          tier === 'warm' && styles.leadWarm,
          tier === 'cool' && styles.leadCool,
          tier === 'cold' && styles.leadCold,
        )}>
          Priority: {tier}
        </div>
        <div className={styles.successActions}>
          <Button variant="outline" onClick={handleDownloadICS}>Download Calendar (.ics)</Button>
          <Button onClick={reset}>Book Another</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className={styles.cardTitle}>Review & Confirm</h2>
      <p className={styles.cardSubtitle}>Please review your selections before confirming.</p>

      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Service</span>
          <button className={styles.editBtn} onClick={() => setStep(0)}>Edit</button>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Category:</span>
          <span className={styles.summaryValue}>{category?.icon} {category?.name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Service:</span>
          <span className={styles.summaryValue}>{service?.name}</span>
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Date & Time</span>
          <button className={styles.editBtn} onClick={() => setStep(1)}>Edit</button>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Date:</span>
          <span className={styles.summaryValue}>{dateTimeData ? formatDateDisplay(dateTimeData.date) : ''}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Time:</span>
          <span className={styles.summaryValue}>{dateTimeData ? formatTimeSlot(dateTimeData.time) : ''}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Duration:</span>
          <span className={styles.summaryValue}>{findLabel(DURATION_OPTIONS.map((d) => ({ value: d.value, label: d.label })), dateTimeData?.duration || '')}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Timezone:</span>
          <span className={styles.summaryValue}>{findLabel(TIMEZONE_OPTIONS, dateTimeData?.timezone || '')}</span>
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Contact</span>
          <button className={styles.editBtn} onClick={() => setStep(2)}>Edit</button>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Name:</span>
          <span className={styles.summaryValue}>{contactData?.name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Email:</span>
          <span className={styles.summaryValue}>{contactData?.email}</span>
        </div>
        {contactData?.phone && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Phone:</span>
            <span className={styles.summaryValue}>{contactData.phone}</span>
          </div>
        )}
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Company:</span>
          <span className={styles.summaryValue}>{contactData?.company}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Role:</span>
          <span className={styles.summaryValue}>{contactData?.jobTitle}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Size:</span>
          <span className={styles.summaryValue}>{findLabel(COMPANY_SIZE_OPTIONS, contactData?.companySize || '')}</span>
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryHeader}>
          <span className={styles.summaryTitle}>Requirements</span>
          <button className={styles.editBtn} onClick={() => setStep(3)}>Edit</button>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Use Case:</span>
          <span className={styles.summaryValue}>{requirementsData?.useCase}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Budget:</span>
          <span className={styles.summaryValue}>{findLabel(BUDGET_OPTIONS, requirementsData?.budget || '')}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Timeline:</span>
          <span className={styles.summaryValue}>{findLabel(TIMELINE_OPTIONS, requirementsData?.timeline || '')}</span>
        </div>
        {requirementsData?.goals && requirementsData.goals.length > 0 && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Goals:</span>
            <span className={styles.summaryValue}>{requirementsData.goals.join(', ')}</span>
          </div>
        )}
        {requirementsData?.challenges && (
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Challenges:</span>
            <span className={styles.summaryValue}>{requirementsData.challenges}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
        <Button onClick={handleSubmit} loading={isSubmitting} size="lg">
          Confirm Appointment
        </Button>
      </div>
    </>
  );
}
