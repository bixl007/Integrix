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

/** Sends text plus an HTML version (built from the text unless given); logs instead outside production without SMTP. */
export async function sendMail(input: Mail) {
  const mail = { ...input, subject: formatSubject(input.subject) };
  if (!isMailerConfigured() && process.env.NODE_ENV !== 'production') {
    console.log(`[mailer:dev] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  await getTransport().sendMail({
    from: process.env.FROM_EMAIL,
    ...mail,
    html: mail.html ?? textToHtml(mail.text),
  });
}
