'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminContentLibrary.module.css';
import sharedStyles from './ContentShared.module.css';

interface ContentItem {
  id: string;
  title: string;
  contentType: string;
  status: string;
  category: string | null;
  updatedAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }
interface Persona { id: string; name: string; description: string; toneNotes: string | null }
interface Topic { id: string; title: string; targetContentType: string; personaId: string | null; scheduledDate: string | null; status: string; generatedContentId: string | null }
interface EngagementEntry { id: string; recordedDate: string; views: number; leadsGenerated: number }

const TYPE_TABS = ['all', 'article', 'brochure_text', 'ppt_text', 'email_copy', 'social_post', 'landing_page'] as const;
const STATUS_OPTIONS = ['all', 'draft', 'review', 'approved', 'published', 'archived'] as const;
const LIMIT = 24;

export default function ManualTab() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaName, setPersonaName] = useState('');
  const [personaDescription, setPersonaDescription] = useState('');
  const [personaTone, setPersonaTone] = useState('');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicType, setTopicType] = useState('article');
  const [topicPersonaId, setTopicPersonaId] = useState('');
  const [topicScheduledDate, setTopicScheduledDate] = useState('');
  const [generatingTopicId, setGeneratingTopicId] = useState('');

  const [engagementContentId, setEngagementContentId] = useState('');
  const [engagementEntries, setEngagementEntries] = useState<EngagementEntry[]>([]);
  const [views, setViews] = useState('');
  const [leadsGenerated, setLeadsGenerated] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const fetchPersonas = async () => {
    const res = await fetch('/api/admin/content/personas/');
    const d = await res.json().catch(() => ({ items: [] }));
    setPersonas(d.items || []);
  };
  const fetchTopics = async () => {
    const res = await fetch('/api/admin/content/topics/');
    const d = await res.json().catch(() => ({ items: [] }));
    setTopics(d.items || []);
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim() || !personaDescription.trim()) return;
    await fetch('/api/admin/content/personas/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: personaName.trim(), description: personaDescription.trim(), toneNotes: personaTone.trim() || undefined }),
    });
    setPersonaName(''); setPersonaDescription(''); setPersonaTone('');
    fetchPersonas();
  };
  const handleDeletePersona = async (id: string) => {
    await fetch(`/api/admin/content/personas/${id}`, { method: 'DELETE' });
    fetchPersonas();
  };

  const handleCreateTopic = async () => {
    if (!topicTitle.trim()) return;
    await fetch('/api/admin/content/topics/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: topicTitle.trim(), targetContentType: topicType,
        personaId: topicPersonaId || undefined,
        scheduledDate: topicScheduledDate || undefined,
      }),
    });
    setTopicTitle(''); setTopicScheduledDate('');
    fetchTopics();
  };
  const handleGenerate = async (topicId: string) => {
    setGeneratingTopicId(topicId);
    try {
      await fetch(`/api/admin/content/topics/${topicId}/generate/`, { method: 'POST' });
      fetchTopics(); fetchItems();
    } finally {
      setGeneratingTopicId('');
    }
  };

  const loadEngagement = async (contentId: string) => {
    if (!contentId) { setEngagementEntries([]); return; }
    const res = await fetch(`/api/admin/content/engagement/?contentId=${contentId}`);
    const d = await res.json().catch(() => ({ entries: [] }));
    setEngagementEntries(d.entries || []);
  };
  const handleLogEngagement = async () => {
    if (!engagementContentId) return;
    await fetch('/api/admin/content/engagement/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentId: engagementContentId, recordedDate: new Date().toISOString(),
        views: views ? Number(views) : 0, leadsGenerated: leadsGenerated ? Number(leadsGenerated) : 0,
      }),
    });
    setViews(''); setLeadsGenerated('');
    loadEngagement(engagementContentId);
  };

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/content/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('contentType', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      params.set('limit', String(LIMIT));
      params.set('offset', String(offset));
      const res = await fetch(`/api/admin/content?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [typeFilter, statusFilter, search, offset]);

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=content&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
    fetchPersonas();
    fetchTopics();
  }, []);

  const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, review: styles.statusReview, approved: styles.statusApproved,
      published: styles.statusPublished, archived: styles.statusArchived,
    };
    return map[s] || styles.statusDraft;
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Create and manage marketing content across all channels — real create/edit/publish/delete control.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Write a substantial body, excerpt, category, tags, and cover image</li><li>Run Pipeline or Agentic readiness scoring before relying on content being publish-ready</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        <div className={styles.toolbar}>
          <Link href="/admin/content/editor/new">
            <Button size="sm" variant="primary">+ New Content</Button>
          </Link>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          />
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className={styles.tabs}>
          {TYPE_TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${typeFilter === tab ? styles.tabActive : ''}`}
              onClick={() => { setTypeFilter(tab); setOffset(0); }}
            >
              {tab === 'all' ? 'All' : typeLabel(tab)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.empty}>Loading content...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No content found. Create your first piece of content.</div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <Link key={item.id} href={`/admin/content/editor/${item.id}`} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.typeBadge}>{typeLabel(item.contentType)}</span>
                  <span className={`${styles.statusBadge} ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                {item.category && <span className={styles.cardCategory}>{item.category}</span>}
                <span className={styles.cardDate}>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button size="sm" variant="ghost" onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>Previous</Button>
            <span className={styles.pageInfo}>Page {currentPage} of {totalPages} ({total} total)</span>
            <Button size="sm" variant="ghost" onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}>Next</Button>
          </div>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>AI Content Factory: personas</h4>
        <p>Real, admin-written target-audience descriptions — grounds AI-generated drafts, never fabricated from nothing.</p>
        <input className={styles.searchInput} placeholder="Persona name" value={personaName} onChange={(e) => setPersonaName(e.target.value)} />
        <input className={styles.searchInput} placeholder="Description (real target audience)" value={personaDescription} onChange={(e) => setPersonaDescription(e.target.value)} />
        <input className={styles.searchInput} placeholder="Tone notes (optional)" value={personaTone} onChange={(e) => setPersonaTone(e.target.value)} />
        <Button size="sm" onClick={handleCreatePersona}>Add Persona</Button>
        <table className={sharedStyles.table} style={{ marginTop: 'var(--space-3)' }}>
          <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {personas.length === 0 && <tr><td colSpan={3} className={sharedStyles.empty}>No personas yet.</td></tr>}
            {personas.map((p) => <tr key={p.id}><td>{p.name}</td><td>{p.description}</td><td><button onClick={() => handleDeletePersona(p.id)}>Delete</button></td></tr>)}
          </tbody>
        </table>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>AI Content Factory: editorial calendar</h4>
        <p>Propose a topic, optionally attach a persona and schedule date, then generate a real AI draft — always status=&apos;draft&apos;, always requires human review before publish.</p>
        <input className={styles.searchInput} placeholder="Topic title" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} />
        <select className={styles.select} value={topicType} onChange={(e) => setTopicType(e.target.value)}>
          {TYPE_TABS.filter((t) => t !== 'all').map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
        <select className={styles.select} value={topicPersonaId} onChange={(e) => setTopicPersonaId(e.target.value)}>
          <option value="">No persona</option>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className={styles.searchInput} type="date" value={topicScheduledDate} onChange={(e) => setTopicScheduledDate(e.target.value)} />
        <Button size="sm" onClick={handleCreateTopic}>Add Topic</Button>
        <table className={sharedStyles.table} style={{ marginTop: 'var(--space-3)' }}>
          <thead><tr><th>Title</th><th>Type</th><th>Scheduled</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {topics.length === 0 && <tr><td colSpan={5} className={sharedStyles.empty}>No topics yet.</td></tr>}
            {topics.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td><td>{t.targetContentType}</td>
                <td>{t.scheduledDate ? new Date(t.scheduledDate).toLocaleDateString() : '—'}</td>
                <td><Badge variant={t.status === 'generated' ? 'success' : 'default'}>{t.status}</Badge></td>
                <td>
                  {t.status === 'proposed' || t.status === 'scheduled' ? (
                    <Button size="sm" onClick={() => handleGenerate(t.id)} disabled={generatingTopicId === t.id}>{generatingTopicId === t.id ? 'Generating…' : 'Generate Draft'}</Button>
                  ) : t.generatedContentId ? (
                    <Link href={`/admin/content/editor/${t.generatedContentId}`}>Review draft</Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Log real content engagement</h4>
        <p>Manually entered — no live analytics-platform sync exists. Grounds the Performance pipeline (Pipeline/Agentic tabs).</p>
        <select className={styles.select} value={engagementContentId} onChange={(e) => { setEngagementContentId(e.target.value); loadEngagement(e.target.value); }}>
          <option value="">Select content...</option>
          {items.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {engagementContentId && (
          <>
            <input className={styles.searchInput} type="number" placeholder="Views" value={views} onChange={(e) => setViews(e.target.value)} />
            <input className={styles.searchInput} type="number" placeholder="Leads generated" value={leadsGenerated} onChange={(e) => setLeadsGenerated(e.target.value)} />
            <Button size="sm" onClick={handleLogEngagement}>Log Entry</Button>
            <table className={sharedStyles.table} style={{ marginTop: 'var(--space-3)' }}>
              <thead><tr><th>Date</th><th>Views</th><th>Leads</th></tr></thead>
              <tbody>
                {engagementEntries.length === 0 && <tr><td colSpan={3} className={sharedStyles.empty}>No entries yet.</td></tr>}
                {engagementEntries.map((e) => <tr key={e.id}><td>{new Date(e.recordedDate).toLocaleDateString()}</td><td>{e.views}</td><td>{e.leadsGenerated}</td></tr>)}
              </tbody>
            </table>
          </>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Customer self-service report link</h4>
        <div className={sharedStyles.formActions}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
        {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
      </div>

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
