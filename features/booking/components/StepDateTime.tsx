'use client';

import { useState, useEffect, useMemo } from 'react';
import { useBookingStore } from '@/store/booking-store';
import { DURATION_OPTIONS, TIMEZONE_OPTIONS, getAvailableDates, formatTimeSlot, formatDateDisplay } from '@/lib/booking-utils';
import { Select } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import styles from './BookingWizard.module.css';

export default function StepDateTime() {
  const { dateTimeData, updateDateTimeData } = useBookingStore();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const availableDates = useMemo(() => new Set(getAvailableDates(60)), []);

  const selectedDate = dateTimeData?.date || '';
  const selectedTime = dateTimeData?.time || '';
  const selectedDuration = dateTimeData?.duration || '60';
  const selectedTimezone = dateTimeData?.timezone || 'America/New_York';

  useEffect(() => {
    if (!selectedDate) return;
    fetch(`/api/appointments/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setAvailableSlots(data.available || []);
        setBookedSlots(data.booked || []);
      })
      .catch(() => {
        setAvailableSlots([]);
        setBookedSlots([]);
      });
  }, [selectedDate]);

  const update = (partial: Partial<typeof dateTimeData>) => {
    updateDateTimeData({
      date: selectedDate,
      time: selectedTime,
      timezone: selectedTimezone,
      duration: selectedDuration as '30' | '60' | '90',
      ...dateTimeData,
      ...partial,
    } as typeof dateTimeData extends null ? never : NonNullable<typeof dateTimeData>);
  };

  // Calendar rendering
  const firstDay = new Date(calendarMonth.year, calendarMonth.month, 1).getDay();
  const daysInMonth = new Date(calendarMonth.year, calendarMonth.month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const monthLabel = new Date(calendarMonth.year, calendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCalendarMonth((m) => {
      const d = new Date(m.year, m.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const nextMonth = () => {
    setCalendarMonth((m) => {
      const d = new Date(m.year, m.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <h2 className={styles.cardTitle}>Pick a Date & Time</h2>
      <p className={styles.cardSubtitle}>Choose when you would like to meet with our team.</p>

      <span className={styles.fieldLabel}>Session Duration</span>
      <div className={styles.durationCards}>
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={cn(styles.durationCard, selectedDuration === opt.value && styles.durationCardSelected)}
            onClick={() => update({ duration: opt.value as '30' | '60' | '90' })}
          >
            <div className={styles.durationLabel}>{opt.label}</div>
            <div className={styles.durationDesc}>{opt.description}</div>
          </button>
        ))}
      </div>

      <span className={styles.fieldLabel}>Select Date</span>
      <div className={styles.calendarNav}>
        <button className={styles.calendarNavBtn} onClick={prevMonth}>&larr;</button>
        <span className={styles.calendarMonth}>{monthLabel}</span>
        <button className={styles.calendarNavBtn} onClick={nextMonth}>&rarr;</button>
      </div>
      <div className={styles.calendarGrid}>
        {dayHeaders.map((d) => (
          <div key={d} className={styles.dayHeader}>{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isAvailable = availableDates.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = dateStr === today;

          return (
            <button
              key={day}
              className={cn(
                styles.dayCell,
                isSelected && styles.daySelected,
                !isAvailable && styles.dayDisabled,
                isToday && styles.dayToday
              )}
              onClick={() => isAvailable && update({ date: dateStr, time: '' })}
              disabled={!isAvailable}
            >
              {day}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <>
          <span className={styles.fieldLabel}>
            Available Times for {formatDateDisplay(selectedDate)}
          </span>
          <div className={styles.timeGrid}>
            {(availableSlots.length > 0 ? availableSlots : []).map((slot) => (
              <button
                key={slot}
                className={cn(
                  styles.timeSlot,
                  selectedTime === slot && styles.timeSlotSelected,
                  bookedSlots.includes(slot) && styles.timeBooked
                )}
                onClick={() => !bookedSlots.includes(slot) && update({ time: slot })}
                disabled={bookedSlots.includes(slot)}
              >
                {formatTimeSlot(slot)}
              </button>
            ))}
          </div>
        </>
      )}

      <div style={{ maxWidth: '300px' }}>
        <Select
          label="Timezone"
          options={TIMEZONE_OPTIONS}
          value={selectedTimezone}
          onChange={(e) => update({ timezone: e.target.value })}
        />
      </div>
    </>
  );
}
