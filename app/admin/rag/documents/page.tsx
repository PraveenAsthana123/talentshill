'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminRagDocuments.module.css';

interface RagDocument {
  id: string;
  name: string;
  sourceType: string;
  status: string;
  chunkCount: number;
  size: number;
  createdAt: string;
}

const STATUS_TABS = ['all', 'pending', 'ingested', 'chunked', 'embedded', 'failed'] as const;
const LIMIT = 25;

export default function AdminRagDocumentsPage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [offset, setOffset] = useState(0);

  // Upload form state
  const [uploadName, setUploadName] = useState('');
  const [uploadSourceType, setUploadSourceType] = useState<string>('upload');
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', String(LIMIT));
      params.set('offset', String(offset));
      const res = await fetch(`/api/admin/rag/documents?${params}`);
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotal(data.total || 0);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchDocuments(); }, [statusFilter, offset]);

  const handleUpload = async () => {
    if (!uploadName) return;
    setUploading(true);
    try {
      await fetch('/api/admin/rag/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: uploadName,
          sourceType: uploadSourceType,
          url: (uploadSourceType === 'url' || uploadSourceType === 'sitepage') ? uploadUrl : undefined,
        }),
      });
      setUploadName('');
      setUploadUrl('');
      setUploadSourceType('upload');
      fetchDocuments();
    } catch { /* empty */ }
    setUploading(false);
  };

  const handleIngest = async (docId: string) => {
    try {
      await fetch(`/api/admin/rag/documents/${docId}/ingest`, { method: 'POST' });
      fetchDocuments();
    } catch { /* empty */ }
  };

  const handleEmbed = async (docId: string) => {
    try {
      await fetch(`/api/admin/rag/documents/${docId}/embed`, { method: 'POST' });
      fetchDocuments();
    } catch { /* empty */ }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document and all its chunks?')) return;
    try {
      await fetch(`/api/admin/rag/documents/${docId}`, { method: 'DELETE' });
      fetchDocuments();
    } catch { /* empty */ }
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      ingested: styles.statusIngested,
      chunked: styles.statusChunked,
      embedded: styles.statusEmbedded,
      failed: styles.statusFailed,
    };
    return map[s] || styles.statusPending;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className={styles.page}>
      <SectionHeader
        label="RAG"
        title="Documents"
        subtitle="Upload and manage documents for the RAG pipeline."
      />

      <Link href="/admin/rag" className={styles.backLink}>&#8592; Back to RAG Dashboard</Link>

      {/* Upload Form */}
      <div className={styles.uploadCard}>
        <h3 className={styles.uploadTitle}>Add Document</h3>
        <div className={styles.uploadForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Document name"
            value={uploadName}
            onChange={(e) => setUploadName(e.target.value)}
          />
          <select
            className={styles.select}
            value={uploadSourceType}
            onChange={(e) => setUploadSourceType(e.target.value)}
          >
            <option value="upload">File Upload</option>
            <option value="url">URL</option>
            <option value="sitepage">Site Page</option>
          </select>
          {(uploadSourceType === 'url' || uploadSourceType === 'sitepage') && (
            <input
              className={styles.input}
              type="url"
              placeholder={uploadSourceType === 'url' ? 'https://example.com/doc.pdf' : 'https://example.com/page'}
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
            />
          )}
          <Button size="sm" variant="primary" onClick={handleUpload} disabled={uploading || !uploadName}>
            {uploading ? 'Uploading...' : 'Add Document'}
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className={styles.tabs}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${statusFilter === tab ? styles.tabActive : ''}`}
            onClick={() => { setStatusFilter(tab); setOffset(0); }}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Document Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className={styles.empty}>No documents found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Status</th>
                <th>Chunks</th>
                <th>Size</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className={styles.nameCell}>
                    <Link href={`/admin/rag/documents/${doc.id}`} className={styles.docLink}>
                      {doc.name}
                    </Link>
                  </td>
                  <td className={styles.sourceCell}>{doc.sourceType}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${statusClass(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.chunkCount}</td>
                  <td className={styles.sizeCell}>{formatSize(doc.size)}</td>
                  <td className={styles.dateCell}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  <td className={styles.actionsCell}>
                    {(doc.status === 'pending' || doc.status === 'failed') && (
                      <button className={styles.actionBtn} onClick={() => handleIngest(doc.id)}>
                        Ingest
                      </button>
                    )}
                    {doc.status === 'chunked' && (
                      <button className={styles.actionBtn} onClick={() => handleEmbed(doc.id)}>
                        Embed
                      </button>
                    )}
                    <button
                      className={`${styles.actionBtn} ${styles.actionDelete}`}
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages} ({total} total)
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setOffset(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
