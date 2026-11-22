/** A service that can call a zap's webhook URL, and how its requests are verified. */
export interface WebhookSender {
  /** The webhook trigger's `sender` setting; matches the verifier registry in apps/hooks. */
  id: string;
  name: string;
  /** The header the hooks service checks when the trigger has a signing secret. */
  verifiedBy: string;
  /** Where to put the zap URL and the secret on the sender's side. */
  setup: string;
  /** A trimmed example of what the sender posts, for the docs and for field suggestions. */
  samplePayload?: unknown;
}

// Pure data keyed by id, so it can move to the database with the rest of the connector catalog.
export const webhookSenders: WebhookSender[] = [
  {
    id: 'generic',
    name: 'Any sender',
    verifiedBy:
      'X-Integrix-Secret (the secret itself) or X-Integrix-Signature: sha256=<hex HMAC-SHA256 of the body>',
    setup:
      'Send the secret in an X-Integrix-Secret header. If the sender can sign requests, send the HMAC-SHA256 of the raw body instead.',
  },
  {
    id: 'github',
    name: 'GitHub',
    verifiedBy: 'X-Hub-Signature-256',
    setup:
      'Repository or organization Settings, Webhooks, Add webhook. Use the zap URL as the payload URL, content type application/json, and the same secret.',
    samplePayload: {
      action: 'created',
      sender: { login: 'octocat' },
      repository: {
        full_name: 'bixl007/Integrix',
        html_url: 'https://github.com/bixl007/Integrix',
        stargazers_count: 42,
      },
    },
  },
  {
    id: 'stripe',
    name: 'Stripe',
    verifiedBy: 'Stripe-Signature (timestamp and v1 signature, valid for 5 minutes)',
    setup:
      "Developers, Webhooks, Add endpoint with the zap URL. Copy the endpoint's signing secret (whsec_...) into the trigger.",
    samplePayload: {
      id: 'evt_1PabcXYZ',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_3PabcXYZ',
          amount: 4900,
          currency: 'usd',
          receipt_email: 'grace@example.com',
        },
      },
    },
  },
  {
    id: 'shopify',
    name: 'Shopify',
    verifiedBy: 'X-Shopify-Hmac-Sha256',
    setup:
      'Settings, Notifications, Webhooks, Create webhook in JSON format. Use the signing secret shown on that page (for an app, its client secret).',
    samplePayload: {
      id: 820982911946154500,
      order_number: 1234,
      email: 'grace@example.com',
      total_price: '49.00',
      currency: 'USD',
      customer: { first_name: 'Grace', last_name: 'Hopper' },
    },
  },
  {
    id: 'typeform',
    name: 'Typeform',
    verifiedBy: 'Typeform-Signature',
    setup:
      'Open the form, Connect, Webhooks, Add a webhook with the zap URL. Edit the webhook and set its secret to the same value.',
    samplePayload: {
      event_id: '01HXYZ',
      event_type: 'form_response',
      form_response: {
        form_id: 'lT4Z3j',
        submitted_at: '2026-11-22T10:15:00Z',
        hidden: { email: 'ada@example.com' },
        answers: [{ type: 'text', text: 'Ada Lovelace', field: { ref: 'name' } }],
      },
    },
  },
  {
    id: 'calendly',
    name: 'Calendly',
    verifiedBy: 'Calendly-Webhook-Signature (timestamp and v1 signature, valid for 3 minutes)',
    setup:
      'Create a webhook subscription through the Calendly API with the zap URL and signing_key set to the same secret. Calendly offers webhooks on its paid plans only; Cal.com is a free alternative.',
    samplePayload: {
      event: 'invitee.created',
      payload: {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        scheduled_event: { name: 'Intro call', start_time: '2026-11-25T15:00:00Z' },
      },
    },
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    verifiedBy: 'X-Cal-Signature-256',
    setup:
      'Settings, Developer, Webhooks, New. Use the zap URL as the subscriber URL, pick the booking events and set the secret to the same value. Cal.com is open source and can be self-hosted for free; the hosted service calls https URLs only.',
    samplePayload: {
      triggerEvent: 'BOOKING_CREATED',
      createdAt: '2026-11-22T10:15:00Z',
      payload: {
        title: 'Intro call between Ada and Grace',
        startTime: '2026-11-25T15:00:00Z',
        endTime: '2026-11-25T15:30:00Z',
        organizer: { name: 'Grace Hopper', email: 'grace@example.com' },
        attendees: [{ name: 'Ada Lovelace', email: 'ada@example.com' }],
      },
    },
  },
  {
    id: 'helius',
    name: 'Helius',
    verifiedBy: 'Authorization (must equal the secret)',
    setup:
      'Dashboard, Webhooks, New webhook with the zap URL, and set its authentication header to the same secret. Helius posts a list of transactions, so read fields by position, for example {0.signature}.',
    samplePayload: [
      {
        type: 'TRANSFER',
        signature:
          '5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW',
        description: 'G4wJ... transferred 0.5 SOL to 9xQe...',
        feePayer: 'G4wJLrP971arCEKvcCJnW6K2932GRtAeHtKRMYSZsSja',
        timestamp: 1795862400,
        nativeTransfers: [
          {
            fromUserAccount: 'G4wJLrP971arCEKvcCJnW6K2932GRtAeHtKRMYSZsSja',
            toUserAccount: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
            amount: 500000000,
          },
        ],
      },
    ],
  },
];

export const webhookSender = (id: string | undefined) =>
  webhookSenders.find((s) => s.id === id) ?? webhookSenders[0];
