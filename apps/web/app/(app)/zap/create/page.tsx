'use client';

import { useSearchParams } from 'next/navigation';
import { ZapBuilder } from '@/components/zap/zap-builder';
import { zapTemplates } from '@/components/zap/zap-templates';

export default function CreateZapPage() {
  // Read from the live URL: this page is prerendered, so the searchParams prop would be empty.
  const templateId = useSearchParams().get('template');
  const template = zapTemplates.find((t) => t.id === templateId);
  // Keyed so switching templates (or to a blank zap) starts from fresh builder state.
  return <ZapBuilder key={template?.id ?? 'blank'} template={template} />;
}
