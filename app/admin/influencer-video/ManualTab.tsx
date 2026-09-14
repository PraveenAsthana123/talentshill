'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminInfluencerVideo.module.css';
import sharedStyles from './InfluencerVideoShared.module.css';

interface Campaign { id: string; influencerName: string; platform: string; status: string; agreedFee: number | null; contactEmail: string | null; audienceFitScore: number | null; campaignFeedbackNotes: string | null; readinessScore: number | null; createdAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }
interface MetricEntry { id: string; recordedDate: string; reach: number; clicks: number; sales: number; revenue: number }

const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'linkedin', 'other'];

export default function ManualTab() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [influencerName, setInfluencerName] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contactEmail, setContactEmail] = useState('');
  const [audienceFitScore, setAudienceFitScore] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [metricsCampaignId, setMetricsCampaignId] = useState('');
  const [metricEntries, setMetricEntries] = useState<MetricEntry[]>([]);
  const [reach, setReach] = useState('');
  const [clicks, setClicks] = useState('');
  const [sales, setSales] = useState('');
  const [revenue, setRevenue] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const [searchPlatform, setSearchPlatform] = useState('');
  const [searchMinFit, setSearchMinFit] = useState('');
  const [searchResults, setSearchResults] = useState<Campaign[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/influencer-video'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=influencer_video&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!influencerName.trim()) return;
    await fetch('/api/admin/influencer-video', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        influencerName: influencerName.trim(), platform, contactEmail: contactEmail.trim() || undefined,
        audienceFitScore: audienceFitScore ? Number(audienceFitScore) : undefined,
      }),
    });
    setInfluencerName(''); setContactEmail(''); setAudienceFitScore(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/admin/influencer-video/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  const loadMetrics = async (campaignId: string) => {
    if (!campaignId) { setMetricEntries([]); return; }
    const res = await fetch(`/api/admin/influencer-video/metrics/?campaignId=${campaignId}`);
    const data = await res.json().catch(() => ({ entries: [] }));
    setMetricEntries(data.entries || []);
    const campaign = items.find((c) => c.id === campaignId);
    setFeedbackNotes(campaign?.campaignFeedbackNotes || '');
  };

  const handleLogMetrics = async () => {
    if (!metricsCampaignId) return;
    await fetch('/api/admin/influencer-video/metrics/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: metricsCampaignId, recordedDate: new Date().toISOString(),
        reach: reach ? Number(reach) : 0, clicks: clicks ? Number(clicks) : 0,
        sales: sales ? Number(sales) : 0, revenue: revenue ? Number(revenue) : 0,
      }),
    });
    setReach(''); setClicks(''); setSales(''); setRevenue('');
    loadMetrics(metricsCampaignId);
  };

  const handleSaveFeedback = async () => {
    if (!metricsCampaignId) return;
    await fetch(`/api/admin/influencer-video/${metricsCampaignId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignFeedbackNotes: feedbackNotes }),
    });
    fetchItems();
  };

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/influencer-video/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (searchPlatform) params.set('platform', searchPlatform);
    if (searchMinFit) params.set('minAudienceFitScore', searchMinFit);
    const res = await fetch(`/api/admin/influencer-video/creator-search/?${params.toString()}`);
    const d = await res.json().catch(() => ({ results: [] }));
    setSearchResults(d.results || []);
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track influencer partnerships and deliverables — real local CRUD. Contact email is real PII collected for a real business purpose (partnership coordination); see Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Enter a real contact email and define deliverables before moving past &apos;prospecting&apos;</li><li>Set the agreed fee once status reaches &apos;active&apos;</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Campaign'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Influencer Name</label><input className={styles.formInput} value={influencerName} onChange={(e) => setInfluencerName(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Platform</label>
              <select className={styles.formInput} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className={styles.formLabel}>Contact Email</label><input className={styles.formInput} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Audience Fit Score (0-100)</label><input className={styles.formInput} type="number" min="0" max="100" value={audienceFitScore} onChange={(e) => setAudienceFitScore(e.target.value)} placeholder="Real assessment, not auto-computed" /></div>
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!influencerName.trim()}>Create Campaign</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No campaigns yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Influencer</th><th>Platform</th><th>Status</th><th>Fee</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className={styles.nameCell}>{c.influencerName}</td>
                  <td>{c.platform}</td>
                  <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
                  <td>{c.agreedFee != null ? `$${c.agreedFee}` : '—'}</td>
                  <td>{c.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(c.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
        <h4>Log real creator performance &amp; feedback</h4>
        <p>Manually entered from the platform&apos;s own analytics — no live social-platform sync exists. Grounds the ROI pipeline (Pipeline/Agentic tabs) and the sentiment agent.</p>
        <select className={styles.formInput} value={metricsCampaignId} onChange={(e) => { setMetricsCampaignId(e.target.value); loadMetrics(e.target.value); }}>
          <option value="">Select a campaign...</option>
          {items.map((c) => <option key={c.id} value={c.id}>{c.influencerName} ({c.platform})</option>)}
        </select>
        {metricsCampaignId && (
          <>
            <div className={styles.formGrid} style={{ marginTop: 'var(--space-3)' }}>
              <div><label className={styles.formLabel}>Reach</label><input className={styles.formInput} type="number" value={reach} onChange={(e) => setReach(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Clicks</label><input className={styles.formInput} type="number" value={clicks} onChange={(e) => setClicks(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Sales</label><input className={styles.formInput} type="number" value={sales} onChange={(e) => setSales(e.target.value)} /></div>
              <div><label className={styles.formLabel}>Revenue ($)</label><input className={styles.formInput} type="number" value={revenue} onChange={(e) => setRevenue(e.target.value)} /></div>
            </div>
            <div className={styles.formActions}><Button onClick={handleLogMetrics}>Log Metrics Entry</Button></div>
            <table className={sharedStyles.table} style={{ marginTop: 'var(--space-3)' }}>
              <thead><tr><th>Date</th><th>Reach</th><th>Clicks</th><th>Sales</th><th>Revenue</th></tr></thead>
              <tbody>
                {metricEntries.length === 0 && <tr><td colSpan={5} className={sharedStyles.empty}>No metric entries yet for this campaign.</td></tr>}
                {metricEntries.map((m) => (
                  <tr key={m.id}><td>{new Date(m.recordedDate).toLocaleDateString()}</td><td>{m.reach}</td><td>{m.clicks}</td><td>{m.sales}</td><td>${m.revenue}</td></tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label className={styles.formLabel}>Real campaign feedback / comments (grounds sentiment analysis)</label>
              <textarea className={styles.formInput} rows={3} value={feedbackNotes} onChange={(e) => setFeedbackNotes(e.target.value)} placeholder="Real client or audience feedback text..." />
              <div className={styles.formActions}><Button onClick={handleSaveFeedback}>Save Feedback Notes</Button></div>
            </div>
          </>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Creator discovery (search real prospecting-stage creators)</h4>
        <p>Searches this repo&apos;s own creator records — no third-party creator-database integration exists.</p>
        <div className={styles.formGrid}>
          <div><label className={styles.formLabel}>Platform</label>
            <select className={styles.formInput} value={searchPlatform} onChange={(e) => setSearchPlatform(e.target.value)}>
              <option value="">Any</option>
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div><label className={styles.formLabel}>Min Audience Fit</label><input className={styles.formInput} type="number" value={searchMinFit} onChange={(e) => setSearchMinFit(e.target.value)} /></div>
        </div>
        <div className={styles.formActions}><Button onClick={handleSearch}>Search</Button></div>
        {searchResults.length > 0 && (
          <table className={sharedStyles.table}>
            <thead><tr><th>Influencer</th><th>Platform</th><th>Audience Fit</th></tr></thead>
            <tbody>{searchResults.map((c) => <tr key={c.id}><td>{c.influencerName}</td><td>{c.platform}</td><td>{c.audienceFitScore ?? '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Customer self-service report link</h4>
        <p>Generates a token-gated, read-only creator ROI report a client can open without an admin login.</p>
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
