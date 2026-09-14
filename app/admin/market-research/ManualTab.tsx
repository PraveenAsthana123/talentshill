'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminMarketResearch.module.css';
import sharedStyles from './MarketResearchShared.module.css';

interface Brief {
  id: string; title: string; topic: string; status: string; sourceNotes: string | null; findings: string | null;
  readinessScore: number | null; createdAt: string;
  somEstimateUsd: number | null; competitionLevel: string | null; riskLevel: string | null; strategicFitScore: number | null;
  opportunityScore: number | null; opportunityRank: number | null;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [items, setItems] = useState<Brief[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [sourceNotes, setSourceNotes] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [somInput, setSomInput] = useState('');
  const [competitionInput, setCompetitionInput] = useState('medium');
  const [riskInput, setRiskInput] = useState('medium');
  const [fitInput, setFitInput] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/market-research'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=market_research&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!title.trim() || !topic.trim()) return;
    await fetch('/api/admin/market-research', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), topic: topic.trim(), sourceNotes: sourceNotes.trim() || undefined }),
    });
    setTitle(''); setTopic(''); setSourceNotes(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brief?')) return;
    await fetch(`/api/admin/market-research/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  const startEditOpportunity = (b: Brief) => {
    setEditingId(b.id);
    setSomInput(b.somEstimateUsd !== null ? String(b.somEstimateUsd) : '');
    setCompetitionInput(b.competitionLevel ?? 'medium');
    setRiskInput(b.riskLevel ?? 'medium');
    setFitInput(b.strategicFitScore !== null ? String(b.strategicFitScore) : '');
  };
  const cancelEditOpportunity = () => setEditingId(null);
  const saveOpportunityInputs = async (id: string) => {
    const som = Number(somInput);
    const fit = Number(fitInput);
    if (!somInput.trim() || Number.isNaN(som) || som < 0) return;
    if (!fitInput.trim() || Number.isNaN(fit) || fit < 0 || fit > 100) return;
    await fetch(`/api/admin/market-research/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ somEstimateUsd: som, competitionLevel: competitionInput, riskLevel: riskInput, strategicFitScore: fit }),
    });
    setEditingId(null);
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Real research briefs grounded in analyst-provided source notes — distinct from the existing Competitor Analysis module. Findings are never fabricated; the Agentic tab synthesizes only from what you enter here. Enter real market-sizing/competition/risk/strategic-fit inputs below so the Pipeline tab can compute a real opportunity score and rank each brief against the others.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul>
          <li>Enter real, substantive source notes (&gt;50 chars) before running readiness scoring or synthesis</li>
          <li>Never paste unverified market statistics as if they were confirmed findings</li>
          <li>Enter your own real SOM estimate, competition level, risk level, and strategic-fit judgment before running Opportunity Scoring — the pipeline never estimates these itself</li>
        </ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Brief'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Topic</label><input className={styles.formInput} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. enterprise RAG adoption" /></div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className={styles.formLabel}>Source notes (real research input)</label>
            <textarea className={styles.formInput} rows={4} value={sourceNotes} onChange={(e) => setSourceNotes(e.target.value)} />
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!title.trim() || !topic.trim()}>Create Brief</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No briefs yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Topic</th><th>Status</th><th>Readiness</th><th>Opportunity Score</th><th>Rank</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((b) => (
                <>
                  <tr key={b.id}>
                    <td className={styles.nameCell}>{b.title}</td>
                    <td>{b.topic}</td>
                    <td><Badge variant={b.status === 'published' ? 'success' : 'default'}>{b.status}</Badge></td>
                    <td>{b.readinessScore ?? '—'}</td>
                    <td>{b.opportunityScore ?? '—'}</td>
                    <td>{b.opportunityRank ?? '—'}</td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => (editingId === b.id ? cancelEditOpportunity() : startEditOpportunity(b))}>
                        {editingId === b.id ? 'Close' : 'Opportunity Inputs'}
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(b.id)}>Delete</button>
                    </td>
                  </tr>
                  {editingId === b.id && (
                    <tr key={`${b.id}-edit`}>
                      <td colSpan={7}>
                        <div className={styles.formCard} style={{ margin: 0 }}>
                          <div className={styles.formGrid}>
                            <div>
                              <label className={styles.formLabel}>SOM estimate (USD, your real research number)</label>
                              <input className={styles.formInput} type="number" min={0} value={somInput} onChange={(e) => setSomInput(e.target.value)} placeholder="e.g. 500000" />
                            </div>
                            <div>
                              <label className={styles.formLabel}>Strategic fit (0-100, your judgment)</label>
                              <input className={styles.formInput} type="number" min={0} max={100} value={fitInput} onChange={(e) => setFitInput(e.target.value)} />
                            </div>
                            <div>
                              <label className={styles.formLabel}>Competition level</label>
                              <select className={styles.formInput} value={competitionInput} onChange={(e) => setCompetitionInput(e.target.value)}>
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                              </select>
                            </div>
                            <div>
                              <label className={styles.formLabel}>Risk level</label>
                              <select className={styles.formInput} value={riskInput} onChange={(e) => setRiskInput(e.target.value)}>
                                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                              </select>
                            </div>
                          </div>
                          <div className={styles.formActions}>
                            <Button variant="secondary" onClick={cancelEditOpportunity}>Cancel</Button>
                            <Button onClick={() => saveOpportunityInputs(b.id)} disabled={!somInput.trim() || !fitInput.trim()}>Save Inputs</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
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
