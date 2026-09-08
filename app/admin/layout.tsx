'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './AdminLayout.module.css';

interface SessionUser {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '',
    items: [
      { href: '/admin', label: 'Dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/blog', label: 'Blog' },
      { href: '/admin/videos', label: 'Videos' },
      { href: '/admin/services', label: 'Services' },
      { href: '/admin/industries', label: 'Industries' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/content/library', label: 'Content Library' },
      { href: '/admin/content/brochures', label: 'Brochures' },
      { href: '/admin/content/presentations', label: 'Presentations' },
      { href: '/admin/content/links', label: 'Share Links' },
      { href: '/admin/marketing/segments', label: 'Segments' },
      { href: '/admin/marketing/workflow', label: 'Workflow' },
      { href: '/admin/marketing/approvals', label: 'Approvals' },
      { href: '/admin/marketing/monitor', label: 'Monitor' },
    ],
  },
  {
    label: 'CRM',
    items: [
      { href: '/admin/contacts', label: 'Contacts' },
      { href: '/admin/lists', label: 'Lists' },
      { href: '/admin/templates', label: 'Templates' },
      { href: '/admin/campaigns', label: 'Campaigns' },
      { href: '/admin/broadcasts', label: 'Broadcasts' },
    ],
  },
  {
    label: 'Chat',
    items: [
      { href: '/admin/chat', label: 'Conversations' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { href: '/admin/integrations', label: 'Hub' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/runs', label: 'Runs' },
      { href: '/admin/email-compose', label: 'Email Compose' },
      { href: '/admin/banners', label: 'Banners' },
      { href: '/admin/media', label: 'Media' },
      { href: '/admin/maintenance', label: 'Maintenance' },
      { href: '/admin/content-overrides', label: 'Content Overrides' },
    ],
  },
  {
    label: 'RAG Pipeline',
    items: [
      { href: '/admin/rag', label: 'Dashboard' },
      { href: '/admin/rag/documents', label: 'Documents' },
      { href: '/admin/rag/runs', label: 'Runs' },
      { href: '/admin/rag/config', label: 'Config' },
      { href: '/admin/rag/search', label: 'Search' },
    ],
  },
  {
    label: 'AI Analysis',
    items: [
      { href: '/admin/analysis', label: 'Hub' },
      { href: '/admin/analysis/projects', label: 'Projects' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/admin/leads', label: 'Leads' },
      { href: '/admin/survey', label: 'Survey' },
      { href: '/admin/analytics', label: 'Campaign Analytics' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/health', label: 'Health' },
      { href: '/admin/roles', label: 'Roles & Users' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/features', label: 'Features' },
      { href: '/admin/email-profiles', label: 'Email Profiles' },
      { href: '/admin/appointments', label: 'Appointments' },
      { href: '/admin/settings', label: 'Settings' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => isActive(item.href));
  };

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNav = () => (
    <nav className={styles.nav}>
      {NAV_GROUPS.map((group) => {
        // Ungrouped items (Dashboard)
        if (!group.label) {
          return group.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.navItem, isActive(item.href) && styles.navItemActive)}
            >
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ));
        }

        const isOpen = !collapsed[group.label];
        const groupActive = isGroupActive(group);

        return (
          <div key={group.label} className={styles.navGroup}>
            <button
              className={cn(styles.groupHeader, groupActive && styles.groupHeaderActive)}
              onClick={() => toggleGroup(group.label)}
            >
              <span className={styles.groupLabel}>{group.label}</span>
              <span className={cn(styles.groupChevron, isOpen && styles.groupChevronOpen)}>&#9662;</span>
            </button>
            {isOpen && (
              <div className={styles.groupItems}>
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(styles.navItem, styles.navItemNested, isActive(item.href) && styles.navItemActive)}
                  >
                    <span className={styles.navLabel}>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <aside className={cn(
        styles.sidebar,
        !sidebarOpen && styles.sidebarCollapsed,
        mobileOpen && styles.sidebarMobileOpen,
      )}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brand}>
            <span className={styles.brandIcon}>TH</span>
            {sidebarOpen && <span className={styles.brandText}>Admin</span>}
          </Link>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? '\u2190' : '\u2192'}
          </button>
        </div>

        {sidebarOpen && renderNav()}

        {user && sidebarOpen && (
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        )}
      </aside>

      <main className={cn(styles.main, !sidebarOpen && styles.mainExpanded)}>
        {/* Mobile header */}
        <div className={styles.mobileHeader}>
          <button className={styles.hamburger} onClick={() => setMobileOpen(true)} aria-label="Open menu">
            &#9776;
          </button>
          <span className={styles.mobileTitle}>Admin</span>
        </div>
        {children}
      </main>
    </div>
  );
}
