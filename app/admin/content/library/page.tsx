'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminContentLibrary.module.css';

interface ContentItem {
  id: string;
  title: string;
  contentType: string;
  status: string;
  category: string | null;
  updatedAt: string;
}

const TYPE_TABS = ['all', 'article', 'brochure_text', 'ppt_text', 'email_copy', 'social_post', 'landing_page'] as const;
const STATUS_OPTIONS = ['all', 'draft', 'review', 'approved', 'published', 'archived'] as const;
const LIMIT = 24;

export default function AdminContentLibraryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);

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
    <div className={styles.page}>
      <SectionHeader
        label="Marketing"
        title="Content Library"
        subtitle="Create and manage marketing content across all channels."
      />

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
  );
}
