'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

// A section is current once its top passes this line, just under the sticky header.
const ACTIVE_LINE_PX = 120;

interface TocItem {
  id: string;
  label: string;
}

/** "On this page" nav that highlights the section being read. */
export function DocsToc({ items }: { items: readonly TocItem[] }) {
  const [active, setActive] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The last sections are too short to reach the line, so the page bottom selects the last one.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = items[0]?.id;
      for (const { id } of items) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= ACTIVE_LINE_PX) current = id;
      }
      setActive(atBottom ? items.at(-1)?.id : current);
    };
    // Scroll-driven and frame-throttled: no work while the page is idle.
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className="sticky top-24 flex flex-col gap-1 text-sm">
      <p className="pb-2 text-xs font-medium text-muted-foreground/70">On this page</p>
      {items.map((item) => {
        const current = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={current ? 'location' : undefined}
            className={cn(
              'rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              current && 'bg-muted font-medium text-foreground',
            )}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
