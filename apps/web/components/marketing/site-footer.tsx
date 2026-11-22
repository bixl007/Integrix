import Link from 'next/link';
import { Logo } from '@/components/logo';
import { GithubIcon, LinkedinIcon, XIcon } from '@/components/ui/icons';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';
import { links } from '@/lib/links';

const columns: { title: string; items: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'Features', href: '/#features' },
      { label: 'Integrations', href: '/#integrations' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Documentation', href: links.docs },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Developers',
    items: [
      { label: 'Source code', href: links.repo, external: true },
      { label: 'API reference', href: links.apiReference },
      { label: 'Architecture', href: links.architecture, external: true },
      { label: 'Self-hosting', href: links.selfHosting, external: true },
      { label: 'Report an issue', href: links.issues, external: true },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'GitHub', href: links.github, external: true },
      { label: 'LinkedIn', href: links.linkedin, external: true },
      { label: 'X (Twitter)', href: links.x, external: true },
      { label: 'Portfolio', href: links.author, external: true },
    ],
  },
];

const socials = [
  { href: links.github, label: 'GitHub', Icon: GithubIcon },
  { href: links.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
  { href: links.x, label: 'X (Twitter)', Icon: XIcon },
];

const stack = ['Bun', 'Next.js', 'Kafka', 'Postgres'];

/** Marketing footer only; the signed-in app shell has none. */
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background-subtle">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Automations that turn a webhook or a schedule into a reliable chain of steps.
          </p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
            {stack.map((s) => (
              <li
                key={s}
                className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 text-sm font-medium">{col.title}</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="hover:text-foreground">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-border px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} Integrix · Built by{' '}
          <a
            href={links.author}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Bishal Baira
          </a>
        </p>
        <div className="flex items-center gap-1">
          {socials.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-md p-2 hover:bg-muted hover:text-foreground"
            >
              <Icon />
            </a>
          ))}
          <ThemeSwitcher className="ml-2" />
        </div>
      </div>

      {/* Oversized wordmark, clipped by the footer edge. */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.28em] text-center text-[22vw] leading-none font-bold tracking-tighter text-foreground/10 select-none"
      >
        Integrix
      </p>
    </footer>
  );
}
