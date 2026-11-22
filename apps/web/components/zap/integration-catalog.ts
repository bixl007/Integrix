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
  schedule: {
    name: 'Schedule',
    kind: 'trigger',
    description: 'Start a run every hour or every day, with no request needed.',
  },
  delay: {
    name: 'Delay',
    kind: 'action',
    description: 'Pause the run for minutes, hours or days before the next step.',
  },
  filter: {
    name: 'Filter',
    kind: 'action',
    description: 'Continue the run only when a condition holds. Otherwise the run ends as Halted.',
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
