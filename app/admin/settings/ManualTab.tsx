'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/ui-store';
import { Badge } from '@/components/ui';
import styles from './AdminSettings.module.css';
import sharedStyles from './SettingsShared.module.css';

interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const SETTING_GROUPS = [
  { label: 'General', keys: ['site_name', 'site_description', 'contact_email'] },
  { label: 'Social Links', keys: ['social_linkedin', 'social_facebook', 'social_whatsapp'] },
];

export default function ManualTab() {
  const addToast = useUIStore((s) => s.addToast);
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=settings&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, Setting> = {};
        (data.settings || []).forEach((s: Setting) => { map[s.key] = s; });
        setSettings(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    loadRuns();
  }, []);

  const handleSave = async (key: string, value: unknown) => {
    setSaving(key);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error();
      addToast({ type: 'success', message: `Setting "${key}" updated.` });
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value, updatedAt: new Date().toISOString() },
      }));
      loadRuns();
    } catch {
      addToast({ type: 'error', message: 'Failed to update setting.' });
    }
    setSaving(null);
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage site configuration. Social Links are now read by the real public Footer; General fields are not yet wired to public output (see Governance). Feature enable/disable moved to the real <Link href="/admin/features">Feature Flags</Link> page — this page previously had its own separate, disconnected feature_* toggles writing to a different table that nothing read.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Set real Social Links here to actually change the public footer</li><li>Run Pipeline or Agentic integrity scoring on a setting to check its format and whether it&apos;s wired to real public output</li></ul>
      </div>

      {SETTING_GROUPS.map((group) => (
        <div key={group.label} className={styles.group}>
          <h2 className={styles.groupTitle}>{group.label}</h2>
          <div className={styles.settingsList}>
            {group.keys.map((key) => {
              const setting = settings[key];
              const value = setting?.value;
              const isBoolean = typeof value === 'boolean';

              return (
                <div key={key} className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingKey}>{key.replace(/_/g, ' ')}</div>
                  </div>
                  {isBoolean ? (
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => handleSave(key, e.target.checked)}
                      />
                      <span className={styles.toggleSlider} />
                    </label>
                  ) : (
                    <div className={styles.settingInput}>
                      <input
                        className={styles.input}
                        defaultValue={String(value || '')}
                        onBlur={(e) => {
                          if (e.target.value !== String(value || '')) {
                            handleSave(key, e.target.value);
                          }
                        }}
                      />
                    </div>
                  )}
                  {saving === key && <span className={styles.savingLabel}>Saving...</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

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
