// ── PII detection types ──

type PiiType = 'email' | 'phone' | 'ssn' | 'credit_card' | 'ip';

export interface PiiMatch {
  type: PiiType;
  value: string;
  start: number;
  end: number;
}

interface PiiDetectionResult {
  findings: PiiMatch[];
  redactedText: string;
  piiDetected: boolean;
}

// ── PII regex patterns ──

interface PiiPattern {
  type: PiiType;
  regex: RegExp;
  redactLabel: string;
}

const PII_PATTERNS: PiiPattern[] = [
  {
    type: 'email',
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    redactLabel: '[REDACTED_EMAIL]',
  },
  {
    type: 'phone',
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    redactLabel: '[REDACTED_PHONE]',
  },
  {
    type: 'ssn',
    regex: /\b\d{3}-\d{2}-\d{4}\b/g,
    redactLabel: '[REDACTED_SSN]',
  },
  {
    type: 'credit_card',
    regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
    redactLabel: '[REDACTED_CREDIT_CARD]',
  },
  {
    type: 'ip',
    regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    redactLabel: '[REDACTED_IP]',
  },
];

// ── Detection function ──

/**
 * Detect PII (Personally Identifiable Information) in text.
 *
 * Scans for the following patterns:
 * - Email addresses
 * - US phone numbers (xxx-xxx-xxxx, (xxx) xxx-xxxx, etc.)
 * - Social Security Numbers (xxx-xx-xxxx)
 * - Credit card numbers (4 groups of 4 digits)
 * - IPv4 addresses
 *
 * Returns all findings with their positions, a redacted version of the text,
 * and a boolean indicating whether any PII was detected.
 */
export function detectPII(text: string): PiiDetectionResult {
  const findings: PiiMatch[] = [];

  // Collect all matches from all patterns
  for (const pattern of PII_PATTERNS) {
    // Reset regex state by creating a fresh copy
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      findings.push({
        type: pattern.type,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort findings by start position (descending) for safe replacement
  // When SSN and phone patterns might overlap, deduplicate by preferring
  // the more specific pattern (SSN over phone)
  const deduplicated = deduplicateOverlapping(findings);

  // Build redacted text by replacing from end to start (to preserve positions)
  let redactedText = text;
  const sortedByStartDesc = [...deduplicated].sort((a, b) => b.start - a.start);

  for (const finding of sortedByStartDesc) {
    const redactLabel = PII_PATTERNS.find((p) => p.type === finding.type)?.redactLabel || '[REDACTED]';
    redactedText =
      redactedText.slice(0, finding.start) +
      redactLabel +
      redactedText.slice(finding.end);
  }

  // Sort final findings by start position (ascending) for the output
  deduplicated.sort((a, b) => a.start - b.start);

  return {
    findings: deduplicated,
    redactedText,
    piiDetected: deduplicated.length > 0,
  };
}

/**
 * Deduplicate overlapping PII matches, preferring more specific types.
 *
 * Priority order (higher = preferred): ssn > credit_card > phone > email > ip
 */
function deduplicateOverlapping(findings: PiiMatch[]): PiiMatch[] {
  if (findings.length <= 1) {
    return findings;
  }

  const specificity: Record<PiiType, number> = {
    ssn: 5,
    credit_card: 4,
    phone: 3,
    email: 2,
    ip: 1,
  };

  // Sort by start position, then by specificity (higher first)
  const sorted = [...findings].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return specificity[b.type] - specificity[a.type];
  });

  const result: PiiMatch[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    // Check for overlap
    if (current.start < last.end) {
      // Overlapping -- keep the more specific one
      if (specificity[current.type] > specificity[last.type]) {
        result[result.length - 1] = current;
      }
      // Otherwise keep the existing (last) entry
    } else {
      result.push(current);
    }
  }

  return result;
}
