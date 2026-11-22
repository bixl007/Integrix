'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { connectionTypes } from '@/components/zap/connection-fields';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Connection } from '@/lib/types';
import { SettingsCard } from './settings-card';

const errorText = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong');

/** The user's own accounts for steps to use: lists them, adds one, removes one. */
export function ConnectionsCard() {
  const { data, error, loading, reload } = useApi<{ connections: Connection[] }>('/connection');
  const [connectorId, setConnectorId] = useState(Object.keys(connectionTypes)[0]);
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const type = connectionTypes[connectorId];

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setFailure(undefined);
    try {
      await api('/connection', {
        method: 'POST',
        body: {
          connectorId,
          name: String(data.get('name') ?? ''),
          values: Object.fromEntries(
            type.fields.map((f) => [f.key, String(data.get(f.key) ?? '')]),
          ),
        },
      });
      form.reset();
      reload();
    } catch (err) {
      setFailure(errorText(err));
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setRemoving(id);
    setFailure(undefined);
    try {
      await api(`/connection/${id}`, { method: 'DELETE' });
      reload();
    } catch (err) {
      setFailure(errorText(err));
    } finally {
      setRemoving(undefined);
    }
  }

  return (
    <SettingsCard
      title="Connections"
      description="Your own accounts for steps to use, instead of the server's. A step picks one under Send from or Pay from."
      hint="Credentials are encrypted on the server and never shown again."
      onSubmit={add}
      action={
        <Button type="submit" loading={pending}>
          Add connection
        </Button>
      }
    >
      {error ? (
        <Alert>{error}</Alert>
      ) : loading || !data ? (
        <Skeleton className="h-10" />
      ) : data.connections.length === 0 ? (
        <Alert variant="info">No connections yet. Steps use the server&apos;s accounts.</Alert>
      ) : (
        <ul className="flex flex-col gap-2">
          {data.connections.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {connectionTypes[c.connectorId]?.title ?? c.connectorId} · added{' '}
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={removing === c.id}
                onClick={() => void remove(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      {failure && <Alert>{failure}</Alert>}

      <Select
        label="New connection"
        value={connectorId}
        onChange={(e) => setConnectorId(e.target.value)}
        hint={type.help}
      >
        {Object.entries(connectionTypes).map(([id, t]) => (
          <option key={id} value={id}>
            {t.title}
          </option>
        ))}
      </Select>
      <Input name="name" label="Name" placeholder="Work Gmail" maxLength={80} required />
      {type.fields.map((f) => (
        <Input
          // Keyed by connector so switching type never carries a typed secret into another field.
          key={`${connectorId}-${f.key}`}
          name={f.key}
          label={f.label}
          placeholder={f.placeholder}
          type={f.secret ? 'password' : 'text'}
          autoComplete="off"
          required
        />
      ))}
    </SettingsCard>
  );
}
