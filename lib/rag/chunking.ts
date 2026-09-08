import { createChunks } from '@/lib/db/rag-chunk-queries';
import { updateDocumentStatus } from '@/lib/db/rag-document-queries';
import { ingestDocument } from '@/lib/rag/ingestion';

// ── Splitter utilities ──

/**
 * Recursive text splitter: splits by paragraphs first, then sentences
 * if individual chunks exceed chunkSize, maintaining overlap between chunks.
 */
export function recursiveTextSplitter(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  // Split into paragraphs first
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    // If a single paragraph exceeds chunkSize, split it by sentences
    if (trimmedParagraph.length > chunkSize) {
      // Flush current chunk first
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      const sentenceChunks = splitBySentences(trimmedParagraph, chunkSize, overlap);
      chunks.push(...sentenceChunks);
      continue;
    }

    // Check if adding this paragraph would exceed chunkSize
    const candidate = currentChunk.length > 0
      ? currentChunk + '\n\n' + trimmedParagraph
      : trimmedParagraph;

    if (candidate.length > chunkSize && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());

      // Apply overlap: carry the tail of the current chunk forward
      if (overlap > 0) {
        const overlapText = currentChunk.trim().slice(-overlap);
        currentChunk = overlapText + '\n\n' + trimmedParagraph;
      } else {
        currentChunk = trimmedParagraph;
      }
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Split text by sentences when paragraphs are too large.
 */
function splitBySentences(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    const candidate = currentChunk.length > 0
      ? currentChunk + ' ' + trimmedSentence
      : trimmedSentence;

    if (candidate.length > chunkSize && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());

      if (overlap > 0) {
        const overlapText = currentChunk.trim().slice(-overlap);
        currentChunk = overlapText + ' ' + trimmedSentence;
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Token-based splitter: approximates token count as words / 0.75,
 * splits at word boundaries, maintaining overlap.
 */
export function tokenBasedSplitter(
  text: string,
  maxTokens: number,
  overlap: number
): string[] {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  // Approximate: 1 token ~= 0.75 words, so maxTokens tokens ~= maxTokens * 0.75 words
  const maxWords = Math.floor(maxTokens * 0.75);
  const overlapWords = Math.floor(overlap * 0.75);

  if (words.length <= maxWords) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + maxWords, words.length);
    const chunk = words.slice(start, end).join(' ');
    chunks.push(chunk);

    if (end >= words.length) {
      break;
    }

    // Move start forward, accounting for overlap
    start = end - overlapWords;
    if (start <= (chunks.length > 1 ? (end - maxWords) : 0)) {
      // Prevent infinite loop if overlap >= maxWords
      start = end;
    }
  }

  return chunks;
}

/**
 * Structure-aware splitter: splits on markdown headings (##, ###) and
 * paragraph breaks, keeping each heading with its content.
 */
export function structureAwareSplitter(
  text: string,
  chunkSize: number
): string[] {
  // Split on markdown headings (## or ###)
  const sections = text.split(/(?=^#{2,3}\s)/m);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const section of sections) {
    const trimmedSection = section.trim();
    if (trimmedSection.length === 0) continue;

    // If a single section exceeds chunkSize, split by paragraphs within it
    if (trimmedSection.length > chunkSize) {
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Extract heading if present
      const headingMatch = trimmedSection.match(/^(#{2,3}\s+.+?)(?:\n|$)/);
      const heading = headingMatch ? headingMatch[1].trim() : '';
      const body = headingMatch
        ? trimmedSection.slice(headingMatch[0].length).trim()
        : trimmedSection;

      // Split body by paragraphs, prepend heading to each sub-chunk
      const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
      let subChunk = heading;

      for (const paragraph of paragraphs) {
        const trimmedParagraph = paragraph.trim();
        const candidate = subChunk.length > 0
          ? subChunk + '\n\n' + trimmedParagraph
          : trimmedParagraph;

        if (candidate.length > chunkSize && subChunk.trim().length > 0) {
          chunks.push(subChunk.trim());
          subChunk = heading.length > 0
            ? heading + '\n\n' + trimmedParagraph
            : trimmedParagraph;
        } else {
          subChunk = candidate;
        }
      }

      if (subChunk.trim().length > 0) {
        chunks.push(subChunk.trim());
      }
      continue;
    }

    const candidate = currentChunk.length > 0
      ? currentChunk + '\n\n' + trimmedSection
      : trimmedSection;

    if (candidate.length > chunkSize && currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = trimmedSection;
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// ── Document chunking orchestration ──

interface ChunkConfig {
  chunkSize: number;
  chunkOverlap: number;
  strategy?: 'recursive' | 'token' | 'structure';
}

/**
 * Chunk a document by its ID:
 * 1. Ingest the document to get its text
 * 2. Split using the configured strategy
 * 3. Save chunks to the database
 * 4. Update document status to 'chunked' with chunkCount
 */
export async function chunkDocument(
  docId: string,
  config: ChunkConfig
): Promise<string[]> {
  const { chunkSize, chunkOverlap, strategy = 'recursive' } = config;

  const text = await ingestDocument(docId);

  let textChunks: string[];

  switch (strategy) {
    case 'recursive':
      textChunks = recursiveTextSplitter(text, chunkSize, chunkOverlap);
      break;
    case 'token':
      textChunks = tokenBasedSplitter(text, chunkSize, chunkOverlap);
      break;
    case 'structure':
      textChunks = structureAwareSplitter(text, chunkSize);
      break;
    default:
      textChunks = recursiveTextSplitter(text, chunkSize, chunkOverlap);
  }

  // Estimate token count per chunk (words / 0.75)
  const chunksWithMeta = textChunks.map((content, index) => {
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
    const tokenCount = Math.ceil(wordCount / 0.75);
    return {
      documentId: docId,
      chunkIndex: index,
      content,
      tokenCount,
    };
  });

  const chunkIds = createChunks(chunksWithMeta);

  updateDocumentStatus(docId, 'chunked', chunkIds.length);

  return chunkIds;
}
