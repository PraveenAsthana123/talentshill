'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminShareLinks.module.css';

interface ShareLink {
  id: string;
  title: string;
  originalUrl: string;
  shortCode: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

const LIMIT = 25;

export default function AdminShareLinksPage() {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [copied, setCopied] = useState<string>('');

  // Create form state
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(LIMIT), offset: String(offset) });
      if (activeFilter !== 'all') params.set('isActive', activeFilter);
      const res = await fetch(`/api/admin/links?${params}`);
      const data = await res.json();
      setLinks(data.items || []);
      setTotal(data.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, [offset, activeFilter]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formUrl.trim()) return;
    setCreating(true);
    try {
      await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle, originalUrl: formUrl,
          utmSource: utmSource || undefined, utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined, utmTerm: utmTerm || undefined,
          utmContent: utmContent || undefined,
        }),
      });
      setFormTitle(''); setFormUrl('');
      setUtmSource(''); setUtmMedium(''); setUtmCampaign(''); setUtmTerm(''); setUtmContent('');
      setShowForm(false);
      fetchLinks();
    } catch { /* empty */ }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this share link?')) return;
    try {
      await fetch(`/api/admin/links/${id}`, { method: 'DELETE' });
      fetchLinks();
    } catch { /* empty */ }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchLinks();
    } catch { /* empty */ }
  };

  const copyLink = (shortCode: string) => {
    const url = `${window.location.origin}/api/s/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopied(shortCode);
    setTimeout(() => setCopied(''), 2000);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Share Links" subtitle="Create short links with UTM tracking for campaigns." />

      <div className={styles.toolbar}>
        <Button size="sm" variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Link'}
        </Button>
        <select className={styles.filterSelect} value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setOffset(0); }}>
          <option value="all">All Links</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {showForm && (
        <div className={styles.createCard}>
          <h3 className={styles.createTitle}>Create Share Link</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}><label className={styles.label}>Title</label><input className={styles.input} value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Link name..." /></div>
            <div className={styles.field}><label className={styles.label}>Destination URL</label><input className={styles.input} value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://..." /></div>
          </div>
          <h4 className={styles.utmTitle}>UTM Parameters</h4>
          <div className={styles.utmGrid}>
            <div className={styles.field}><label className={styles.label}>Source</label><input className={styles.input} value={utmSource} onChange={(e) => setUtmSource(e.target.value)} placeholder="e.g. newsletter" /></div>
            <div className={styles.field}><label className={styles.label}>Medium</label><input className={styles.input} value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} placeholder="e.g. email" /></div>
            <div className={styles.field}><label className={styles.label}>Campaign</label><input className={styles.input} value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="e.g. spring-sale" /></div>
            <div className={styles.field}><label className={styles.label}>Term</label><input className={styles.input} value={utmTerm} onChange={(e) => setUtmTerm(e.target.value)} placeholder="optional" /></div>
            <div className={styles.field}><label className={styles.label}>Content</label><input className={styles.input} value={utmContent} onChange={(e) => setUtmContent(e.target.value)} placeholder="optional" /></div>
          </div>
          <Button variant="primary" onClick={handleCreate} disabled={creating || !formTitle.trim() || !formUrl.trim()}>
            {creating ? 'Creating...' : 'Create Link'}
          </Button>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Loading links...</div>
        ) : links.length === 0 ? (
          <div className={styles.empty}>No share links found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Short URL</th>
                <th>UTM</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td className={styles.titleCell}>{link.title}</td>
                  <td>
                    <button className={styles.copyBtn} onClick={() => copyLink(link.shortCode)}>
                      /s/{link.shortCode} {copied === link.shortCode ? '(copied!)' : ''}
                    </button>
                  </td>
                  <td className={styles.utmCell}>
                    {[link.utmSource, link.utmMedium, link.utmCampaign].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className={styles.clickCell}>{link.clickCount}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${link.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={styles.dateCell}>{new Date(link.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.actionBtn} onClick={() => handleToggle(link.id, link.isActive)}>
                      {link.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(link.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
