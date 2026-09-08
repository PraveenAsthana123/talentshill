'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import styles from './Login.module.css';

const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface OAuthStatus {
  google: boolean;
  microsoft: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  // null = still checking server config; avoids a flash of enabled buttons
  // that then get disabled once we know the real status.
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null);

  // Read ?oauth_error=... from a failed-closed OAuth callback redirect.
  // Uses window.location directly (rather than useSearchParams) so this
  // page doesn't need a Suspense boundary for static rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      setServerError(oauthError);
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth/oauth/status')
      .then((res) => (res.ok ? res.json() : { google: false, microsoft: false }))
      .then((data: OAuthStatus) => setOauthStatus(data))
      .catch(() => setOauthStatus({ google: false, microsoft: false }));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setServerError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.error || 'Login failed. Please try again.');
        return;
      }

      router.push('/admin');
    } catch {
      setServerError('Network error. Please check your connection and try again.');
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="48" height="48" rx="12" fill="var(--color-primary, #2563eb)" />
            <path
              d="M14 18h20M14 24h20M14 30h12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>
          Sign in to manage your TalentsHill dashboard
        </p>

        {serverError && (
          <div className={styles.error} role="alert">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label="Email"
            type="email"
            placeholder="admin@talentshill.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <div className={styles.oauthGroup}>
          <a
            href={oauthStatus?.google ? '/api/auth/oauth/google' : undefined}
            aria-disabled={!oauthStatus?.google}
            className={styles.oauthButton}
            onClick={(e) => {
              if (!oauthStatus?.google) e.preventDefault();
            }}
          >
            <GoogleIcon />
            {oauthStatus === null
              ? 'Continue with Google'
              : oauthStatus.google
                ? 'Continue with Google'
                : 'Google sign-in not configured'}
          </a>

          <a
            href={oauthStatus?.microsoft ? '/api/auth/oauth/microsoft' : undefined}
            aria-disabled={!oauthStatus?.microsoft}
            className={styles.oauthButton}
            onClick={(e) => {
              if (!oauthStatus?.microsoft) e.preventDefault();
            }}
          >
            <MicrosoftIcon />
            {oauthStatus === null
              ? 'Continue with Microsoft'
              : oauthStatus.microsoft
                ? 'Continue with Microsoft'
                : 'Microsoft sign-in not configured'}
          </a>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect x="1" y="1" width="7.5" height="7.5" fill="#F25022" />
      <rect x="9.5" y="1" width="7.5" height="7.5" fill="#7FBA00" />
      <rect x="1" y="9.5" width="7.5" height="7.5" fill="#00A4EF" />
      <rect x="9.5" y="9.5" width="7.5" height="7.5" fill="#FFB900" />
    </svg>
  );
}
