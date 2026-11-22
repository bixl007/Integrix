'use client';

import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { BoltIcon, LayersIcon, PlugIcon, PlusIcon, WebhookIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { StepConnector } from '@/components/zap/step-node';
import { ZapCard } from '@/components/zap/zap-card';
import { useApi } from '@/hooks/use-api';
import { useSession } from '@/lib/session';
import type { Zap } from '@/lib/types';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function DashboardPage() {
  const { data, error, loading } = useApi<{ zaps: Zap[] }>('/zap');
  const session = useSession();
  const user = session.status === 'authenticated' ? session.user : undefined;
  const zaps = data?.zaps ?? [];

  const stats = [
    { label: 'Zaps', value: zaps.length, Icon: BoltIcon },
    {
      label: 'Action steps',
      value: zaps.reduce((n, z) => n + z.actions.length, 0),
      Icon: LayersIcon,
    },
    {
      label: 'Integrations in use',
      value: new Set(zaps.flatMap((z) => z.actions.map((a) => a.type.id))).size,
      Icon: PlugIcon,
    },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting()}
            {user && `, ${user.name.split(' ')[0]}`}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s what your automations look like today.
          </p>
        </div>
        <Link href="/zap/create" className={buttonVariants()}>
          <PlusIcon /> New Zap
        </Link>
      </div>

      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-52 rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map(({ label, value, Icon }) => (
              <div key={label} className="rounded-lg border border-border p-3 sm:p-5">
                <dt className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm [&>svg]:hidden sm:[&>svg]:block">
                  <Icon /> {label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums sm:mt-2 sm:text-3xl">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <section>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">Your Zaps</h2>
            {zaps.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {zaps.map((zap) => (
                  <ZapCard key={zap.id} zap={zap} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

const previewSteps = [
  { label: 'When this happens', name: 'Webhook received', Icon: WebhookIcon },
  { label: 'Do this', name: 'Send SOL or an email', Icon: BoltIcon },
];

function EmptyState() {
  return (
    <div className="grid items-center gap-10 overflow-hidden rounded-lg border border-border bg-background-subtle p-8 md:grid-cols-2 md:p-12">
      <div>
        <h3 className="text-xl font-semibold tracking-tight">Build your first Zap</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Pick a trigger, chain one or more actions, and get a webhook URL. Every POST to it runs
          your actions in order.
        </p>
        <Link href="/zap/create" className={buttonVariants({ className: 'mt-6' })}>
          <PlusIcon /> Create a Zap
        </Link>
      </div>
      <ol aria-label="Example zap" className="flex flex-col items-center">
        {previewSteps.map(({ label, name, Icon }, i) => (
          <li key={name} className="flex w-full max-w-xs flex-col items-center">
            {i > 0 && <StepConnector animated />}
            <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon />
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className="block text-sm font-medium">{name}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
