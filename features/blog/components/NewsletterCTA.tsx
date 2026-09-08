'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import styles from './NewsletterCTA.module.css';

export default function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/blog/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Something went wrong');
      }
    } catch {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <div className={styles.newsletter}>
      <h3 className={styles.title}>Stay Updated</h3>
      <p className={styles.subtitle}>Get the latest insights on AI, robotics, and enterprise tech delivered to your inbox.</p>

      {status === 'success' ? (
        <p className={`${styles.message} ${styles.success}`}>{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            className={styles.input}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="sm" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      )}

      {status === 'error' && (
        <p className={`${styles.message} ${styles.errorMsg}`}>{message}</p>
      )}
    </div>
  );
}
