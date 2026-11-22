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
    {
      key: 'body',
      label: 'Body',
      placeholder: 'Hi {name}, your amount is {amount}',
      multiline: true,
    },
  ],
  solana: [
    { key: 'amount', label: 'Amount (SOL)', placeholder: '{amount}' },
    { key: 'address', label: 'Recipient address', placeholder: '{address}' },
  ],
};
