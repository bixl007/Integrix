'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentType, SVGProps } from 'react';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import {
  BookIcon,
  BracesIcon,
  BugIcon,
  ExternalLinkIcon,
  GridIcon,
  PlugIcon,
  PlusIcon,
  SettingsIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { links } from '@/lib/links';
import { UserMenu } from './user-menu';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

// `match` decides which routes highlight the item.
const nav: { href: string; label: string; Icon: IconType; match: (path: string) => boolean }[] = [
  {
    href: '/dashboard',
    label: 'Zaps',
    Icon: GridIcon,
    match: (p) => p === '/dashboard' || (p.startsWith('/zap/') && p !== '/zap/create'),
  },
  {
    href: '/integrations',
    label: 'Integrations',
    Icon: PlugIcon,
    match: (p) => p === '/integrations',
  },
  { href: '/settings', label: 'Settings', Icon: SettingsIcon, match: (p) => p === '/settings' },
];

const resources: { href: string; label: string; Icon: IconType }[] = [
  { href: links.docs, label: 'Documentation', Icon: BookIcon },
  { href: links.apiReference, label: 'API reference', Icon: BracesIcon },
  { href: links.issues, label: 'Report an issue', Icon: BugIcon },
];

const itemClasses =
  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

/** Sidebar contents; `onNavigate` lets the mobile drawer close after a click. */
export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 p-3">
      <Logo href="/dashboard" className="px-2 pt-2" />

      <Link
        href="/zap/create"
        onClick={onNavigate}
        className={buttonVariants({ className: 'w-full' })}
      >
        <PlusIcon /> Create Zap
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {nav.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(itemClasses, active && 'bg-muted font-medium text-foreground')}
            >
              <Icon className={cn(active && 'text-foreground')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-0.5">
        <p className="px-2.5 pb-1 text-xs font-medium text-muted-foreground/70">Resources</p>
        {resources.map(({ href, label, Icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(itemClasses, 'group')}
          >
            <Icon />
            <span className="flex-1">{label}</span>
            <ExternalLinkIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        ))}
      </div>

      <div className="mt-auto border-t border-border pt-3">
        <UserMenu />
      </div>
    </div>
  );
}
