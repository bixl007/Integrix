import type { ComponentType, SVGProps } from 'react';
import {
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  MailIcon,
  SolanaIcon,
  WebhookIcon,
} from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { Integration } from '@/lib/types';

// Built-in integrations render a design-system icon, keyed by AvailableTrigger/AvailableAction id.
const builtIn: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  webhook: WebhookIcon,
  solana: SolanaIcon,
  email: MailIcon,
  schedule: CalendarIcon,
  delay: ClockIcon,
  filter: FilterIcon,
};

const frame =
  'flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background';

/** Integration logo: a local monochrome icon for built-ins, the API image URL otherwise. */
export function IntegrationIcon({
  integration,
  className,
}: {
  integration: Integration;
  className?: string;
}) {
  const Icon = builtIn[integration.id];
  if (Icon) {
    return (
      <span
        role="img"
        aria-label={integration.name}
        title={integration.name}
        className={cn(frame, 'text-foreground', className)}
      >
        <Icon className="size-1/2" />
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- third-party integration logos from the API
    <img
      src={integration.image}
      alt={integration.name}
      width={32}
      height={32}
      loading="lazy"
      decoding="async"
      className={cn(frame, 'object-contain p-1', className)}
    />
  );
}
