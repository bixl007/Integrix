import type { FormEvent, ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SettingsCardProps {
  title: string;
  description: string;
  /** Short note on the left of the footer (Vercel-style). */
  hint: string;
  action: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

/** A settings section: the whole card is one form, saved by the footer action. */
export function SettingsCard({
  title,
  description,
  hint,
  action,
  onSubmit,
  children,
}: SettingsCardProps) {
  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex max-w-md flex-col gap-4">{children}</CardContent>
        <CardFooter className="justify-between gap-4">
          <p className="text-sm text-muted-foreground">{hint}</p>
          {action}
        </CardFooter>
      </form>
    </Card>
  );
}
