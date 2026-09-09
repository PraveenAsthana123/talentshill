'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminMaintenance.module.css';
import sharedStyles from './MaintenanceShared.module.css';

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  scheduledEnd: string | null;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [status, setStatus] = useState<MaintenanceStatus>({ enabled: false, message: '', scheduledEnd: null });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ message: '', scheduledEnd: '' });
  const [runs, setRuns] = useState<RunEntry[]>([]);

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

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=maintenance&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  }, []);

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

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Control site-wide maintenance mode with a custom message — real enforcement now, not just a stored flag.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Fixed critical bug in this build</h4>
        <p>Toggling maintenance mode ON here previously had <strong>zero effect</strong> on the public site — <code>isMaintenanceMode()</code> had no real callers anywhere. Fixed via a new public status endpoint and real middleware enforcement (see Governance tab for the full explanation). <code>scheduledEnd</code> is now also auto-expired for real instead of being stored and ignored forever.</p>
      </div>

      {loading ? <div className={styles.empty}>Loading...</div> : (
        <div className={sharedStyles.subSection}>
          <h4>Input / Process / Output</h4>
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
      )}

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
