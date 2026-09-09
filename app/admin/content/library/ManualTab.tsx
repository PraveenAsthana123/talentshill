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
