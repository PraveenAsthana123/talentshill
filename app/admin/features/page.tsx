'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminFeatures.module.css';

interface Flag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  module: string | null;
  isEnabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface VersionEntry {
  id: string;
  flagId: string;
  version: number;
  config: string | null;
  changedBy: string | null;
  changedAt: string;
}

export default function AdminFeaturesPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [historyFlagId, setHistoryFlagId] = useState<string | null>(null);
  const [historyFlagName, setHistoryFlagName] = useState('');
  const [history, setHistory] = useState<VersionEntry[]>([]);
  const [form, setForm] = useState({ key: '', label: '', description: '', module: '' });

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/features');
      const data = await res.json();
      setFlags(data.flags || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleToggle = async (flag: Flag) => {
    await fetch('/api/admin/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle', id: flag.id, isEnabled: !flag.isEnabled }),
    });
    fetchFlags();
  };

  const handleCreate = async () => {
    if (!form.key || !form.label) return;
    await fetch('/api/admin/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...form }),
    });
    setForm({ key: '', label: '', description: '', module: '' });
    setShowCreate(false);
    fetchFlags();
  };

  const handleShowHistory = async (flag: Flag) => {
    setHistoryFlagId(flag.id);
    setHistoryFlagName(flag.label);
    try {
      const res = await fetch(`/api/admin/features/${flag.id}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch { /* empty */ }
  };

  const handleRollback = async (versionId: string) => {
    if (!historyFlagId) return;
    await fetch(`/api/admin/features/${historyFlagId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rollback', versionId }),
    });
    setHistoryFlagId(null);
    fetchFlags();
  };

  const handleBustCache = async () => {
    await fetch('/api/admin/features/bust-cache', { method: 'POST' });
  };

  const modules = Array.from(new Set(flags.map(f => f.module).filter(Boolean))) as string[];
  const filtered = moduleFilter ? flags.filter(f => f.module === moduleFilter) : flags;
  const enabledCount = flags.filter(f => f.isEnabled).length;

  return (
    <div className={styles.page}>
      <SectionHeader label="System" title="Feature Flags" subtitle="Toggle features on/off with version history and rollback." />

      <div className={styles.statsRow}>
        <div className={styles.statBadge}>
          <span className={styles.statValue}>{flags.length}</span>
          <span className={styles.statLabel}>Total Flags</span>
        </div>
        <div className={styles.statBadge}>
          <span className={styles.statValue}>{enabledCount}</span>
          <span className={styles.statLabel}>Enabled</span>
        </div>
        <div className={styles.statBadge}>
          <span className={styles.statValue}>{flags.length - enabledCount}</span>
          <span className={styles.statLabel}>Disabled</span>
        </div>
      </div>

      <div className={styles.topActions}>
        {!showCreate && !historyFlagId && (
          <Button size="sm" onClick={() => setShowCreate(true)}>Create Flag</Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleBustCache}>Bust Cache</Button>
      </div>

      {showCreate && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Create New Flag</div>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.formLabel}>Key</label>
              <input className={styles.formInput} placeholder="e.g. new_feature" value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} />
            </div>
            <div>
              <label className={styles.formLabel}>Label</label>
              <input className={styles.formInput} placeholder="e.g. New Feature" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} />
            </div>
            <div>
              <label className={styles.formLabel}>Description</label>
              <input className={styles.formInput} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className={styles.formLabel}>Module</label>
              <input className={styles.formInput} placeholder="e.g. content, marketing" value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      {historyFlagId && (
        <div className={styles.historyPanel}>
          <div className={styles.historyTitle}>Version History: {historyFlagName}</div>
          {history.length === 0 ? (
            <div className={styles.empty}>No version history yet.</div>
          ) : (
            <div className={styles.historyList}>
              {history.map(v => (
                <div key={v.id} className={styles.historyItem}>
                  <span className={styles.historyVersion}>v{v.version}</span>
                  <span className={styles.historyConfig}>{v.config || '—'}</span>
                  <span className={styles.historyDate}>
                    {new Date(typeof v.changedAt === 'number' ? v.changedAt * 1000 : v.changedAt).toLocaleString()}
                  </span>
                  <button className={styles.rollbackBtn} onClick={() => handleRollback(v.id)}>Rollback</button>
                </div>
              ))}
            </div>
          )}
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setHistoryFlagId(null)}>Close</Button>
          </div>
        </div>
      )}

      {modules.length > 0 && (
        <div className={styles.moduleFilter}>
          <button className={cn(styles.filterBtn, !moduleFilter && styles.filterBtnActive)} onClick={() => setModuleFilter(null)}>All</button>
          {modules.map(mod => (
            <button key={mod} className={cn(styles.filterBtn, moduleFilter === mod && styles.filterBtnActive)} onClick={() => setModuleFilter(mod)}>
              {mod}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No flags found.</div>
      ) : (
        <div className={styles.flagGrid}>
          {filtered.map(flag => (
            <div key={flag.id} className={cn(styles.flagCard, !flag.isEnabled && styles.flagCardDisabled)}>
              <div className={styles.flagHeader}>
                <div className={styles.flagInfo}>
                  <div className={styles.flagLabel}>{flag.label}</div>
                  <div className={styles.flagKey}>{flag.key}</div>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" className={styles.toggleInput} checked={flag.isEnabled} onChange={() => handleToggle(flag)} />
                  <span className={styles.toggleTrack} />
                  <span className={styles.toggleKnob} />
                </label>
              </div>
              {flag.description && <div className={styles.flagDesc}>{flag.description}</div>}
              <div className={styles.flagMeta}>
                {flag.module && <span className={styles.moduleBadge}>{flag.module}</span>}
                <button className={styles.historyBtn} onClick={() => handleShowHistory(flag)}>History</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
