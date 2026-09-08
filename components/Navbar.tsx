'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(styles.nav, scrolled && styles.scrolled)} role="navigation" aria-label="Main navigation">
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoGreen}>Talents</span><span className={styles.logoBlue}>Hill</span>
        </Link>

        <div className={styles.links}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className={styles.linkItem}
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link href={item.href} className={styles.link}>
                {item.label}
                {item.children && (
                  <svg className={cn(styles.chevron, openDropdown === item.label && styles.chevronOpen)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </Link>
              {item.children && openDropdown === item.label && (
                <div className={styles.dropdown}>
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href} className={styles.dropdownLink}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <ThemeToggle />
          <Link href="/contact">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={cn(styles.mobileMenu, mobileOpen && styles.open)}>
        {NAV_ITEMS.map((item) => (
          <div key={item.label}>
            <Link href={item.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
            {item.children?.map((child) => (
              <Link key={child.href} href={child.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)} style={{ paddingLeft: 'var(--space-8)' }}>
                {child.label}
              </Link>
            ))}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <ThemeToggle />
          <Link href="/contact" onClick={() => setMobileOpen(false)} style={{ flex: 1 }}>
            <Button fullWidth>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
