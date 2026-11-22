import type { Integration } from '@/lib/types';
import type { PickedStep } from './step-picker';

/** A ready-made zap: integration ids, per-step metadata templates and a payload to test it. */
export interface ZapTemplate {
  id: string;
  name: string;
  summary: string;
  triggerId: string;
  actions: { actionId: string; metadata: Record<string, string> }[];
  samplePayload: Record<string, unknown>;
}

/** A field set to exactly this is replaced with the signed-in user's email when the builder loads a template. */
export const OWNER_EMAIL = 'you@example.com';

// Pure data keyed by integration id and field key, so it outlives where connectors are defined.
export const zapTemplates: ZapTemplate[] = [
  {
    id: 'welcome-email',
    name: 'Welcome email for new sign-ups',
    summary: 'Point your signup form at the zap URL to greet every new user.',
    triggerId: 'webhook',
    actions: [
      {
        actionId: 'email',
        metadata: {
          email: '{email}',
          subject: 'Welcome to the team, {name}',
          body: 'Hi {name},\n\nWelcome aboard! Your account is ready, so you can sign in any time.\n\nReply to this email if you have questions.\n\nThe Team',
        },
      },
    ],
    samplePayload: { name: 'Ada Lovelace', email: 'ada@example.com' },
  },
  {
    id: 'github-star-alert',
    name: 'GitHub star alert',
    summary:
      'Add the zap URL as a GitHub repository webhook (content type application/json, event "Stars") and get an email per star.',
    triggerId: 'webhook',
    actions: [
      {
        actionId: 'email',
        metadata: {
          email: OWNER_EMAIL,
          subject: '⭐ {sender.login} starred {repository.full_name}',
          body: '{sender.login} just starred {repository.full_name}.\n\nTotal stars: {repository.stargazers_count}',
        },
      },
    ],
    samplePayload: {
      action: 'created',
      sender: { login: 'octocat' },
      repository: { full_name: 'bixl007/Integrix', stargazers_count: 42 },
    },
  },
  {
    id: 'order-confirmation',
    name: 'Order confirmation and team alert',
    summary: 'One webhook from your shop emails the customer and notifies your team.',
    triggerId: 'webhook',
    actions: [
      {
        actionId: 'email',
        metadata: {
          email: '{customer.email}',
          subject: 'Order {order.id} confirmed',
          body: 'Hi {customer.name},\n\nThanks for your order! We have received it and will let you know when it ships.\n\nOrder: {order.id}\nTotal: {order.total}\n\nThe Shop team',
        },
      },
      {
        actionId: 'email',
        metadata: {
          email: OWNER_EMAIL,
          subject: 'New order {order.id} · {order.total}',
          body: 'A new order just came in.\n\nOrder: {order.id}\nCustomer: {customer.name} ({customer.email})\nTotal: {order.total}',
        },
      },
    ],
    samplePayload: {
      order: { id: 'A-1042', total: '$49.00' },
      customer: { name: 'Grace Hopper', email: 'grace@example.com' },
    },
  },
  {
    id: 'big-order-alert',
    name: 'Alert me about big orders only',
    summary:
      'A filter step ends the run for small orders, so you are only emailed when the total is above 100.',
    triggerId: 'webhook',
    actions: [
      {
        actionId: 'filter',
        metadata: { field: '{order.total}', operator: 'greater_than', value: '100' },
      },
      {
        actionId: 'email',
        metadata: {
          email: OWNER_EMAIL,
          subject: 'Big order {order.id}: {order.total}',
          body: '{customer.name} just placed order {order.id} for {order.total}.',
        },
      },
    ],
    samplePayload: { order: { id: 'A-2001', total: 250 }, customer: { name: 'Grace Hopper' } },
  },
  {
    id: 'delayed-follow-up',
    name: 'Welcome now, follow up a day later',
    summary:
      'Greets a new user straight away, waits a day without holding anything up, then checks in.',
    triggerId: 'webhook',
    actions: [
      {
        actionId: 'email',
        metadata: {
          email: '{email}',
          subject: 'Welcome, {name}',
          body: 'Hi {name},\n\nThanks for signing up. Your account is ready.',
        },
      },
      { actionId: 'delay', metadata: { amount: '1', unit: 'days' } },
      {
        actionId: 'email',
        metadata: {
          email: '{email}',
          subject: 'How is it going, {name}?',
          body: 'Hi {name},\n\nYou joined yesterday. Reply to this email if you need a hand getting started.',
        },
      },
    ],
    samplePayload: { name: 'Ada Lovelace', email: 'ada@example.com' },
  },
  {
    id: 'sol-payout-receipt',
    name: 'SOL payout with receipt',
    summary: 'Send devnet SOL to a wallet from the payload, then email the recipient a receipt.',
    triggerId: 'webhook',
    actions: [
      { actionId: 'solana', metadata: { amount: '{amount}', address: '{wallet}' } },
      {
        actionId: 'email',
        metadata: {
          email: '{email}',
          subject: 'You received {amount} SOL',
          body: 'Hi {name},\n\nWe sent {amount} SOL (devnet) to your wallet:\n{wallet}\n\nIt can take a few seconds to show up in your balance.',
        },
      },
    ],
    samplePayload: {
      name: 'Sunny',
      email: 'receiver@example.com',
      amount: '0.01',
      wallet: 'G4wJLrP971arCEKvcCJnW6K2932GRtAeHtKRMYSZsSja',
    },
  },
];

/** Builder steps for a template, or undefined when an integration it needs isn't available. */
export function templateSteps(
  template: ZapTemplate,
  triggers: Integration[],
  actions: Integration[],
  ownerEmail: string,
): { trigger: PickedStep; steps: PickedStep[] } | undefined {
  const trigger = triggers.find((t) => t.id === template.triggerId);
  if (!trigger) return undefined;
  const steps: PickedStep[] = [];
  for (const a of template.actions) {
    const integration = actions.find((i) => i.id === a.actionId);
    if (!integration) return undefined;
    const metadata = Object.fromEntries(
      Object.entries(a.metadata).map(([key, value]) => [
        key,
        value === OWNER_EMAIL ? ownerEmail : value,
      ]),
    );
    steps.push({ integration, metadata });
  }
  return { trigger: { integration: trigger, metadata: {} }, steps };
}

/** The `POST /api/v1/zap` body that creates this template. */
export function templateRequestBody(template: ZapTemplate) {
  return {
    name: template.name,
    availableTriggerId: template.triggerId,
    triggerMetadata: {},
    actions: template.actions.map((a) => ({
      availableActionId: a.actionId,
      actionMetadata: a.metadata,
    })),
  };
}
