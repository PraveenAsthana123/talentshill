'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Subscribed!');
        setEmail('');
      } else if (res.status === 409) {
        setStatus('success');
        setMessage('Already subscribed');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe');
      }
    } catch {
      setStatus('error');
      setMessage('Network error');
    }

    setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoGreen}>Talents</span><span className={styles.logoBlue}>Hill</span>
          </div>
          <p className={styles.description}>
            Intelligent Analytics. Intelligently Delivered. Enterprise AI, Robotics, IoT, and Quantum consulting.
          </p>
          <div className={styles.socials}>
            {SOCIAL_LINKS.linkedin && SOCIAL_LINKS.linkedin !== '#' && (
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}
            {SOCIAL_LINKS.facebook && SOCIAL_LINKS.facebook !== '#' && (
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
          </div>
        </div>

        <div className={styles.column}>
          <h4>Solutions</h4>
          <Link href="/solutions/genai">Generative AI</Link>
          <Link href="/solutions/agentic-ai">Agentic AI</Link>
          <Link href="/solutions/enterprise-rag">Enterprise RAG</Link>
          <Link href="/solutions/robotics-ai">Robotics & AI</Link>
          <Link href="/solutions/quantum-ai">Quantum AI</Link>
          <Link href="/solutions/digital-marketing">Digital Marketing</Link>
          <Link href="/solutions/ads-management">Ads Management</Link>
          <Link href="/solutions/market-research">Market Research</Link>
          <Link href="/solutions/performance-marketing">Performance Marketing</Link>
          <Link href="/solutions/seo-geo">SEO & GEO</Link>
          <Link href="/solutions/ai-automation">AI Automation</Link>
          <Link href="/solutions/ai-strategy">AI Strategy</Link>
          <Link href="/solutions/creator-video-marketing">Influencer & Video Growth</Link>
          <Link href="/services">All Services</Link>
        </div>

        <div className={styles.column}>
          <h4>Company</h4>
          <Link href="/blog">Blog</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/demo">Demos</Link>
          <Link href="/videos">Videos</Link>
        </div>

        <div className={styles.column}>
          <h4>Newsletter</h4>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            Stay updated with AI insights.
          </p>
          <form className={styles.newsletter} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button size="sm" loading={status === 'loading'}>
              {status === 'success' ? message : 'Join'}
            </Button>
          </form>
          {status === 'error' && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error, #EF4444)', marginTop: 'var(--space-1)' }}>
              {message}
            </p>
          )}
        </div>
      </div>

      <div className={styles.bottom}>
        <p>&copy; {new Date().getFullYear()} Talents Hill Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
