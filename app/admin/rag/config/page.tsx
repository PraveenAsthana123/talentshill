'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import styles from './AdminRagConfig.module.css';

interface RagConfigData {
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: string;
  retrievalK: number;
  rerankEnabled: boolean;
  piiRedactionEnabled: boolean;
}

interface RagConfigVersion {
  id: string;
  name: string;
  version: number;
  config: RagConfigData;
  isActive: boolean;
  changedBy: string | null;
  createdAt: string;
}

interface RagConfigResponse {
  active: RagConfigVersion | null;
  history: RagConfigVersion[];
}

const DEFAULT_FORM: { name: string } & RagConfigData = {
  name: '',
  chunkSize: 512,
  chunkOverlap: 50,
  embeddingModel: 'dummy-384',
  retrievalK: 10,
  rerankEnabled: false,
  piiRedactionEnabled: false,
};

export default function AdminRagConfigPage() {
  const [active, setActive] = useState<RagConfigVersion | null>(null);
  const [history, setHistory] = useState<RagConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rag/config');
      const data: RagConfigResponse = await res.json();
      setActive(data.active || null);
      setHistory(data.history || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/admin/rag/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          config: {
            chunkSize: form.chunkSize,
            chunkOverlap: form.chunkOverlap,
            embeddingModel: form.embeddingModel,
            retrievalK: form.retrievalK,
            rerankEnabled: form.rerankEnabled,
            piiRedactionEnabled: form.piiRedactionEnabled,
          },
        }),
      });
      setForm(DEFAULT_FORM);
      fetchConfig();
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleActivate = async (id: string) => {
    setActivating(id);
    try {
      await fetch('/api/admin/rag/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchConfig();
    } catch { /* empty */ }
    setActivating(null);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString();
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>Loading RAG configuration...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <SectionHeader
        label="RAG"
        title="Configuration"
        subtitle="Manage RAG pipeline settings and version history."
      />

      <Link href="/admin/rag" className={styles.backLink}>&#8592; Back to RAG Dashboard</Link>

      {/* Active Configuration */}
      {active ? (
        <div className={styles.activeCard}>
          <h3>Active Configuration</h3>
          <div className={styles.activeCardMeta}>
            {active.name} &middot; v{active.version}
            {active.changedBy && <> &middot; by {active.changedBy}</>}
            {' '}&middot; {formatDate(active.createdAt)}
          </div>
          <div className={styles.configGrid}>
            <div className={styles.configItem}>
              <div className={styles.configKey}>Chunk Size</div>
              <div className={styles.configValue}>{active.config.chunkSize}</div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configKey}>Chunk Overlap</div>
              <div className={styles.configValue}>{active.config.chunkOverlap}</div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configKey}>Embedding Model</div>
              <div className={styles.configValue}>{active.config.embeddingModel}</div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configKey}>Retrieval K</div>
              <div className={styles.configValue}>{active.config.retrievalK}</div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configKey}>Rerank Enabled</div>
              <div className={styles.configValue}>{active.config.rerankEnabled ? 'Yes' : 'No'}</div>
            </div>
            <div className={styles.configItem}>
              <div className={styles.configKey}>PII Redaction</div>
              <div className={styles.configValue}>{active.config.piiRedactionEnabled ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.activeCard}>
          <div className={styles.empty}>No active configuration. Create one below.</div>
        </div>
      )}

      {/* Create New Version Form */}
      <div className={styles.formSection}>
        <h3>Create New Version</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name</label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="e.g. Production v2"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Chunk Size</label>
            <input
              className={styles.formInput}
              type="number"
              value={form.chunkSize}
              onChange={(e) => setForm((p) => ({ ...p, chunkSize: Number(e.target.value) }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Chunk Overlap</label>
            <input
              className={styles.formInput}
              type="number"
              value={form.chunkOverlap}
              onChange={(e) => setForm((p) => ({ ...p, chunkOverlap: Number(e.target.value) }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Embedding Model</label>
            <input
              className={styles.formInput}
              type="text"
              value={form.embeddingModel}
              onChange={(e) => setForm((p) => ({ ...p, embeddingModel: e.target.value }))}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Retrieval K</label>
            <input
              className={styles.formInput}
              type="number"
              value={form.retrievalK}
              onChange={(e) => setForm((p) => ({ ...p, retrievalK: Number(e.target.value) }))}
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formCheckboxGroup}>
              <input
                className={styles.formCheckbox}
                type="checkbox"
                id="rerankEnabled"
                checked={form.rerankEnabled}
                onChange={(e) => setForm((p) => ({ ...p, rerankEnabled: e.target.checked }))}
              />
              <label className={styles.formCheckboxLabel} htmlFor="rerankEnabled">Rerank Enabled</label>
            </div>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.formCheckboxGroup}>
              <input
                className={styles.formCheckbox}
                type="checkbox"
                id="piiRedactionEnabled"
                checked={form.piiRedactionEnabled}
                onChange={(e) => setForm((p) => ({ ...p, piiRedactionEnabled: e.target.checked }))}
              />
              <label className={styles.formCheckboxLabel} htmlFor="piiRedactionEnabled">PII Redaction Enabled</label>
            </div>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleCreate}
            disabled={saving || !form.name.trim()}
          >
            {saving ? 'Saving...' : 'Create Version'}
          </button>
        </div>
      </div>

      {/* Version History */}
      <h3 className={styles.sectionTitle}>Version History</h3>
      <div className={styles.tableWrap}>
        {history.length === 0 ? (
          <div className={styles.empty}>No configuration versions yet.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Version</th>
                <th>Created</th>
                <th>Changed By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((ver) => (
                <tr key={ver.id}>
                  <td className={styles.nameCell}>{ver.name}</td>
                  <td className={styles.versionCell}>v{ver.version}</td>
                  <td className={styles.dateCell}>{formatDate(ver.createdAt)}</td>
                  <td className={styles.dateCell}>{ver.changedBy || '\u2014'}</td>
                  <td>
                    {ver.isActive ? (
                      <span className={`${styles.statusBadge} ${styles.activeBadge}`}>Active</span>
                    ) : null}
                  </td>
                  <td>
                    {!ver.isActive && (
                      <button
                        className={`${styles.btn} ${styles.btnSmall}`}
                        onClick={() => handleActivate(ver.id)}
                        disabled={activating === ver.id}
                      >
                        {activating === ver.id ? 'Activating...' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
