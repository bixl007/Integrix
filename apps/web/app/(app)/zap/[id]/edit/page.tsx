'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { ZapBuilder } from '@/components/zap/zap-builder';
import { useApi } from '@/hooks/use-api';
import type { Zap } from '@/lib/types';

export default function EditZapPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, loading } = useApi<{ zap: Zap | null }>(`/zap/${id}`);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/zap/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon /> Back to zap
      </Link>
      {error ? (
        <Alert>{error}</Alert>
      ) : loading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-10" />
          <Skeleton className="h-72" />
        </div>
      ) : !data?.zap ? (
        <Alert variant="info">This zap does not exist or belongs to another account.</Alert>
      ) : (
        <ZapBuilder zap={data.zap} />
      )}
    </div>
  );
}
