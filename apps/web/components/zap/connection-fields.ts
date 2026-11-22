import type { ActionField } from './action-fields';

/** What a user enters to connect their own account for a connector. */
export interface ConnectionType {
  title: string;
  help: string;
  fields: ActionField[];
}

// Keyed by connector id; the keys of `fields` match the catalog's connectionFields.
export const connectionTypes: Record<string, ConnectionType> = {
  email: {
    title: 'Gmail account',
    help: 'Use an app password, not your Google password. Create one under Google Account, Security, 2-Step Verification, App passwords.',
    fields: [
      { key: 'user', label: 'Gmail address', placeholder: 'you@gmail.com' },
      {
        key: 'appPassword',
        label: 'App password',
        placeholder: 'abcd efgh ijkl mnop',
        secret: true,
      },
    ],
  },
  solana: {
    title: 'Solana wallet (devnet)',
    help: 'The base58 secret key of a devnet wallet. Transfers run on devnet only, so never enter a wallet that holds real funds.',
    fields: [
      { key: 'privateKey', label: 'Secret key', placeholder: 'base58 secret key', secret: true },
    ],
  },
};
