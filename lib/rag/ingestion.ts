import fs from 'fs';
import { getDocumentById, updateDocumentStatus } from '@/lib/db/rag-document-queries';

/**
 * Strip HTML tags from a string, returning plain text.
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch content from a URL and return plain text (HTML stripped).
 */
async function fetchUrlContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'TalentsHill-RAG-Ingestion/1.0',
      Accept: 'text/html,application/xhtml+xml,text/plain',
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const body = await response.text();

  if (contentType.includes('text/html') || contentType.includes('application/xhtml')) {
    return stripHtmlTags(body);
  }

  return body.trim();
}

/**
 * Ingest a document by its ID.
 *
 * Based on the document's sourceType:
 * - 'upload': reads the file from disk at `filePath`
 * - 'url': fetches the URL and strips HTML to plain text
 * - 'sitepage': same as 'url'
 *
 * On success, updates the document status to 'ingested' and returns the extracted text.
 * On failure, updates the document status to 'failed' and re-throws the error.
 */
export async function ingestDocument(docId: string): Promise<string> {
  const document = getDocumentById(docId);

  if (!document) {
    throw new Error(`Document not found: ${docId}`);
  }

  try {
    let text: string;

    switch (document.sourceType) {
      case 'upload': {
        if (!document.filePath) {
          throw new Error(`Document ${docId} has sourceType 'upload' but no filePath`);
        }
        const resolvedPath = fs.realpathSync(document.filePath);
        text = fs.readFileSync(resolvedPath, 'utf-8');
        break;
      }

      case 'url':
      case 'sitepage': {
        if (!document.sourceUrl) {
          throw new Error(
            `Document ${docId} has sourceType '${document.sourceType}' but no sourceUrl`
          );
        }
        text = await fetchUrlContent(document.sourceUrl);
        break;
      }

      default:
        throw new Error(`Unsupported sourceType '${document.sourceType}' for document ${docId}`);
    }

    updateDocumentStatus(docId, 'ingested');
    return text;
  } catch (error) {
    updateDocumentStatus(docId, 'failed');
    throw error;
  }
}
