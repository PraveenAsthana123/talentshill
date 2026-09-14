'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminAdsManagement.module.css';
import sharedStyles from './AdsManagementShared.module.css';

interface Campaign {
  id: string; name: string; platform: string; status: string; objective: string | null;
  budget: number | null; spend: number | null; readinessScore: number | null; createdAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }
interface MetricEntry { id: string; recordedDate: string; impressions: number; clicks: number; conversions: number; revenue: number; spendForPeriod: number }

const PLATFORMS = ['google', 'meta', 'linkedin', 'tiktok', 'other'];

export default function ManualTab() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('google');
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [metricsCampaignId, setMetricsCampaignId] = useState('');
  const [metricEntries, setMetricEntries] = useState<MetricEntry[]>([]);
  const [impressions, setImpressions] = useState('');
  const [clicks, setClicks] = useState('');
  const [conversions, setConversions] = useState('');
  const [revenue, setRevenue] = useState('');
  const [spendForPeriod, setSpendForPeriod] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads-management');
      const data = await res.json();
      setItems(data.items || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=ads_management&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await fetch('/api/admin/ads-management', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), platform, objective: objective.trim() || undefined, budget: budget ? Number(budget) : undefined }),
    });
    setName(''); setObjective(''); setBudget(''); setShowForm(false);
    fetchItems(); loadRuns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/admin/ads-management/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  const loadMetrics = async (campaignId: string) => {
    if (!campaignId) { setMetricEntries([]); return; }
    const res = await fetch(`/api/admin/ads-management/metrics/?campaignId=${campaignId}`);
    const data = await res.json().catch(() => ({ entries: [] }));
    setMetricEntries(data.entries || []);
  };

  const handleLogMetrics = async () => {
    if (!metricsCampaignId) return;
    await fetch('/api/admin/ads-management/metrics/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: metricsCampaignId,
        recordedDate: new Date().toISOString(),
        impressions: impressions ? Number(impressions) : 0,
        clicks: clicks ? Number(clicks) : 0,
        conversions: conversions ? Number(conversions) : 0,
        revenue: revenue ? Number(revenue) : 0,
        spendForPeriod: spendForPeriod ? Number(spendForPeriod) : 0,
      }),
    });
    setImpressions(''); setClicks(''); setConversions(''); setRevenue(''); setSpendForPeriod('');
    loadMetrics(metricsCampaignId);
  };

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/ads-management/share-link/', { method: 'POST' });
    const data = await res.json().catch(() => null);
    if (data?.url) setShareUrl(data.url);
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track ad campaigns across platforms — real local CRUD. No ad-platform API sync exists (Google Ads/Meta/LinkedIn/TikTok) — spend is manually entered, not pulled live. See Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Set a real objective and budget before running readiness scoring</li><li>Attach a creative URL and define the target audience for a campaign to score well</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Campaign'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Platform</label>
              <select className={styles.formInput} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className={styles.formLabel}>Objective</label><input className={styles.formInput} value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. lead_gen" /></div>
            <div><label className={styles.formLabel}>Budget ($)</label><input className={styles.formInput} type="number" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!name.trim()}>Create Campaign</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No campaigns yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Platform</th><th>Status</th><th>Budget</th><th>Spend</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className={styles.nameCell}>{c.name}</td>
                  <td>{c.platform}</td>
                  <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
                  <td>{c.budget != null ? `$${c.budget}` : '—'}</td>
                  <td>{c.spend != null ? `$${c.spend}` : '—'}</td>
                  <td>{c.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
        <h4>Log real campaign performance metrics</h4>
        <p>Manually entered from the ad platform&apos;s own reporting UI — no live sync exists. These figures ground the Budget Optimization pipeline (Pipeline / Agentic tabs); campaigns with no entries here are excluded from ranking, never scored with invented numbers.</p>
        <select className={styles.formInput} value={metricsCampaignId} onChange={(e) => { setMetricsCampaignId(e.target.value); loadMetrics(e.target.value); }}>
          <option value="">Select a campaign...</option>
          {items.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>)}
        </select>
        {metricsCampaignId && (
          <>
            <div className={styles.formGrid} style={{ marginTop: 'var(--space-3)' }}>
              <div><label className={styles.formLabel}>Impressions</label><input className={styles.formInput} type="number" value={impressions} onChange={(e) => setImpressions(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Clicks</label><input className={styles.formInput} type="number" value={clicks} onChange={(e) => setClicks(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Conversions</label><input className={styles.formInput} type="number" value={conversions} onChange={(e) => setConversions(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Revenue ($)</label><input className={styles.formInput} type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Spend for period ($)</label><input className={styles.formInput} type="number" value={spendForPeriod} onChange={(e) => setSpendForPeriod(e.target.value)} /></div>
            </div>
            <div className={styles.formActions}><Button onClick={handleLogMetrics}>Log Metrics Entry</Button></div>
            <table className={sharedStyles.table} style={{ marginTop: 'var(--space-3)' }}>
              <thead><tr><th>Date</th><th>Impressions</th><th>Clicks</th><th>Conversions</th><th>Revenue</th><th>Spend</th></tr></thead>
              <tbody>
                {metricEntries.length === 0 && <tr><td colSpan={6} className={sharedStyles.empty}>No metric entries yet for this campaign.</td></tr>}
                {metricEntries.map((m) => (
                  <tr key={m.id}><td>{new Date(m.recordedDate).toLocaleDateString()}</td><td>{m.impressions}</td><td>{m.clicks}</td><td>{m.conversions}</td><td>${m.revenue}</td><td>${m.spendForPeriod}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Customer self-service report link</h4>
        <p>Generates a token-gated, read-only budget-optimization report a client can open without an admin login. No customer-account system exists yet — this is a shareable link, not a client portal.</p>
        <div className={styles.formActions}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
        {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
      </div>

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
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
