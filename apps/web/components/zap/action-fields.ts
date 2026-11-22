// Config fields per action id (AvailableAction.id). Add an entry to support a new action's UI.
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
}

export const actionFields: Record<string, ActionField[]> = {
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
  solana: [
    { key: 'amount', label: 'Amount (SOL)', placeholder: '{amount}' },
    { key: 'address', label: 'Recipient address', placeholder: '{address}' },
  ],
};
