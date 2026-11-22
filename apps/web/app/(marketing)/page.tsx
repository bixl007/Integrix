import Link from 'next/link';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { buttonVariants } from '@/components/ui/button';
import {
  ArrowRightIcon,
  BracesIcon,
  GithubIcon,
  LayersIcon,
  MailIcon,
  PlusIcon,
  ShieldIcon,
  SolanaIcon,
  WebhookIcon,
} from '@/components/ui/icons';
import { StepConnector } from '@/components/zap/step-node';
import { links } from '@/lib/links';

// Server component: static HTML, no page JS. Motion is CSS-only.

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const flow: { label: string; name: string; detail: string; Icon: IconType }[] = [
  { label: 'Trigger', name: 'Webhook', detail: 'POST /hooks/catch/1/9f3c…', Icon: WebhookIcon },
  { label: 'Action 1', name: 'Solana', detail: 'send {amount} SOL → {address}', Icon: SolanaIcon },
  { label: 'Action 2', name: 'Email', detail: 'to {email}: "Hi {name}, …"', Icon: MailIcon },
];

const integrations: { name: string; kind: string; body: string; Icon: IconType }[] = [
  {
    name: 'Webhook',
    kind: 'Trigger',
    body: 'Any service that can send an HTTP POST.',
    Icon: WebhookIcon,
  },
  {
    name: 'Solana',
    kind: 'Action',
    body: 'Transfer SOL on devnet from your wallet.',
    Icon: SolanaIcon,
  },
  {
    name: 'Email',
    kind: 'Action',
    body: 'Templated emails through any SMTP provider.',
    Icon: MailIcon,
  },
];

const features: { title: string; body: string; Icon: IconType }[] = [
  {
    title: 'Webhook triggers',
    body: 'Every zap gets its own URL. POST any JSON to start a run.',
    Icon: WebhookIcon,
  },
  {
    title: 'Multi-step actions',
    body: 'Each step is its own Kafka message, so a failure retries alone.',
    Icon: LayersIcon,
  },
  {
    title: 'Templated payloads',
    body: 'Use {name} or {user.email} from the request in any step.',
    Icon: BracesIcon,
  },
  {
    title: 'Never drop an event',
    body: 'Runs and their outbox rows commit in one transaction before anything is queued.',
    Icon: ShieldIcon,
  },
];

const steps = [
  { title: 'Create a zap', body: 'Pick the webhook trigger and chain the actions you need.' },
  { title: 'Copy its URL', body: 'Each zap gets a unique endpoint on the hooks service.' },
  {
    title: 'Send an event',
    body: 'POST JSON from anywhere. Steps run in order, in the background.',
  },
];

const payload = `curl -X POST $ZAP_URL \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Ada",
    "email": "ada@example.com",
    "amount": "0.1",
    "address": "G4wJ…Sja"
  }'`;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Integrations />
      <Features />
      <HowItWorks />
      <CallToAction />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Static grid only: no blur filters or JS animation. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_65%)] bg-[size:48px_48px]"
      />

      <div className="relative mx-auto grid max-w-6xl animate-fade-in items-center gap-16 px-4 pt-20 pb-24 sm:px-6 md:pt-28 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <a
            href={links.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
          >
            <span className="size-1.5 rounded-full bg-success" />
            Open source · self-hostable
            <ArrowRightIcon className="size-3" />
          </a>
          <h1 className="text-4xl font-semibold tracking-tighter text-balance sm:text-6xl">
            Automate anything that <span className="text-muted-foreground">speaks HTTP.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-balance text-muted-foreground">
            Integrix turns a single webhook into a reliable chain of actions: send SOL, fire off
            emails and more, backed by Postgres and Kafka.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
              Start building free <ArrowRightIcon />
            </Link>
            <a
              href={links.repo}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              <GithubIcon /> Star on GitHub
            </a>
          </div>
        </div>

        <ol aria-label="Example zap" className="mx-auto flex w-full max-w-md flex-col items-center">
          {flow.map(({ label, name, detail, Icon }, i) => (
            <li key={name} className="flex w-full flex-col items-center">
              {i > 0 && <StepConnector animated />}
              <div className="flex w-full items-center gap-4 rounded-lg border border-border bg-background/90 p-4 shadow-sm backdrop-blur">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground uppercase">{label}</span>
                  <span className="block font-medium">{name}</span>
                  <span className="block truncate font-mono text-xs text-muted-foreground">
                    {detail}
                  </span>
                </span>
                <span aria-hidden className="ml-auto size-2 shrink-0 rounded-full bg-success" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section id="integrations" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="Integrations" title="Start small. Chain what you need.">
        A focused set of built-ins today, with a handler registry that makes the next one a single
        file.
      </SectionHeading>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map(({ name, kind, body, Icon }) => (
          <div
            key={name}
            className="group rounded-lg border border-border p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-md border border-border bg-background-subtle transition-colors group-hover:text-foreground">
                <Icon className="size-5" />
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {kind}
              </span>
            </div>
            <h3 className="mt-4 font-medium">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong p-5 text-center text-sm text-muted-foreground">
          <PlusIcon className="size-5" />
          More coming soon
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-border bg-background-subtle">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading eyebrow="Features" title="Small surface, solid core.">
          The pieces you need to ship event-driven automations, without the clutter.
        </SectionHeading>
        <div className="mt-12 grid overflow-hidden rounded-lg border border-border bg-background sm:grid-cols-2">
          {features.map(({ title, body, Icon }) => (
            <div key={title} className="-mt-px -ml-px border-t border-l border-border p-8">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Icon />
              </span>
              <h3 className="mt-5 font-medium">{title}</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto grid w-full max-w-6xl scroll-mt-20 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2"
    >
      <div>
        <SectionHeading eyebrow="How it works" title="From request to result in three steps." />
        <ol className="mt-10 flex flex-col gap-8">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border font-mono text-sm">
                {i + 1}
              </span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      {/* Terminal stays dark in both themes, like a real terminal. */}
      <div className="self-center overflow-hidden rounded-lg border border-border bg-[#0a0a0a] text-[#ededed] shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="ml-3 font-mono text-xs text-white/50">terminal</span>
        </div>
        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
          <code>{payload}</code>
        </pre>
        <p className="border-t border-white/10 px-5 py-3 font-mono text-xs text-[#3ecf8e]">
          {'{ "message": "Webhook received" }'}
        </p>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <div className="rounded-xl border border-border bg-background-subtle">
        <div className="flex flex-col items-center rounded-xl px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ship your first zap in a minute.
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Sign up, pick a trigger, add actions, copy the URL. That’s it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
              Get started <ArrowRightIcon />
            </Link>
            <Link href={links.docs} className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
    </div>
  );
}
