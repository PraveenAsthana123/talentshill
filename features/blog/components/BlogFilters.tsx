'use client';

import { cn } from '@/lib/utils';
import styles from './BlogFilters.module.css';

interface Category {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface BlogFiltersProps {
  categories: Category[];
  activeCategory: string;
  search: string;
  onCategoryChange: (slug: string) => void;
  onSearchChange: (search: string) => void;
}

export default function BlogFilters({
  categories,
  activeCategory,
  search,
  onCategoryChange,
  onSearchChange,
}: BlogFiltersProps) {
  return (
    <div className={styles.filters}>
      <div className={styles.categoryPills}>
        <button
          className={cn(styles.pill, !activeCategory && styles.pillActive)}
          onClick={() => onCategoryChange('')}
        >
          All
        </button>
        {categories.filter((c) => c.postCount > 0).map((cat) => (
          <button
            key={cat.slug}
            className={cn(styles.pill, activeCategory === cat.slug && styles.pillActive)}
            onClick={() => onCategoryChange(cat.slug)}
          >
            {cat.name} ({cat.postCount})
          </button>
        ))}
      </div>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>&#128269;</span>
        <input
          className={styles.searchInput}
          placeholder="Search articles..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
