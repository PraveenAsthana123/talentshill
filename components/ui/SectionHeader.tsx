import { cn } from '@/lib/utils';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ label, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn(styles.header, className)}>
      {label && <span className={styles.label}>{label}</span>}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
