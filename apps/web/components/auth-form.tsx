'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { refreshSession, useSession } from '@/lib/session';
import { Alert } from './ui/alert';
import { Button, buttonVariants } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { ArrowLeftIcon, GoogleIcon, MailCheckIcon } from './ui/icons';
import { Input } from './ui/input';

const copy = {
  login: {
    title: 'Log in to Integrix',
    submit: 'Continue',
    endpoint: '/user/signin',
    alt: { text: "Don't have an account?", href: '/signup', link: 'Sign up' },
  },
  signup: {
    title: 'Create your account',
    submit: 'Create account',
    endpoint: '/user/signup',
    alt: { text: 'Already have an account?', href: '/login', link: 'Log in' },
  },
} as const;

const providerIcons: Record<string, typeof GoogleIcon> = { google: GoogleIcon };
const RESEND_COOLDOWN_S = 60;

const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

/** Login/signup in two steps: credentials (or OAuth), then the emailed 6-digit code. */
export function AuthForm({ mode, oauthError }: { mode: keyof typeof copy; oauthError?: boolean }) {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState<string>();

  // Already signed in (e.g. back button after login): skip the form.
  useEffect(() => {
    if (session.status === 'authenticated') router.replace('/dashboard');
  }, [session.status, router]);

  return email ? (
    <OtpStep
      email={email}
      onBack={() => setEmail(undefined)}
      onVerified={async () => {
        await refreshSession();
        router.push('/dashboard');
      }}
    />
  ) : (
    <CredentialsStep mode={mode} oauthError={oauthError} onCodeSent={setEmail} />
  );
}

function CredentialsStep({
  mode,
  oauthError,
  onCodeSent,
}: {
  mode: keyof typeof copy;
  oauthError?: boolean;
  onCodeSent: (email: string) => void;
}) {
  const c = copy[mode];
  const providers =
    useApi<{ providers: { id: string; label: string }[] }>('/auth/providers').data?.providers ?? [];
  const [error, setError] = useState<string | undefined>(
    oauthError ? 'Sign-in with that provider failed. Try again or use email.' : undefined,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      const res = await api<{ email: string }>(c.endpoint, { method: 'POST', body });
      onCodeSent(res.email);
    } catch (err) {
      setError(message(err));
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">{c.title}</h1>
      <Card>
        <CardContent className="flex flex-col gap-4">
          {providers.length > 0 && (
            <>
              <div className="flex flex-col gap-2">
                {providers.map(({ id, label }) => {
                  const Icon = providerIcons[id];
                  return (
                    <a
                      key={id}
                      href={`${API_URL}/api/v1/auth/oauth/${id}`}
                      className={buttonVariants({ variant: 'secondary', className: 'w-full' })}
                    >
                      {Icon && <Icon />} Continue with {label}
                    </a>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or with email
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && <Input name="name" label="Name" autoComplete="name" required />}
            <Input name="username" type="email" label="Email" autoComplete="email" required />
            <Input
              name="password"
              type="password"
              label="Password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={mode === 'signup' ? 6 : undefined}
              hint={mode === 'signup' ? 'At least 6 characters.' : undefined}
              required
            />
            {error && <Alert>{error}</Alert>}
            <Button type="submit" loading={loading} className="mt-2">
              {c.submit}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          {c.alt.text}
          <Link
            href={c.alt.href}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {c.alt.link}
          </Link>
        </CardFooter>
      </Card>
    </>
  );
}

function OtpStep({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => Promise<void>;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      await api('/user/verify-otp', { method: 'POST', body: { username: email, code } });
      await onVerified();
    } catch (err) {
      setError(message(err));
      setLoading(false);
    }
  }

  async function resend() {
    setError(undefined);
    try {
      await api('/user/resend-otp', { method: 'POST', body: { username: email } });
      setInfo('A new code is on its way.');
      setCooldown(RESEND_COOLDOWN_S);
    } catch (err) {
      setError(message(err));
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-full border border-border bg-background">
          <MailCheckIcon className="size-5" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>
      <Card>
        <CardContent>
          <form onSubmit={verify} className="flex flex-col gap-4">
            <Input
              label="Verification code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="000000"
              autoFocus
              required
              className="h-12 text-center font-mono text-xl tracking-[0.5em]"
            />
            {error && <Alert>{error}</Alert>}
            {info && !error && <Alert variant="info">{info}</Alert>}
            <Button type="submit" loading={loading} disabled={code.length !== 6}>
              Verify and continue
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-between text-sm">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon /> Use a different email
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={cooldown > 0}
            className="font-medium text-foreground hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </CardFooter>
      </Card>
    </>
  );
}
