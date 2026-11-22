'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { MoreIcon, PencilIcon, TrashIcon } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Menu, MenuItem } from '@/components/ui/menu';
import { api } from '@/lib/api';
import type { Zap } from '@/lib/types';
import { stepsTitle, zapTitle } from './zap-title';

interface ZapActionsProps {
  zap: Zap;
  onRenamed: () => void;
  onDeleted: () => void;
  side?: 'top' | 'bottom';
}

/** "More" menu with Rename and Delete, plus their dialogs. */
export function ZapActions({ zap, onRenamed, onDeleted, side }: ZapActionsProps) {
  const [dialog, setDialog] = useState<'rename' | 'delete' | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const title = zapTitle(zap);

  const close = () => {
    setDialog(null);
    setError(undefined);
  };

  async function submit(request: () => Promise<unknown>, onDone: () => void) {
    setPending(true);
    setError(undefined);
    try {
      await request();
      close();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Menu
        label={`Actions for ${title}`}
        trigger={<MoreIcon />}
        side={side}
        triggerClassName={buttonVariants({ variant: 'ghost', size: 'icon' })}
        className="right-0"
      >
        <MenuItem onClick={() => setDialog('rename')}>
          <PencilIcon /> Rename
        </MenuItem>
        <MenuItem
          onClick={() => setDialog('delete')}
          className="text-destructive hover:text-destructive"
        >
          <TrashIcon /> Delete
        </MenuItem>
      </Menu>

      {dialog === 'rename' && (
        <Dialog open onClose={close} title="Rename zap">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(new FormData(e.currentTarget).get('name') ?? '');
              void submit(
                () => api(`/zap/${zap.id}`, { method: 'PATCH', body: { name } }),
                onRenamed,
              );
            }}
          >
            {error && <Alert>{error}</Alert>}
            <Input
              name="name"
              label="Name"
              defaultValue={zap.name ?? ''}
              placeholder={stepsTitle(zap)}
              maxLength={80}
              hint="Leave empty to use the step names."
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Save
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {dialog === 'delete' && (
        <Dialog open onClose={close} title="Delete zap" description="This can't be undone.">
          <div className="flex flex-col gap-4">
            {error && <Alert>{error}</Alert>}
            <p className="text-sm text-muted-foreground">
              Delete <strong className="font-medium text-foreground">{title}</strong>? Its webhook
              URL stops working and its run history is removed.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                loading={pending}
                onClick={() =>
                  void submit(() => api(`/zap/${zap.id}`, { method: 'DELETE' }), onDeleted)
                }
              >
                Delete zap
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
