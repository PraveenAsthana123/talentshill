'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminBrochures.module.css';

interface Asset { id: string; title: string; status: string; description: string | null; createdAt: string; updatedAt: string; }

const STATUS_TABS = ['all', 'draft', 'review', 'approved', 'published'] as const;
const LIMIT = 24;

export default function AdminBrochuresPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ assetType: 'brochure', limit: String(LIMIT), offset: String(offset) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/admin/assets?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [statusFilter, offset]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, assetType: 'brochure', slides: [{ index: 1, title: 'Cover', htmlContent: '<h1>Cover Page</h1>', layout: 'full', notes: '' }] }),
      });
      const data = await res.json();
      if (data.id) { setTitle(''); fetchItems(); }
    } catch { /* empty */ }
    setCreating(false);
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = { draft: styles.statusDraft, review: styles.statusReview, approved: styles.statusApproved, published: styles.statusPublished };
    return map[s] || styles.statusDraft;
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Brochures" subtitle="Create and manage multi-page brochures." />

      <div className={styles.createBar}>
        <input className={styles.input} placeholder="New brochure title..." value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button size="sm" variant="primary" onClick={handleCreate} disabled={creating || !title.trim()}>
          {creating ? 'Creating...' : '+ Create Brochure'}
        </Button>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button key={tab} className={`${styles.tab} ${statusFilter === tab ? styles.tabActive : ''}`} onClick={() => { setStatusFilter(tab); setOffset(0); }}>
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading brochures...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No brochures found. Create your first brochure above.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <Link key={item.id} href={`/admin/content/brochures/${item.id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={`${styles.statusBadge} ${statusClass(item.status)}`}>{item.status}</span>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              {item.description && <p className={styles.cardDesc}>{item.description}</p>}
              <span className={styles.cardDate}>{new Date(item.updatedAt).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button size="sm" variant="ghost" onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>Previous</Button>
          <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
          <Button size="sm" variant="ghost" onClick={() => setOffset(offset + LIMIT)} disabled={offset + LIMIT >= total}>Next</Button>
        </div>
      )}
    </div>
  );
}
