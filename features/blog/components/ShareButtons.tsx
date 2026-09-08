'use client';

import { useState } from 'react';
import styles from './ShareButtons.module.css';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={styles.share}>
      <span className={styles.shareLabel}>Share</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.shareBtn}
        aria-label="Share on Twitter"
      >
        𝕏
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.shareBtn}
        aria-label="Share on LinkedIn"
      >
        in
      </a>
      <button onClick={handleCopy} className={styles.shareBtn} aria-label="Copy link">
        {copied ? '✓' : '🔗'}
      </button>
      {copied && <span className={styles.copied}>Copied!</span>}
    </div>
  );
}
