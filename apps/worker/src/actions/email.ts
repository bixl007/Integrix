import { sendMail } from '@integrix/mailer';
import { parse } from '../parser';
import type { ActionHandler } from './types';

// Zaps created before the Subject field have no `subject` metadata.
const DEFAULT_SUBJECT = 'Hello from Integrix';

export const emailAction: ActionHandler = async (metadata, payload) => {
  const to = parse(String(metadata.email ?? ''), payload).trim();
  const subject = parse(String(metadata.subject ?? ''), payload).trim() || DEFAULT_SUBJECT;
  const text = parse(String(metadata.body ?? ''), payload);
  console.log(`Sending email to ${to}`);
  // The mailer adds the HTML version: paragraphs from blank lines, payload values escaped.
  await sendMail({ to, subject, text });
};
