// Config fields per action id (AvailableAction.id). Add an entry to support a new action's UI.
export interface ActionField {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
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
  solana: [
    { key: 'amount', label: 'Amount (SOL)', placeholder: '{amount}' },
    { key: 'address', label: 'Recipient address', placeholder: '{address}' },
  ],
};
