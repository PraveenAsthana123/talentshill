'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import styles from './AdminMaintenance.module.css';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  scheduledEnd: string | null;
}

export default function AdminMaintenancePage() {
  const [status, setStatus] = useState<MaintenanceStatus>({ enabled: false, message: '', scheduledEnd: null });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ message: '', scheduledEnd: '' });

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/maintenance');
      const data = await res.json();
      setStatus(data);
      setForm({ message: data.message || '', scheduledEnd: data.scheduledEnd || '' });
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleToggle = async () => {
    const newEnabled = !status.enabled;
    await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newEnabled, message: form.message, scheduledEnd: form.scheduledEnd || null }),
    });
    fetchStatus();
  };

  const handleUpdate = async () => {
    await fetch('/api/admin/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: status.enabled, message: form.message, scheduledEnd: form.scheduledEnd || null }),
    });
    fetchStatus();
  };

  if (loading) return <div className={styles.page}><div className={styles.empty}>Loading...</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Maintenance Mode" subtitle="Control site-wide maintenance mode with custom messages." />

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <div>
            <div className={styles.statusLabel}>Current Status</div>
            <div className={styles.statusValue}>
              <span className={status.enabled ? styles.badgeOn : styles.badgeOff}>
                {status.enabled ? 'MAINTENANCE ON' : 'NORMAL OPERATION'}
              </span>
            </div>
          </div>
          <Button size="sm" variant={status.enabled ? 'ghost' : 'primary'} onClick={handleToggle}>
            {status.enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
          </Button>
        </div>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formTitle}>Maintenance Settings</div>
        <div className={styles.formGrid}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={styles.formLabel}>Maintenance Message</label>
            <textarea
              className={styles.formTextarea}
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder="We are currently performing maintenance. Please check back soon."
            />
          </div>
          <div>
            <label className={styles.formLabel}>Scheduled End (optional)</label>
            <input
              type="datetime-local"
              className={styles.formInput}
              value={form.scheduledEnd}
              onChange={e => setForm(p => ({ ...p, scheduledEnd: e.target.value }))}
            />
          </div>
        </div>
        <div className={styles.formActions}>
          <Button size="sm" onClick={handleUpdate}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
