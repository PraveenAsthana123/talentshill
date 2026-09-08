export default function Loading() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-accent)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Loading...</span>
      </div>
    </div>
  );
}
