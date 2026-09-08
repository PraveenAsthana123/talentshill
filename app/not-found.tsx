import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-accent)', lineHeight: 1 }}>404</div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>Page Not Found</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>The page you are looking for does not exist.</p>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
    </div>
  );
}
