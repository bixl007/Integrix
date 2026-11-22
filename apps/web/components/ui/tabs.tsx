import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface TabItem {
  label: string;
  href: string;
  active: boolean;
}

/** Link tabs: each tab is a URL, so a view can be linked to and needs no client state. */
export function Tabs({ label, tabs }: { label: string; tabs: TabItem[] }) {
  return (
    <nav aria-label={label} className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          scroll={false}
          aria-current={tab.active ? 'page' : undefined}
          className={cn(
            '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
            tab.active
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
