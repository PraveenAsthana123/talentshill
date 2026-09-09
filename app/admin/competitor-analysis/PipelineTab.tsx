'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Input, Select } from '@/components/ui/Input';
import styles from './AdminCompetitorAnalysis.module.css';

interface ServiceRow { id: string; name: string; category: string }

interface StageResult {
  stage: string;
  input: unknown;
  process: string;
  output: unknown;
  status: 'ok' | 'skipped' | 'failed';
}

interface RunEntry {
  id: string;
  operationName: string;
  status: string;
  outputPayload: Record<string, unknown> | null;
  triggeredBy: string | null;
  createdAt: string;
}

export default function PipelineTab() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [form, setForm] = useState({ serviceId: '', competitorName: '', competitorWebsite: '' });
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=competitor_analysis&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] }))
      .then((d) => setRuns(d.runs || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/services/').then((r) => (r.ok ? r.json() : { services: [] })).then((d) => setServices(d.services || [])).catch(() => {});
    loadRuns();
  }, []);

  const runPipeline = async () => {
    if (!form.serviceId || !form.competitorName) {
      setError('Service and competitor name are required.');
      return;
    }
    setRunning(true);
    setError('');
    setStages(null);
    try {
      const res = await fetch('/api/admin/competitor-analysis/pipeline/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages);
      loadRuns();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Same operation as the Manual tab (create a real competitor research entry), run end-to-end via a deterministic scripted pipeline instead of a human filling in every field.</p>
        <p><strong>Honest scope:</strong> this pipeline can only fetch and extract what's mechanically available (a competitor's own page title/meta description via a real HTTP request) -- it does not generate pricing, strengths/weaknesses, or sample deliverables, since those require real judgment. Every pipeline-created entry stays in <code>needs_research</code> status for a human to complete.</p>
      </div>

      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select
          label="Service"
          options={services.map((s) => ({ value: s.id, label: `${s.name} (${s.category})` }))}
          placeholder="Select a service..."
          value={form.serviceId}
          onChange={(ev) => setForm({ ...form, serviceId: ev.target.value })}
        />
        <Input label="Competitor name" value={form.competitorName} onChange={(ev) => setForm({ ...form, competitorName: ev.target.value })} />
        <Input label="Competitor website (optional, real HTTP fetch)" value={form.competitorWebsite} onChange={(ev) => setForm({ ...form, competitorWebsite: ev.target.value })} placeholder="https://..." />
        <div className={styles.formActions}>
          <Button onClick={runPipeline} disabled={running}>{running ? 'Running…' : 'Run Pipeline'}</Button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {stages && (
        <div className={styles.subSection}>
          <h4>Process (real stage-by-stage execution)</h4>
          <table className={styles.table}>
            <thead><tr><th>Stage</th><th>Process</th><th>Output</th><th>Status</th></tr></thead>
            <tbody>
              {stages.map((s, i) => (
                <tr key={i}>
                  <td>{s.stage}</td>
                  <td>{s.process}</td>
                  <td><code>{JSON.stringify(s.output)}</code></td>
                  <td><Badge variant={s.status === 'ok' ? 'success' : s.status === 'skipped' ? 'default' : 'error'}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.subSection}>
        <h4>Output</h4>
        <p className={styles.empty}>Pipeline-created entries appear in the Manual tab's list alongside manually-created ones, with status <code>needs_research</code>.</p>
      </div>

      <div className={styles.subSection}>
        <h4>Transactional history (real pipeline runs, timestamped)</h4>
        {runs.length === 0 && <p className={styles.empty}>No pipeline runs yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Status</th><th>By</th></tr></thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge></td>
                <td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
