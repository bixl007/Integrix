import { sendMail } from '@integrix/mailer';
import { parse } from '../parser';
import type { ActionHandler } from './types';

export const emailAction: ActionHandler = async (metadata, payload) => {
  const to = parse(String(metadata.email ?? ''), payload);
  const text = parse(String(metadata.body ?? ''), payload);
  console.log(`Sending email to ${to}`);
  await sendMail({ to, subject: 'Hello from Integrix', text });
};
