import { expect, test } from 'bun:test';
import { failureMail } from './notify';

const run = { to: 'a@b.co', zapId: 'z1', stage: 1, actionName: 'Solana', attempts: 4 };

test('names the zap, the UI step number and links to its history', () => {
  const mail = failureMail({ ...run, zapName: 'Payouts', error: 'Invalid public key input' });
  expect(mail.to).toBe('a@b.co');
  expect(mail.subject).toBe('Your zap "Payouts" failed at step 3 (Solana)');
  expect(mail.text).toContain('your zap "Payouts" stopped at step 3 (Solana) after 4 attempts');
  expect(mail.text).toContain('Error: Invalid public key input');
  expect(mail.text).toContain('/zap/z1?tab=history');
});

test('falls back when the zap has no name or error text', () => {
  const mail = failureMail({ ...run, zapName: null });
  expect(mail.subject).toBe('Your zap failed at step 3 (Solana)');
  expect(mail.text).toContain('Error: Unknown error');
});
