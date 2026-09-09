'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';
import type { BlogAdminStats } from '@/types';
import styles from './AdminBlog.module.css';
import sharedStyles from './BlogShared.module.css';

interface PostRow {
  id: string; title: string; slug: string; status: string; featured: boolean | null;
  categories: { name: string }[]; viewCount: number; publishedAt: string | null; updatedAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [stats, setStats] = useState<BlogAdminStats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ offset: String(page * limit), limit: String(limit) });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const [postsRes, statsRes, rRes] = await Promise.all([
        fetch(`/api/admin/blog/posts?${params}`),
        fetch('/api/admin/blog/stats'),
        fetch('/api/admin/operation-runs/?moduleKey=blog&executionMode=manual&limit=20'),
      ]);

      const postsData = await postsRes.json();
      const statsData = await statsRes.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setPosts(postsData.posts || []);
      setTotal(postsData.total || 0);
      setStats(statsData.stats || null);
      setRuns(rData.runs || []);
    } catch { setPosts([]); }
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' });
    fetchData();
  };
  const handlePublish = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'published' ? 'unpublish' : 'publish';
    await fetch(`/api/admin/blog/posts/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    fetchData();
  };
  const statusClass = (s: string) => {
    switch (s) { case 'published': return styles.statusPublished; case 'draft': return styles.statusDraft; case 'archived': return styles.statusArchived; default: return ''; }
  };
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage blog content end-to-end: draft, edit, publish/unpublish, and delete posts, with real view/subscriber analytics.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Draft posts, then run Pipeline or Agentic readiness scoring before publishing</li><li>Publish only posts with real title/summary/content substance</li><li>Track views and subscriber growth</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.totalPosts}</div><div className={styles.statLabel}>Total Posts</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.published}</div><div className={styles.statLabel}>Published</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.drafts}</div><div className={styles.statLabel}>Drafts</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.totalViews}</div><div className={styles.statLabel}>Total Views</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.subscriberCount}</div><div className={styles.statLabel}>Subscribers</div></div>
          </div>
        )}

        <div className={styles.toolbar}>
          <input className={styles.searchInput} placeholder="Search posts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <option value="all">All Statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
          </select>
          <Link href="/admin/blog/new"><Button variant="primary" size="sm">New Post</Button></Link>
        </div>

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : posts.length === 0 ? <div className={styles.empty}>No posts found.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.titleCell}>{p.title}{p.featured && <span className={styles.featuredBadge} style={{ marginLeft: 8 }}>Featured</span>}</td>
                    <td className={styles.categoryCell}>{p.categories.map((c) => c.name).join(', ') || '—'}</td>
                    <td><span className={cn(styles.statusBadge, statusClass(p.status))}>{p.status}</span></td>
                    <td>{p.viewCount}</td>
                    <td>{formatDate(p.updatedAt)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/blog/${p.id}`} className={styles.actionLink}>Edit</Link>
                        <Link href={`/admin/blog/${p.id}/preview`} className={styles.actionLink}>Preview</Link>
                        <button className={styles.actionLink} onClick={() => handlePublish(p.id, p.status)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(p.id, p.title)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
            <span className={styles.pageInfo}>Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
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
