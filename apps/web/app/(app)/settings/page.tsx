'use client';

import { ConnectionsCard } from '@/components/settings/connections';
import {
  EmailForm,
  NameForm,
  PasswordForm,
  type Profile,
} from '@/components/settings/profile-forms';
import { Alert } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useApi } from '@/hooks/use-api';

export default function SettingsPage() {
  const { data, error, loading } = useApi<{ profile: Profile }>('/profile');

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, how you sign in and the accounts your steps use.
        </p>
      </div>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading || !data ? (
        <div className="flex flex-col gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 rounded-lg" />
          ))}
        </div>
      ) : (
        // Forms own their state, seeded once from the loaded profile.
        <div className="flex flex-col gap-6">
          <NameForm initial={data.profile.name} />
          <EmailForm initial={data.profile.email} />
          <PasswordForm hasPassword={data.profile.hasPassword} />
          <ConnectionsCard />
        </div>
      )}
    </div>
  );
}
