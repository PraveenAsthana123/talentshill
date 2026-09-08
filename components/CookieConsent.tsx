'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)',
      padding: 'var(--space-4) var(--space-6)', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 'var(--space-4)', zIndex: 500, flexWrap: 'wrap',
    }}>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', flex: 1, minWidth: '200px' }}>
        We use cookies to improve your experience. By continuing, you agree to our cookie policy.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button size="sm" variant="ghost" onClick={decline}>Decline</Button>
        <Button size="sm" onClick={accept}>Accept</Button>
      </div>
    </div>
  );
}
