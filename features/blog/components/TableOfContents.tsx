'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import styles from './TableOfContents.module.css';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  htmlContent: string;
}

function extractHeadings(html: string): TocItem[] {
  const headings: TocItem[] = [];
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }

  // Fallback: parse headings without ids
  if (headings.length === 0) {
    const fallbackRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
    let idx = 0;
    while ((match = fallbackRegex.exec(html)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '');
      const id = `heading-${idx++}`;
      headings.push({ level: parseInt(match[1]), id, text });
    }
  }

  return headings;
}

export default function TableOfContents({ htmlContent }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState('');
  const headings = extractHeadings(htmlContent);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className={styles.toc}>
      <div className={styles.tocTitle}>On This Page</div>
      <ul className={styles.tocList}>
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                styles.tocLink,
                h.level === 3 && styles.h3Link,
                activeId === h.id && styles.tocLinkActive
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
