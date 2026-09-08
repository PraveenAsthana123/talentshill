'use client';

import { cn } from '@/lib/utils';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push('ellipsis');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('ellipsis');

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="Blog pagination">
      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {getPages().map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className={styles.pageEllipsis}>...</span>
        ) : (
          <button
            key={p}
            className={cn(styles.pageBtn, currentPage === p && styles.pageBtnActive)}
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={styles.pageBtn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
