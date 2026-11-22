'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { refreshSession } from '@/lib/session';
import { SettingsCard } from './settings-card';

export interface Profile {
  name: string;
  email: string;
  hasPassword: boolean;
}

type Status = { type: 'error' | 'info'; text: string } | undefined;

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

/** Runs a save action and tracks its pending/result state for one card. */
function useSave() {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>();
  async function run(action: () => Promise<string | void>) {
    setPending(true);
    setStatus(undefined);
    try {
      const done = await action();
      if (done) setStatus({ type: 'info', text: done });
    } catch (e) {
      setStatus({ type: 'error', text: errorText(e) });
    } finally {
      setPending(false);
    }
  }
  return { pending, status, run };
}

function StatusMessage({ status }: { status: Status }) {
  return status ? <Alert variant={status.type}>{status.text}</Alert> : null;
}

export function NameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const { pending, status, run } = useSave();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      await api('/profile', { method: 'PATCH', body: { name } });
      setSaved(name.trim());
      await refreshSession();
      return 'Name updated.';
    });
  };

  return (
    <SettingsCard
      title="Display name"
      description="Shown in the sidebar and in emails we send you."
      hint="Up to 80 characters."
      onSubmit={onSubmit}
      action={
        <Button
          type="submit"
          size="sm"
          loading={pending}
          disabled={!name.trim() || name.trim() === saved}
        >
          Save
        </Button>
      }
    >
      <div className="flex items-end gap-4">
        <Avatar name={name || saved} className="size-10 text-sm" />
        <div className="flex-1">
          <Input
            label="Name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
        </div>
      </div>
      <StatusMessage status={status} />
    </SettingsCard>
  );
}

export function EmailForm({ initial }: { initial: string }) {
  const [current, setCurrent] = useState(initial);
  const [pendingEmail, setPendingEmail] = useState<string>();
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const { pending, status, run } = useSave();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const sendCode = (email: string) =>
    run(async () => {
      await api('/profile/email', { method: 'POST', body: { email } });
      setPendingEmail(email);
      setCode('');
      setCooldown(60);
      return `We sent a code to ${email}.`;
    });

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingEmail) {
      void sendCode(String(new FormData(e.currentTarget).get('email') ?? ''));
      return;
    }
    void run(async () => {
      const { user } = await api<{ user: { email: string } }>('/profile/email/verify', {
        method: 'POST',
        body: { code },
      });
      setCurrent(user.email);
      setPendingEmail(undefined);
      await refreshSession();
      return 'Email updated.';
    });
  };

  return (
    <SettingsCard
      title="Email address"
      description={`Currently ${current}. Used for sign-in and verification codes.`}
      hint={
        pendingEmail
          ? 'The code expires in 10 minutes.'
          : 'We’ll send a code to the new address to confirm it.'
      }
      onSubmit={onSubmit}
      action={
        <Button
          type="submit"
          size="sm"
          loading={pending}
          disabled={!!pendingEmail && code.length !== 6}
        >
          {pendingEmail ? 'Verify and update' : 'Send code'}
        </Button>
      }
    >
      {pendingEmail ? (
        <>
          <Input
            label={`Code sent to ${pendingEmail}`}
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="font-mono tracking-[0.4em]"
          />
          <div className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => sendCode(pendingEmail)}
              disabled={cooldown > 0 || pending}
              className="font-medium hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
            <button
              type="button"
              onClick={() => setPendingEmail(undefined)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <Input label="New email" name="email" type="email" autoComplete="email" required />
      )}
      <StatusMessage status={status} />
    </SettingsCard>
  );
}

export function PasswordForm({ hasPassword: initial }: { hasPassword: boolean }) {
  const [hasPassword, setHasPassword] = useState(initial);
  const [error, setError] = useState<string>();
  const { pending, status, run } = useSave();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get('newPassword') !== data.get('confirmPassword')) {
      setError('Passwords don’t match.');
      return;
    }
    setError(undefined);
    void run(async () => {
      await api('/profile/password', {
        method: 'POST',
        body: {
          currentPassword: data.get('currentPassword') ?? undefined,
          newPassword: data.get('newPassword'),
        },
      });
      form.reset();
      setHasPassword(true);
      return hasPassword
        ? 'Password changed. Other devices were signed out.'
        : 'Password set. You can now log in with email too.';
    });
  };

  return (
    <SettingsCard
      title={hasPassword ? 'Password' : 'Set a password'}
      description={
        hasPassword
          ? 'Used with your email and a verification code to log in.'
          : 'Your account uses Google sign-in. Add a password to also log in with email.'
      }
      hint={hasPassword ? 'Changing it signs out your other devices.' : 'At least 6 characters.'}
      onSubmit={onSubmit}
      action={
        <Button type="submit" size="sm" loading={pending}>
          {hasPassword ? 'Change password' : 'Set password'}
        </Button>
      }
    >
      {hasPassword && (
        <Input
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      )}
      <Input
        label="New password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <Input
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
        error={error}
      />
      <StatusMessage status={status} />
    </SettingsCard>
  );
}
