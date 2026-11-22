// Config fields per connector id (AvailableAction.id or AvailableTrigger.id). Add an entry to support a new connector's UI.
export interface ActionField {
  key: string;
  label: string;
  /** Example value; also the example shown in the docs. */
  placeholder: string;
  multiline?: boolean;
  /** Renders a select with these choices instead of a text input. */
  options?: { value: string; label: string }[];
  /** The field may be left empty. */
  optional?: boolean;
  /** A credential: typed like a password, and the API returns a mask instead of the value. */
  secret?: boolean;
}

export const actionFields: Record<string, ActionField[]> = {
  schedule: [
    {
      key: 'interval',
      label: 'Run',
      placeholder: 'hourly',
      // The ids match scheduleIntervals in @integrix/database.
      options: [
        { value: 'hourly', label: 'Every hour' },
        { value: 'daily', label: 'Every day' },
      ],
    },
  ],
  delay: [
    { key: 'amount', label: 'Wait for', placeholder: '30' },
    {
      key: 'unit',
      label: 'Unit',
      placeholder: 'minutes',
      // The ids match the worker's delay units.
      options: [
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' },
      ],
    },
  ],
  email: [
    { key: 'email', label: 'To', placeholder: '{email}' },
    { key: 'subject', label: 'Subject', placeholder: 'Your order {order.id} is confirmed' },
    {
      key: 'body',
      label: 'Body',
      // A blank line starts a new paragraph in the sent email.
      placeholder: 'Hi {name},\n\nThanks for your order of {amount}.\n\nThe Integrix team',
      multiline: true,
    },
  ],
  filter: [
    { key: 'field', label: 'Value to check', placeholder: '{order.total}' },
    {
      key: 'operator',
      label: 'Condition',
      placeholder: 'greater_than',
      // The ids match the worker's filterOperators registry.
      options: [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Does not equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does not contain' },
        { value: 'greater_than', label: 'Is greater than (number)' },
        { value: 'less_than', label: 'Is less than (number)' },
        { value: 'is_empty', label: 'Is empty' },
        { value: 'is_not_empty', label: 'Is not empty' },
      ],
    },
    { key: 'value', label: 'Compare with', placeholder: '100', optional: true },
  ],
  http: [
    {
      key: 'method',
      label: 'Method',
      placeholder: 'POST',
      options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => ({ value: m, label: m })),
    },
    { key: 'url', label: 'URL', placeholder: 'https://api.example.com/orders' },
    {
      key: 'headers',
      label: 'Headers',
      placeholder: 'Authorization: Bearer <token>',
      multiline: true,
      optional: true,
      secret: true,
    },
    {
      key: 'body',
      label: 'Body',
      placeholder: '{"orderId": "{order.id}"}',
      multiline: true,
      optional: true,
    },
  ],
  slack: [
    {
      key: 'webhookUrl',
      label: 'Incoming webhook URL',
      placeholder: 'https://hooks.slack.com/services/T000/B000/XXXX',
      secret: true,
    },
    {
      key: 'text',
      label: 'Message',
      placeholder: 'New order {order.id} from {customer.name}',
      multiline: true,
    },
  ],
  discord: [
    {
      key: 'webhookUrl',
      label: 'Webhook URL',
      placeholder: 'https://discord.com/api/webhooks/1234/abcd',
      secret: true,
    },
    {
      key: 'content',
      label: 'Message',
      placeholder: '{sender.login} starred {repository.full_name}',
      multiline: true,
    },
  ],
  telegram: [
    { key: 'botToken', label: 'Bot token', placeholder: '123456:ABC-DEF', secret: true },
    { key: 'chatId', label: 'Chat ID', placeholder: '-1001234567890' },
    {
      key: 'text',
      label: 'Message',
      placeholder: 'Payment of {amount} failed for {email}',
      multiline: true,
    },
  ],
  solana: [
    { key: 'amount', label: 'Amount (SOL)', placeholder: '{amount}' },
    { key: 'address', label: 'Recipient address', placeholder: '{address}' },
  ],
};
