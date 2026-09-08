'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AdminIntegrations.module.css';

const CATEGORIES = ['all', 'messaging', 'social', 'productivity', 'data', 'webhook'];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetch('/api/admin/integrations').then(r => r.json()).then(setIntegrations);
  }, []);

  const filtered = category === 'all' ? integrations : integrations.filter((i: any) => i.category === category);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Integrations Hub</h1>

      <div className={styles.tabs}>
        {CATEGORIES.map(c => (
          <button key={c} className={`${styles.tab} ${category === c ? styles.tabActive : ''}`} onClick={() => setCategory(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.map((i: any) => (
          <Link key={i.id} href={`/admin/integrations/${i.id}`} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardName}>{i.name}</h3>
              <span className={`${styles.badge} ${i.accounts?.length > 0 ? styles.badgeConnected : styles.badgeAvailable}`}>
                {i.accounts?.length > 0 ? 'Connected' : 'Available'}
              </span>
            </div>
            <p className={styles.cardDesc}>{i.description || 'No description'}</p>
            <span className={styles.cardCategory}>{i.category}</span>
          </Link>
        ))}
        {filtered.length === 0 && <p className={styles.empty}>No integrations found</p>}
      </div>
    </div>
  );
}
