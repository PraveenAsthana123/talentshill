'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';
import styles from './AdminSettings.module.css';

interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}

const SETTING_GROUPS = [
  {
    label: 'General',
    keys: ['site_name', 'site_description', 'contact_email'],
  },
  {
    label: 'Social Links',
    keys: ['social_linkedin', 'social_facebook', 'social_whatsapp'],
  },
  {
    label: 'Features',
    keys: ['feature_blog', 'feature_survey', 'feature_chatbot', 'feature_booking'],
  },
];

export default function AdminSettingsPage() {
  const addToast = useUIStore((s) => s.addToast);
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

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
    } catch {
      addToast({ type: 'error', message: 'Failed to update setting.' });
    }
    setSaving(null);
  };

  if (loading) return <div className={styles.page}><p>Loading settings...</p></div>;

  return (
    <div className={styles.page}>
      <div className="container section">
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Manage site configuration and feature toggles.</p>

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
      </div>
    </div>
  );
}
