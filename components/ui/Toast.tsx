'use client';

import { useEffect } from 'react';
import { useUIStore, type Toast as ToastType } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import styles from './Toast.module.css';

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div className={cn(styles.toast, styles[toast.type])} role="alert">
      <span className={styles.icon}>
        {toast.type === 'success' && '✓'}
        {toast.type === 'error' && '✕'}
        {toast.type === 'warning' && '⚠'}
        {toast.type === 'info' && 'ℹ'}
      </span>
      <span className={styles.message}>{toast.message}</span>
      <button className={styles.close} onClick={() => removeToast(toast.id)} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
