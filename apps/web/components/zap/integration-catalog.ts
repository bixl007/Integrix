// Display copy for built-in integrations, keyed by AvailableTrigger/AvailableAction id.
// shortcut: static for built-ins only, serve it from the API once connectors are user-configurable.
export interface IntegrationInfo {
  name: string;
  kind: 'trigger' | 'action';
  description: string;
}

export const integrationCatalog: Record<string, IntegrationInfo> = {
  webhook: {
    name: 'Webhook',
    kind: 'trigger',
    description: 'Start a run whenever your zap URL receives a POST with a JSON body.',
  },
  solana: {
    name: 'Solana',
    kind: 'action',
    description: 'Transfer SOL on devnet to an address taken from the payload.',
  },
  email: {
    name: 'Email',
    kind: 'action',
    description: 'Send a templated email through your SMTP provider.',
  },
};
