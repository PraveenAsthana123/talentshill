'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from '../AdminRagDocuments.module.css';

interface DocumentDetail {
  id: string;
  name: string;
  sourceType: string;
  status: string;
  size: number;
  url: string | null;
  chunkCount: number;
  createdAt: string;
}

interface Chunk {
  id: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
}

const CHUNK_LIMIT = 20;

export default function AdminRagDocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [chunkTotal, setChunkTotal] = useState(0);
  const [chunkOffset, setChunkOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/rag/documents/${id}`)
      .then((r) => r.json())
      .then((data) => setDoc(data.document || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('limit', String(CHUNK_LIMIT));
    params.set('offset', String(chunkOffset));
    fetch(`/api/admin/rag/documents/${id}/chunks?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setChunks(data.chunks || []);
        setChunkTotal(data.total || 0);
      })
      .catch(() => {});
  }, [id, chunkOffset]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const chunkPages = Math.ceil(chunkTotal / CHUNK_LIMIT);
  const chunkPage = Math.floor(chunkOffset / CHUNK_LIMIT) + 1;

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Loading document...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Document not found.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link href="/admin/rag/documents" className={styles.backLink}>&#8592; Back to Documents</Link>

      <h1
        style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-heading)',
          marginBottom: 'var(--space-6)',
        }}
      >
        {doc.name}
      </h1>

      {/* Metadata Card */}
      <div className={styles.uploadCard}>
        <h3 className={styles.uploadTitle}>Document Metadata</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Name</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-semibold)' }}>{doc.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Source Type</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', textTransform: 'capitalize' }}>{doc.sourceType}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Status</div>
            <span className={`${styles.statusBadge} ${statusClass(doc.status)}`}>{doc.status}</span>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Size</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontFamily: 'monospace' }}>{formatSize(doc.size)}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Chunks</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontWeight: 'var(--font-weight-bold)' }}>{doc.chunkCount}</div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>Created</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{new Date(doc.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Chunk Browser */}
      <h2
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--color-heading)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Chunks ({chunkTotal})
      </h2>

      <div className={styles.tableWrap}>
        {chunks.length === 0 ? (
          <div className={styles.empty}>No chunks available.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Index</th>
                <th>Content Preview</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {chunks.map((chunk) => (
                <tr key={chunk.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'var(--font-weight-bold)' }}>
                    {chunk.chunkIndex}
                  </td>
                  <td style={{ maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chunk.content.length > 200 ? chunk.content.slice(0, 200) + '...' : chunk.content}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{chunk.tokenCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Chunk Pagination */}
      {chunkPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChunkOffset(Math.max(0, chunkOffset - CHUNK_LIMIT))}
            disabled={chunkOffset === 0}
          >
            Previous
          </Button>
          <span className={styles.pageInfo}>
            Page {chunkPage} of {chunkPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setChunkOffset(chunkOffset + CHUNK_LIMIT)}
            disabled={chunkOffset + CHUNK_LIMIT >= chunkTotal}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
