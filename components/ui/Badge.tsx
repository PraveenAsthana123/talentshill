import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

interface BadgeProps {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}
