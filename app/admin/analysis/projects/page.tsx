'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import styles from './AdminAnalysisProjects.module.css';

interface Assessment {
  id: string;
  frameworkId: string;
  projectName: string;
  status: string;
  overallScore: number | null;
  completedItems: number;
  totalItems: number;
}

interface ProjectSummary {
  name: string;
  assessments: Assessment[];
  avgScore: number;
  completedFrameworks: number;
  totalFrameworks: number;
}

export default function AdminAnalysisProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/analysis/assessments?limit=500');
        const data = await res.json();
        const assessments: Assessment[] = data.items || [];
        const grouped = new Map<string, Assessment[]>();
        for (const a of assessments) {
          if (!grouped.has(a.projectName)) grouped.set(a.projectName, []);
          grouped.get(a.projectName)!.push(a);
        }
        const summaries: ProjectSummary[] = [];
        for (const [name, items] of grouped.entries()) {
          const scored = items.filter(a => a.overallScore !== null);
          const avgScore = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.overallScore ?? 0), 0) / scored.length) : 0;
          const completedFrameworks = items.filter(a => a.status === 'completed').length;
          summaries.push({ name, assessments: items, avgScore, completedFrameworks, totalFrameworks: items.length });
        }
        setProjects(summaries.sort((a, b) => b.assessments.length - a.assessments.length));
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.page}>
      <SectionHeader label="AI Analysis" title="Projects" subtitle="View assessment progress across all analysis frameworks by project." />
      <Link href="/admin/analysis" className={styles.backLink}>&larr; Back to Analysis Hub</Link>

      {loading ? (
        <div className={styles.empty}>Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className={styles.empty}>No projects found. Create an assessment from a framework page to get started.</div>
      ) : (
        <div className={styles.projectList}>
          {projects.map((project) => (
            <div key={project.name} className={styles.projectCard}>
              <div className={styles.projectHeader}>
                <h3 className={styles.projectName}>{project.name}</h3>
                <div className={styles.projectStats}>
                  <span className={styles.projectStat}>Avg Score: <strong>{project.avgScore}</strong></span>
                  <span className={styles.projectStat}>Completed: <strong>{project.completedFrameworks}/{project.totalFrameworks}</strong></span>
                </div>
              </div>
              <div className={styles.assessmentGrid}>
                {project.assessments.map((a) => (
                  <div key={a.id} className={`${styles.assessmentChip} ${styles[`chip_${a.status}`] || ''}`}>
                    <span className={styles.chipScore}>{a.overallScore !== null ? a.overallScore : '-'}</span>
                    <span className={styles.chipProgress}>{a.completedItems}/{a.totalItems}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
