'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './Unsubscribe.module.css';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'done' | 'error'>('loading');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    fetch(`/api/t/u/${token}`)
      .then(res => res.json())
      .then(data => setStatus(data.valid ? 'valid' : 'invalid'))
      .catch(() => setStatus('error'));
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/t/u/${token}`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.success ? 'done' : 'error');
    } catch {
      setStatus('error');
    }
    setProcessing(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>TalentsHill</div>

        {status === 'loading' && (
          <div className={styles.content}>
            <p className={styles.message}>Verifying your request...</p>
          </div>
        )}

        {status === 'valid' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Unsubscribe</h1>
            <p className={styles.message}>
              Are you sure you want to unsubscribe from our emails? You will no longer receive marketing communications from us.
            </p>
            <button
              className={styles.unsubButton}
              onClick={handleUnsubscribe}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Yes, Unsubscribe Me'}
            </button>
            <p className={styles.hint}>You can always re-subscribe later.</p>
          </div>
        )}

        {status === 'done' && (
          <div className={styles.content}>
            <div className={styles.successIcon}>&#10003;</div>
            <h1 className={styles.title}>Unsubscribed</h1>
            <p className={styles.message}>
              You have been successfully unsubscribed. You will no longer receive marketing emails from us.
            </p>
            <a href="/" className={styles.homeLink}>Return to Homepage</a>
          </div>
        )}

        {status === 'invalid' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Invalid Link</h1>
            <p className={styles.message}>
              This unsubscribe link is invalid or has already been used. If you continue to receive unwanted emails, please contact us.
            </p>
            <a href="/" className={styles.homeLink}>Return to Homepage</a>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.content}>
            <h1 className={styles.title}>Something Went Wrong</h1>
            <p className={styles.message}>
              We could not process your request. Please try again later or contact us for assistance.
            </p>
            <a href="/" className={styles.homeLink}>Return to Homepage</a>
          </div>
        )}
      </div>
    </div>
  );
}
