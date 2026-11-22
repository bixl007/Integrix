import { sendMail } from '@integrix/mailer';
import { parse } from '../parser';
import type { ActionHandler } from './types';

// Zaps created before the Subject field have no `subject` metadata.
const DEFAULT_SUBJECT = 'Hello from Integrix';

export const emailAction: ActionHandler = async (metadata, payload, context) => {
  const to = parse(String(metadata.email ?? ''), payload).trim();
  const subject = parse(String(metadata.subject ?? ''), payload).trim() || DEFAULT_SUBJECT;
  const text = parse(String(metadata.body ?? ''), payload);
  console.log(`Sending email to ${to}`);
  // The mailer adds the HTML version: paragraphs from blank lines, payload values escaped.
  // With a connection the mail leaves from the user's own Gmail; otherwise from the server account.
  const account = context?.connection && {
    user: context.connection.user ?? '',
    appPassword: context.connection.appPassword ?? '',
  };
  await sendMail({ to, subject, text }, account);
  return { output: { to, subject } };
};
