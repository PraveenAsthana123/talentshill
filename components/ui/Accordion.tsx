'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './Accordion.module.css';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn(styles.accordion, className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={styles.item}>
            <button
              className={styles.trigger}
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
            >
              {item.title}
              <svg
                className={cn(styles.icon, isOpen && styles.iconOpen)}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className={cn(styles.content, isOpen && styles.contentOpen)}>
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
