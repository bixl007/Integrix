import nodemailer from 'nodemailer';
import { formatSubject, textToHtml } from './format';

export { formatSubject, textToHtml };

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const SMTP_TIMEOUT_MS = 10_000;

let transport: nodemailer.Transporter | undefined;

export const isMailerConfigured = () => {
  const { SMTP_ENDPOINT, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL } = process.env;
  return !!(SMTP_ENDPOINT && SMTP_PORT && SMTP_USERNAME && SMTP_PASSWORD && FROM_EMAIL);
};

// Created on first use so services without SMTP config still boot.
function getTransport() {
  if (transport) return transport;
  if (!isMailerConfigured()) throw new Error('SMTP env vars are not set');
  const { SMTP_ENDPOINT, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD } = process.env;
  transport = nodemailer.createTransport({
    host: SMTP_ENDPOINT,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
    // Nodemailer's defaults wait minutes; a stuck SMTP server must not hold up the worker's queue.
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
  return transport;
}

/** A user's own Gmail login: their address and an app password. */
export interface GmailAccount {
  user: string;
  appPassword: string;
}

/** Transport settings for a Gmail account. Google shows app passwords in groups of four, so spaces are dropped. */
export const gmailTransport = ({ user, appPassword }: GmailAccount) => ({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: user.trim(), pass: appPassword.replace(/\s+/g, '') },
  connectionTimeout: SMTP_TIMEOUT_MS,
  greetingTimeout: SMTP_TIMEOUT_MS,
  socketTimeout: SMTP_TIMEOUT_MS,
});

/**
 * Sends text plus an HTML version (built from the text unless given).
 * With `account` it goes out from that Gmail account; otherwise from the server's SMTP account,
 * or to the log outside production when that isn't configured.
 */
export async function sendMail(input: Mail, account?: GmailAccount) {
  const mail = { ...input, subject: formatSubject(input.subject) };
  const html = mail.html ?? textToHtml(mail.text);
  if (account) {
    // One short-lived connection per message: user accounts are too many and too idle to pool.
    const own = nodemailer.createTransport(gmailTransport(account));
    try {
      await own.sendMail({ from: account.user.trim(), ...mail, html });
    } finally {
      own.close();
    }
    return;
  }
  if (!isMailerConfigured() && process.env.NODE_ENV !== 'production') {
    console.log(`[mailer:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  await getTransport().sendMail({ from: process.env.FROM_EMAIL, ...mail, html });
}
