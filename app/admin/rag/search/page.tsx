'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import styles from './AdminRagSearch.module.css';

interface SearchResult {
  chunkId: string;
  content: string;
  score: number;
  documentName?: string;
}

interface SearchConfig {
  k: number;
  vectorWeight: number;
  keywordWeight: number;
  rerankEnabled: boolean;
  lambda?: number;
}

interface SearchResponse {
  query: string;
  config: SearchConfig;
  results: SearchResult[];
  totalResults: number;
}

export default function AdminRagSearchPage() {
  const [query, setQuery] = useState('');
  const [k, setK] = useState(10);
  const [vectorWeight, setVectorWeight] = useState(0.7);
  const [keywordWeight, setKeywordWeight] = useState(0.3);
  const [rerankEnabled, setRerankEnabled] = useState(false);
  const [lambda, setLambda] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const body: Record<string, unknown> = {
        query: query.trim(),
        k,
        vectorWeight,
        keywordWeight,
        rerankEnabled,
      };
      if (rerankEnabled) {
        body.lambda = lambda;
      }
      const res = await fetch('/api/admin/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResponse(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSearch();
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader
        label="RAG"
        title="Search Playground"
        subtitle="Test retrieval queries against your document collection."
      />

      <Link href="/admin/rag" className={styles.backLink}>&#8592; Back to RAG Dashboard</Link>

      {/* Search Form */}
      <div className={styles.searchForm}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="search-query">Query</label>
          <textarea
            id="search-query"
            className={styles.queryInput}
            rows={3}
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Advanced Settings Toggle */}
        <button
          className={styles.advancedToggle}
          onClick={() => setShowAdvanced(!showAdvanced)}
          type="button"
        >
          {showAdvanced ? '\u25B2' : '\u25BC'} Advanced Settings
        </button>

        {showAdvanced && (
          <div className={styles.advancedSection}>
            <div className={styles.advancedGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="search-k">Top K Results</label>
                <input
                  id="search-k"
                  className={styles.formInput}
                  type="number"
                  value={k}
                  onChange={(e) => setK(Number(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="search-vector-weight">Vector Weight</label>
                <input
                  id="search-vector-weight"
                  className={styles.formInput}
                  type="number"
                  value={vectorWeight}
                  onChange={(e) => setVectorWeight(Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="search-keyword-weight">Keyword Weight</label>
                <input
                  id="search-keyword-weight"
                  className={styles.formInput}
                  type="number"
                  value={keywordWeight}
                  onChange={(e) => setKeywordWeight(Number(e.target.value))}
                  step={0.1}
                  min={0}
                  max={1}
                />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.formCheckboxGroup}>
                  <input
                    id="search-rerank"
                    className={styles.formCheckbox}
                    type="checkbox"
                    checked={rerankEnabled}
                    onChange={(e) => setRerankEnabled(e.target.checked)}
                  />
                  <label className={styles.formLabel} htmlFor="search-rerank">Enable MMR Reranking</label>
                </div>
              </div>

              {rerankEnabled && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel} htmlFor="search-lambda">MMR Lambda</label>
                  <input
                    id="search-lambda"
                    className={styles.formInput}
                    type="number"
                    value={lambda}
                    onChange={(e) => setLambda(Number(e.target.value))}
                    step={0.1}
                    min={0}
                    max={1}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <button
          className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSearch}`}
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          type="button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loading}>Searching documents...</div>
      )}

      {/* Results */}
      {response && !loading && (
        <div>
          <div className={styles.resultsSummary}>
            Found {response.totalResults} result{response.totalResults !== 1 ? 's' : ''} for &lsquo;{response.query}&rsquo;
          </div>

          <div className={styles.configUsed}>
            Config: k={response.config.k}, vectorWeight={response.config.vectorWeight}, keywordWeight={response.config.keywordWeight}, rerank={response.config.rerankEnabled ? 'on' : 'off'}
            {response.config.rerankEnabled && response.config.lambda !== undefined && `, lambda=${response.config.lambda}`}
          </div>

          {response.results.length === 0 ? (
            <div className={styles.empty}>No matching results found. Try adjusting your query or search parameters.</div>
          ) : (
            <div className={styles.resultsList}>
              {response.results.map((result, idx) => (
                <div key={result.chunkId} className={styles.resultCard}>
                  <div className={styles.resultRank}>#{idx + 1}</div>
                  <div className={styles.resultBody}>
                    <div className={styles.resultScore}>
                      Score: {result.score.toFixed(4)}
                    </div>
                    {result.documentName && (
                      <div className={styles.resultDocName}>{result.documentName}</div>
                    )}
                    <div className={styles.resultContent}>
                      {result.content.length > 300
                        ? result.content.slice(0, 300) + '...'
                        : result.content}
                    </div>
                    <div className={styles.resultMeta}>
                      Chunk ID: <span className={styles.chunkId}>{result.chunkId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State (before any search) */}
      {!response && !loading && (
        <div className={styles.empty}>Enter a query above and click Search to test retrieval.</div>
      )}
    </div>
  );
}
