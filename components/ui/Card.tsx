import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
  children: ReactNode;
}

export default function Card({ hoverable, glass, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(styles.card, hoverable && styles.hoverable, glass && styles.glass, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.header, className)} {...props}>{children}</div>;
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.body, className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.footer, className)} {...props}>{children}</div>;
}
