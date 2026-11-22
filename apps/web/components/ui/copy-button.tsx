'use client';

import { useEffect, useState } from 'react';
import { Button, type ButtonStyleProps } from './button';
import { CheckIcon, CopyIcon } from './icons';

export function CopyButton({
  value,
  label = 'Copy',
  ...style
}: { value: string; label?: string } & ButtonStyleProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      {...style}
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          () => {},
        );
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </Button>
  );
}
