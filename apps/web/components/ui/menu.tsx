'use client';

import Link from 'next/link';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/cn';

const MenuContext = createContext<() => void>(() => {});

interface MenuProps {
  trigger: ReactNode;
  label: string;
  children: ReactNode;
  /** Where the panel opens relative to the trigger. */
  side?: 'top' | 'bottom';
  triggerClassName?: string;
  className?: string;
}

/** Dropdown menu: toggles on click, closes on outside click, Esc or item select. */
export function Menu({
  trigger,
  label,
  children,
  side = 'bottom',
  triggerClassName,
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {open && (
        <MenuContext.Provider value={() => setOpen(false)}>
          <div
            role="menu"
            className={cn(
              'absolute z-50 min-w-56 animate-fade-in rounded-lg border border-border bg-background p-1 shadow-xl',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
              className,
            )}
          >
            {children}
          </div>
        </MenuContext.Provider>
      )}
    </div>
  );
}

const itemClasses =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function MenuItem({ className, onClick, ...props }: ComponentProps<'button'>) {
  const close = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(itemClasses, className)}
      onClick={(e) => {
        onClick?.(e);
        close();
      }}
      {...props}
    />
  );
}

export function MenuLink({ className, ...props }: ComponentProps<typeof Link>) {
  const close = useContext(MenuContext);
  return <Link role="menuitem" className={cn(itemClasses, className)} onClick={close} {...props} />;
}

export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border" />;
}

export function MenuLabel({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-2 py-1.5 text-sm', className)} {...props} />;
}
