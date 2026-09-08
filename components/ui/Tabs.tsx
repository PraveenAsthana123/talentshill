'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Tabs.module.css';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export default function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);
  const activeTab = tabs.find((t) => t.id === active);

  return (
    <div className={cn(styles.tabs, className)}>
      <div className={styles.list} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            className={cn(styles.tab, active === tab.id && styles.active)}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className={styles.panel}>
        {activeTab?.content}
      </div>
    </div>
  );
}
