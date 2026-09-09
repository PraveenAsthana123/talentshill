'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Badge, Button } from '@/components/ui';
import { Input, Textarea, Select } from '@/components/ui/Input';
import styles from './AdminCompetitorAnalysis.module.css';

interface ServiceRow {
  id: string;
  name: string;
  category: string;
}

interface Deliverable { name: string; description: string }

interface CompetitorEntry {
  id: string;
  serviceId: string;
  competitorName: string;
  competitorWebsite: string | null;
  offeringSummary: string | null;
  pricingNotes: string | null;
  strengthsWeaknesses: string | null;
  sampleDeliverables: Deliverable[];
  status: 'needs_research' | 'researched' | 'monitoring';
  isTemplate: boolean;
  lastResearchedAt: string | null;
}

const STATUS_VARIANT: Record<CompetitorEntry['status'], 'warning' | 'success' | 'accent'> = {
  needs_research: 'warning',
  researched: 'success',
  monitoring: 'accent',
};

const STATUS_OPTIONS = [
  { value: 'needs_research', label: 'Needs research' },
  { value: 'researched', label: 'Researched' },
  { value: 'monitoring', label: 'Monitoring' },
];

const emptyForm = {
  serviceId: '', competitorName: '', competitorWebsite: '', offeringSummary: '',
  pricingNotes: '', strengthsWeaknesses: '', status: 'needs_research', deliverablesText: '',
};

function deliverablesToText(d: Deliverable[]): string {
  return d.map((x) => `${x.name} :: ${x.description}`).join('\n');
}

function textToDeliverables(text: string): Deliverable[] {
  return text.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [name, ...rest] = line.split('::');
    return { name: (name || '').trim(), description: rest.join('::').trim() };
  });
}

export default function CompetitorAnalysisPage() {
  const [entries, setEntries] = useState<CompetitorEntry[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/competitor-analysis').then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch('/api/admin/services').then((r) => (r.ok ? r.json() : { services: [] })).catch(() => ({ services: [] })),
    ])
      .then(([competitorData, serviceData]) => {
        setEntries(competitorData.entries);
        setServices(serviceData.services || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const serviceName = (id: string) => services.find((s) => s.id === id)?.name || id;
  const templateCount = entries.filter((e) => e.isTemplate).length;
  const realCount = entries.length - templateCount;

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (e: CompetitorEntry) => {
    setEditingId(e.id);
    setForm({
      serviceId: e.serviceId,
      competitorName: e.competitorName,
      competitorWebsite: e.competitorWebsite || '',
      offeringSummary: e.offeringSummary || '',
      pricingNotes: e.pricingNotes || '',
      strengthsWeaknesses: e.strengthsWeaknesses || '',
      status: e.status,
      deliverablesText: deliverablesToText(e.sampleDeliverables),
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitForm = async () => {
    if (!form.serviceId || !form.competitorName) {
      setError('Service and competitor name are required.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      serviceId: form.serviceId,
      competitorName: form.competitorName,
      competitorWebsite: form.competitorWebsite || undefined,
      offeringSummary: form.offeringSummary || undefined,
      pricingNotes: form.pricingNotes || undefined,
      strengthsWeaknesses: form.strengthsWeaknesses || undefined,
      status: form.status,
      sampleDeliverables: textToDeliverables(form.deliverablesText),
    };
    try {
      const url = editingId ? `/api/admin/competitor-analysis/${editingId}` : '/api/admin/competitor-analysis';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      cancelForm();
      load();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this competitor analysis entry?')) return;
    try {
      const res = await fetch(`/api/admin/competitor-analysis/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      load();
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <SectionHeader
          title="Competitor Analysis"
          subtitle="Admin-only market-research intelligence — never shown to customers. Add, edit, and remove real research per service."
        />
        <Button onClick={startCreate}>+ Add Entry</Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {showForm && (
        <div className={styles.formCard}>
          <h3>{editingId ? 'Edit entry' : 'New competitor entry'}</h3>
          <Select
            label="Service"
            options={services.map((s) => ({ value: s.id, label: `${s.name} (${s.category})` }))}
            placeholder="Select a service..."
            value={form.serviceId}
            onChange={(ev) => setForm({ ...form, serviceId: ev.target.value })}
          />
          <Input label="Competitor name" value={form.competitorName} onChange={(ev) => setForm({ ...form, competitorName: ev.target.value })} />
          <Input label="Competitor website" value={form.competitorWebsite} onChange={(ev) => setForm({ ...form, competitorWebsite: ev.target.value })} />
          <Textarea label="Offering summary" rows={2} value={form.offeringSummary} onChange={(ev) => setForm({ ...form, offeringSummary: ev.target.value })} />
          <Textarea label="Pricing notes" rows={2} value={form.pricingNotes} onChange={(ev) => setForm({ ...form, pricingNotes: ev.target.value })} />
          <Textarea label="Strengths / weaknesses" rows={2} value={form.strengthsWeaknesses} onChange={(ev) => setForm({ ...form, strengthsWeaknesses: ev.target.value })} />
          <Textarea
            label="Sample deliverables (one per line: name :: description)"
            rows={3}
            value={form.deliverablesText}
            onChange={(ev) => setForm({ ...form, deliverablesText: ev.target.value })}
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(ev) => setForm({ ...form, status: ev.target.value })}
          />
          <div className={styles.formActions}>
            <Button onClick={submitForm} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create entry'}</Button>
            <Button variant="outline" onClick={cancelForm}>Cancel</Button>
          </div>
        </div>
      )}

      {loading && <p>Loading…</p>}

      {!loading && (
        <>
          <div className={styles.summary}>
            <span>{realCount} real research {realCount === 1 ? 'entry' : 'entries'}</span>
            {templateCount > 0 && <span className={styles.templateNote}>{templateCount} template row (structure example, not real research)</span>}
          </div>

          {entries.length === 0 && <p className={styles.empty}>No competitor research recorded yet.</p>}

          <div className={styles.list}>
            {entries.map((e) => (
              <div key={e.id} className={e.isTemplate ? styles.templateCard : styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <strong>{e.competitorName}</strong>
                    {e.isTemplate && <span className={styles.templateBadge}>TEMPLATE — not real data</span>}
                    <div className={styles.serviceLabel}>{serviceName(e.serviceId)}</div>
                  </div>
                  <div className={styles.cardHeaderRight}>
                    <Badge variant={STATUS_VARIANT[e.status]}>{e.status.replace('_', ' ')}</Badge>
                    <button className={styles.iconBtn} onClick={() => startEdit(e)} aria-label="Edit">✏️</button>
                    <button className={styles.iconBtn} onClick={() => deleteEntry(e.id)} aria-label="Delete">🗑️</button>
                  </div>
                </div>
                {e.competitorWebsite && <div className={styles.field}><span>Website:</span> {e.competitorWebsite}</div>}
                {e.offeringSummary && <div className={styles.field}><span>Offering:</span> {e.offeringSummary}</div>}
                {e.pricingNotes && <div className={styles.field}><span>Pricing:</span> {e.pricingNotes}</div>}
                {e.strengthsWeaknesses && <div className={styles.field}><span>Strengths/Weaknesses:</span> {e.strengthsWeaknesses}</div>}
                {e.sampleDeliverables.length > 0 && (
                  <div className={styles.field}>
                    <span>Sample deliverables we&apos;d offer:</span>
                    <ul>
                      {e.sampleDeliverables.map((d) => (
                        <li key={d.name}><strong>{d.name}</strong>: {d.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
