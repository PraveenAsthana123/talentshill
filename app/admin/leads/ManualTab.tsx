'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminLeads.module.css';
import sharedStyles from './LeadsShared.module.css';

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

interface RunEntry {
  id: string;
  operationName: string;
  status: string;
  triggeredBy: string | null;
  createdAt: string;
}

export default function ManualTab() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [runs, setRuns] = useState<RunEntry[]>([]);
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

      const [listRes, statsRes, runsRes] = await Promise.all([
        fetch(`/api/admin/leads/?${params}`),
        fetch('/api/admin/leads/?stats=true'),
        fetch('/api/admin/operation-runs/?moduleKey=leads&executionMode=manual&limit=20'),
      ]);
      const listData = await listRes.json();
      const statsData = await statsRes.json();
      const runsData = await runsRes.json().catch(() => ({ runs: [] }));
      setLeads(listData.submissions || []);
      setTotal(listData.total || 0);
      setStats(statsData.stats || null);
      setRuns(runsData.runs || []);
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
      case 'hot': return styles.tierHot;
      case 'warm': return styles.tierWarm;
      case 'cool': return styles.tierCool;
      case 'cold': return styles.tierCold;
      default: return '';
    }
  };

  const statusClass = (s: string) => {
    switch (s) {
      case 'new': return styles.statusNew;
      case 'contacted': return styles.statusContacted;
      case 'qualified': return styles.statusQualified;
      case 'closed': return styles.statusClosed;
      default: return '';
    }
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal</h4>
        <p>Review and progress every real inbound lead (contact-form submission) from first contact through to qualified or closed, with an accurate score/tier at every stage.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Objective</h4>
        <p>No lead should sit in &quot;new&quot; status with a stale/default score — every real submission should be scored (Manual, Pipeline, or Agentic) and moved through status states as real contact happens.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Inclusion / exclusion boundary</h4>
        <p>Covers leads captured via the public contact form (<code>contact_submissions</code>). Does not cover the separate <code>contacts</code> table (newsletter/CRM contacts) or bookings — those are different modules.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist (per lead review)</h4>
        <ul>
          <li>Confirm real contact details (name, email, company)</li>
          <li>Check project stage, budget, and timeline for genuine intent</li>
          <li>Run Pipeline or Agentic scoring if not already scored</li>
          <li>Update status (new → contacted → qualified/closed) as real outreach happens</li>
        </ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.total}</div><div className={styles.statLabel}>Total Leads</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.new}</div><div className={styles.statLabel}>New</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.contacted}</div><div className={styles.statLabel}>Contacted</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.qualified}</div><div className={styles.statLabel}>Qualified</div></div>
            <div className={styles.statCard}><div className={styles.statValue}>{stats.hotLeads}</div><div className={styles.statLabel}>Hot Leads</div></div>
          </div>
        )}

        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          />
          <select className={styles.filterSelect} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}>
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>
          <select className={styles.filterSelect} value={tierFilter} onChange={(e) => { setTierFilter(e.target.value); setOffset(0); }}>
            <option value="">All Tiers</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="cold">Cold</option>
          </select>
          <Button variant="outline" size="sm" onClick={() => { window.location.href = '/api/admin/leads/export/'; }}>Export CSV</Button>
        </div>

        <div className={styles.tableWrap}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : leads.length === 0 ? (
            <div className={styles.empty}>No leads found.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Name</th><th>Company</th><th>Industry</th><th>Score</th><th>Tier</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td className={styles.nameCell}>{l.fullName}</td>
                    <td className={styles.companyCell}>{l.company}</td>
                    <td>{l.industry}</td>
                    <td><span className={cn(styles.scoreBadge, tierClass(l.leadTier))}>{l.leadScore}</span></td>
                    <td><span className={cn(styles.tierBadge, tierClass(l.leadTier))}>{l.leadTier}</span></td>
                    <td><span className={cn(styles.statusBadge, statusClass(l.status))}>{l.status}</span></td>
                    <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td><Link href={`/admin/leads/${l.id}`} className={styles.viewLink}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > limit && (
          <div className={styles.pagination}>
            <Button variant="ghost" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</Button>
            <span className={styles.pageInfo}>Page {Math.floor(offset / limit) + 1} of {Math.ceil(total / limit)}</span>
            <Button variant="ghost" size="sm" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</Button>
          </div>
        )}
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Visualization</h4>
        <div className={sharedStyles.vizRow}>
          <div className={sharedStyles.vizBox}><span>{stats?.hotLeads ?? 0}</span>Hot</div>
          <div className={sharedStyles.vizBox}><span>{stats?.warmLeads ?? 0}</span>Warm</div>
          <div className={sharedStyles.vizBox}><span>{stats?.total ?? 0}</span>Total</div>
        </div>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Transactional history &amp; status (real, timestamped)</h4>
        {runs.length === 0 && <p className={sharedStyles.empty}>No manual status-update operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.operationName}</td>
                <td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td>
                <td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
