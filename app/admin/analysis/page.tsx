'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import styles from './AdminAnalysis.module.css';

interface Framework {
  id: string;
  categoryKey: string;
  categoryName: string;
  description: string | null;
  totalItems: number;
  analysisTypes: { index: number; name: string }[];
  assessmentCount: number;
}

export default function AdminAnalysisHubPage() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ totalFrameworks: 0, totalAssessments: 0, byStatus: { notStarted: 0, inProgress: 0, completed: 0 } });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fwRes, dashRes] = await Promise.all([
          fetch('/api/admin/analysis/frameworks'),
          fetch('/api/admin/analysis/dashboard'),
        ]);
        const fwData = await fwRes.json();
        const dashData = await dashRes.json();
        setFrameworks(fwData.frameworks || []);
        if (dashData.stats) setStats(dashData.stats);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = frameworks.filter(fw =>
    fw.categoryName.toLowerCase().includes(search.toLowerCase()) ||
    (fw.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <SectionHeader
        label="AI Analysis"
        title="Analysis Hub"
        subtitle="Evaluate AI systems across 35 analysis frameworks with scoring matrices."
      />

      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalFrameworks}</span>
          <span className={styles.statLabel}>Frameworks</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalAssessments}</span>
          <span className={styles.statLabel}>Total Assessments</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.byStatus.inProgress}</span>
          <span className={styles.statLabel}>In Progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.byStatus.completed}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search frameworks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link href="/admin/analysis/projects" className={styles.projectsLink}>View Projects</Link>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading frameworks...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No frameworks found.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((fw) => (
            <Link key={fw.id} href={`/admin/analysis/${fw.categoryKey}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{fw.categoryName}</h3>
              <p className={styles.cardDesc}>{fw.description}</p>
              <div className={styles.cardFooter}>
                <span className={styles.cardStat}>{fw.totalItems} items</span>
                <span className={styles.cardStat}>{fw.assessmentCount} assessments</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
