'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import styles from './AdminLeads.module.css';

interface LeadRow {
  id: string;
  fullName: string;
  email: string;
  company: string;
  industry: string;
  leadScore: number;
  leadTier: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  closed: number;
  hotLeads: number;
  warmLeads: number;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('offset', String(offset));
      params.set('limit', String(limit));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (tierFilter) params.set('tier', tierFilter);
      if (search) params.set('search', search);

      const [listRes, statsRes] = await Promise.all([
        fetch(`/api/admin/leads?${params}`),
        fetch('/api/admin/leads?stats=true'),
      ]);
      const listData = await listRes.json();
      const statsData = await statsRes.json();
      setLeads(listData.submissions || []);
      setTotal(listData.total || 0);
      setStats(statsData.stats || null);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, tierFilter, search, offset]);

  const tierClass = (tier: string) => {
    switch (tier) {
      case 'hot':
        return styles.tierHot;
      case 'warm':
        return styles.tierWarm;
      case 'cool':
        return styles.tierCool;
      case 'cold':
        return styles.tierCold;
      default:
        return '';
    }
  };

  const statusClass = (s: string) => {
    switch (s) {
      case 'new':
        return styles.statusNew;
      case 'contacted':
        return styles.statusContacted;
      case 'qualified':
        return styles.statusQualified;
      case 'closed':
        return styles.statusClosed;
      default:
        return '';
    }
  };

  return (
    <div className={styles.page}>
      <div className="container section">
        <h1 className={styles.pageTitle}>Leads Dashboard</h1>

        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total Leads</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.new}</div>
              <div className={styles.statLabel}>New</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.contacted}</div>
              <div className={styles.statLabel}>Contacted</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.qualified}</div>
              <div className={styles.statLabel}>Qualified</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.hotLeads}</div>
              <div className={styles.statLabel}>Hot Leads</div>
            </div>
          </div>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className={styles.filterSelect}
            value={tierFilter}
            onChange={(e) => {
              setTierFilter(e.target.value);
              setOffset(0);
            }}
          >
            <option value="">All Tiers</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="cold">Cold</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = '/api/admin/leads/export';
            }}
          >
            Export CSV
          </Button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : leads.length === 0 ? (
            <div className={styles.empty}>No leads found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Score</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className={styles.nameCell}>{l.fullName}</td>
                    <td className={styles.companyCell}>{l.company}</td>
                    <td>{l.industry}</td>
                    <td>
                      <span className={cn(styles.scoreBadge, tierClass(l.leadTier))}>
                        {l.leadScore}
                      </span>
                    </td>
                    <td>
                      <span className={cn(styles.tierBadge, tierClass(l.leadTier))}>
                        {l.leadTier}
                      </span>
                    </td>
                    <td>
                      <span className={cn(styles.statusBadge, statusClass(l.status))}>
                        {l.status}
                      </span>
                    </td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/leads/${l.id}`} className={styles.viewLink}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > limit && (
          <div className={styles.pagination}>
            <Button
              variant="ghost"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - limit))}
            >
              Previous
            </Button>
            <span className={styles.pageInfo}>
              Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              disabled={offset + limit >= total}
              onClick={() => setOffset(offset + limit)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
