'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminMedia.module.css';
import sharedStyles from './MediaShared.module.css';

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  folder: string | null;
  createdAt: string;
}

interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ManualTab() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      setItems(data.media || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=media&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => { fetchMedia(); }, [search]);
  useEffect(() => { loadRuns(); }, []);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      await fetch('/api/admin/media', { method: 'POST', body: formData });
    }
    setUploading(false);
    fetchMedia();
    loadRuns();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
    fetchMedia();
    loadRuns();
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Upload, browse, and delete media files (images, PDFs, docs) — real disk storage under a sanitized upload directory, real DB-backed metadata.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Uploads are rejected if the folder path attempts to escape the upload directory (path traversal fix — see Governance tab)</li><li>Run Pipeline or Agentic integrity scoring after upload to confirm the file landed correctly on disk</li></ul>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={e => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      <div
        className={styles.uploadZone}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <div className={styles.uploadText}>Drag & drop files here or click to browse</div>
        <div className={styles.uploadHint}>Max 10MB per file. Images, PDFs, docs supported.</div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No files uploaded yet.</div>
      ) : (
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.id} className={styles.mediaCard}>
              <div className={styles.preview}>
                {isImage(item.mimeType) ? (
                  <img src={item.url} alt={item.alt || item.originalName} />
                ) : (
                  <span className={styles.filePlaceholder}>{item.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                )}
              </div>
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{item.originalName}</div>
                <div className={styles.cardMeta}>
                  {formatBytes(item.size)}
                  <button style={{ marginLeft: 'var(--space-2)', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }} onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
