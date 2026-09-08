'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './AdminDashboard.module.css';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  totalSurveys: number;
  totalPosts: number;
  totalSubscribers: number;
  totalVideos: number;
  recentLeads30d: number;
  recentSurveys30d: number;
}

interface ActivityItem {
  id: string;
  entityType: string;
  action: string;
  entityId: string | null;
  userName: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.json()),
      fetch('/api/admin/activity').then(r => r.json()),
    ]).then(([statsData, activityData]) => {
      setStats(statsData.stats || null);
      setActivity(activityData.entries || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className={styles.page}><div className="container section"><p>Loading dashboard...</p></div></div>;
  }

  return (
    <div className={styles.page}>
      <div className="container section">
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Overview of your platform metrics and recent activity.</p>

        {stats && (
          <div className={styles.statsGrid}>
            <div className={cn(styles.statCard, styles.statHighlight)}>
              <div className={styles.statValue}>{stats.totalLeads}</div>
              <div className={styles.statLabel}>Total Leads</div>
              <div className={styles.statTrend}>+{stats.recentLeads30d} this month</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.newLeads}</div>
              <div className={styles.statLabel}>New Leads</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalSurveys}</div>
              <div className={styles.statLabel}>Survey Responses</div>
              <div className={styles.statTrend}>+{stats.recentSurveys30d} this month</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalPosts}</div>
              <div className={styles.statLabel}>Blog Posts</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalSubscribers}</div>
              <div className={styles.statLabel}>Subscribers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalVideos}</div>
              <div className={styles.statLabel}>Videos</div>
            </div>
          </div>
        )}

        <div className={styles.columns}>
          <div className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Recent Activity</h2>
            {activity.length === 0 ? (
              <p className={styles.empty}>No recent activity.</p>
            ) : (
              <div className={styles.activityList}>
                {activity.map((item) => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <span className={styles.activityAction}>
                        {item.userName || 'System'} {item.action}d {item.entityType}
                      </span>
                      <span className={styles.activityTime}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <Link href="/admin/blog/new" className={styles.actionCard}>
                <span className={styles.actionIcon}>&#x270F;</span>
                <span>New Blog Post</span>
              </Link>
              <Link href="/admin/leads" className={styles.actionCard}>
                <span className={styles.actionIcon}>&#x1F4E9;</span>
                <span>View Leads</span>
              </Link>
              <Link href="/admin/survey" className={styles.actionCard}>
                <span className={styles.actionIcon}>&#x1F4CB;</span>
                <span>Survey Analytics</span>
              </Link>
              <Link href="/admin/settings" className={styles.actionCard}>
                <span className={styles.actionIcon}>&#x2699;</span>
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
