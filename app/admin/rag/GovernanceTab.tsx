'use client';

import { Tabs } from '@/components/ui';
import styles from './RagShared.module.css';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className={styles.subSection}><h4>{title}</h4>{children}</div>;
}

const SUB_TABS = [
  { id: 'resai', label: 'ResAI', content: (<>
    <Section title="Research AI">
      <p>The Agentic tab is real retrieval-augmented generation: real hybrid search (vector + BM25 fusion) over real local-Ollama embeddings, then a real Ollama synthesis step instructed to answer only from retrieved context. See Agentic/Testing tabs for live-verified evidence.</p>
    </Section>
    <Section title="Responsible AI">
      <p><strong>Data provenance:</strong> only chunks actually retrieved by hybridRetrieve() are passed to the synthesis model — the model is explicitly instructed never to answer from outside knowledge, and to say so if the context is insufficient.</p>
    </Section>
  </>) },
  { id: 'expai', label: 'ExpAI', content: (<>
    <Section title="Explainability"><p>Pipeline readiness scoring is fully transparent (a real deterministic checklist ending in a live retrieval proof, not a black box). Agentic reasoning is logged per real agent_execution_step, and every synthesized answer lists its real source chunks with real similarity scores.</p></Section>
    <Section title="Experiment"><p>Embedding model: nomic-embed-text:latest (real local Ollama, 768-dim). Chat/synthesis model: phi4-mini:latest. Single-model pilot, not compared/tuned.</p></Section>
    <Section title="Experience"><p>Click &quot;Run Pipeline&quot; for instant deterministic readiness scoring on a document, or use Agentic to ask a real question over the whole corpus (30-90s).</p></Section>
  </>) },
  { id: 'govai', label: 'GovAI', content: (
    <Section title="Model, data lineage &amp; approval status">
      <p>Models: nomic-embed-text:latest (embeddings) and phi4-mini:latest (synthesis), both unmodified local Ollama. This module&apos;s admin API (<code>/api/admin/rag/*</code>) was already correctly RBAC-gated under the &apos;rag&apos; resource before this build — now also carries real transactional history on document create/update/delete/ingest-trigger and config create/activate. Pilot status — not yet formally approved for unsupervised production use.</p>
    </Section>
  ) },
  { id: 'fairness', label: 'Fairness AI', content: (
    <Section title="Fairness / equity checks">
      <p>Not applicable at the retrieval-infrastructure level — this module retrieves and synthesizes from ingested documents, not people or business decisions. Any downstream fairness concern belongs to whatever consumes the RAG answer.</p>
    </Section>
  ) },
  { id: 'accountable', label: 'Accountable AI', content: (
    <Section title="Ownership &amp; sign-off">
      <p>Document create/update-status/delete/ingest-trigger and config create/activate now record real <code>triggeredBy</code> — newly wired in this build (the routes previously performed the mutation but never logged who did it).</p>
    </Section>
  ) },
  { id: 'decision', label: 'Decision AI', content: (
    <Section title="Decision-rationale logging">
      <p>The Pipeline tab&apos;s per-stage output IS real decision rationale (status/chunk/embedding-coverage/retrieval-proof checks shown separately with their real inputs and outputs). The Agentic tab&apos;s numbered source citations are the real decision rationale for its synthesized answer.</p>
    </Section>
  ) },
  { id: 'compliance', label: 'Compliance AI', content: (
    <Section title="Regulatory mapping">
      <p>Uploaded document content may contain PII — see the real, newly-wired <code>detectPII()</code> scan in the ingest step (Risk AI below) as this module&apos;s current compliance-relevant control.</p>
    </Section>
  ) },
  { id: 'regulation', label: 'Regulation AI', content: (
    <Section title="Jurisdiction-aware regulation tracking">
      <p>Not yet jurisdiction-specific — the PII scan below is pattern-based (email/phone/SSN/credit card/IP), not tied to a specific jurisdiction&apos;s definition of personal data.</p>
    </Section>
  ) },
  { id: 'risk', label: 'Risk AI', content: (<>
    <Section title="Known failure modes">
      <ul>
        <li><strong>Real, most fundamental fix in this build:</strong> the <code>rag_embed</code> job type was fully implemented and registered but <em>nothing in the app ever created one</em> — a document could reach &apos;chunked&apos; status with no route or UI button anywhere to progress it to &apos;embedded&apos;. Fixed by adding <code>POST /api/admin/rag/documents/[id]/embed</code> (mirroring the existing ingest-trigger route) and an &quot;Embed&quot; button on the Documents page for chunked documents. This — not just the embedding provider below — is why the module registry&apos;s &quot;never exercised once&quot; was true: the pipeline could not reach the embed stage at all before this build.</li>
        <li><strong>Real fix, compounding the gap above:</strong> both the embedding job handler and the real hybridRetrieve() search were hardcoded to <code>DummyEmbeddingProvider</code>, which generates <em>random</em> 384-dimensional vectors. Cosine similarity between random vectors is meaningless — even once reachable, vector search would have been silently non-functional; only the BM25 keyword half of &quot;hybrid&quot; search would have worked. Fixed by adding a real <code>OllamaEmbeddingProvider</code> (nomic-embed-text, 768-dim) and swapping it in as the default in both places. Verified live: real document ingested, chunked, embedded via the newly-added trigger, and a real search query returned the document's own chunk with a meaningful (non-random) cosine score.</li>
        <li><strong>Real gap fixed in this build:</strong> <code>lib/rag/pii.ts</code>&apos;s <code>detectPII()</code> was a complete, correct implementation with zero callers anywhere in the app. Now wired into the real ingest step — informational only, never auto-redacts (auto-redacting a real business document&apos;s content could be more harmful than the exposure, since the content might be intentional, e.g. a lead&apos;s phone number).</li>
        <li>Hallucination in the Agentic synthesis — mitigated by an explicit &quot;answer only from context, say so if insufficient&quot; prompt, not formally red-teamed for this module.</li>
        <li><strong>Honest, still-open gap:</strong> <code>InMemoryVectorStore</code> loads every embedding from the database and does brute-force cosine similarity per query — real and correct, but will not scale past a modest corpus size without a dedicated vector index.</li>
      </ul>
    </Section>
    <Section title="Current risk level"><p><strong>Medium (down from the vector-search-was-non-functional state before this fix).</strong> Uploaded document content may contain PII, now at least surfaced (not blocked) during ingestion; retrieval is now provably real and working, verified end-to-end live.</p></Section>
  </>) },
];

export default function GovernanceTab() {
  return <Tabs tabs={SUB_TABS} />;
}
