import type { JsonObject, JsonValue } from '@integrix/database';
import { postJson } from '../http';
import { parse } from '../parser';
import type { ActionHandler } from './types';

// Telegram rejects longer messages outright, so they are cut instead of failing the run.
const MAX_TEXT_LENGTH = 4096;

/** The Bot API sendMessage call for a step's settings. */
export const telegramRequest = (metadata: JsonObject, payload: JsonValue) => ({
  url: `https://api.telegram.org/bot${String(metadata.botToken ?? '').trim()}/sendMessage`,
  body: {
    chat_id: parse(String(metadata.chatId ?? ''), payload).trim(),
    text: parse(String(metadata.text ?? ''), payload).slice(0, MAX_TEXT_LENGTH),
  },
});

/** The id Telegram gave the sent message, or null when the response has none. */
export function sentMessageId(responseBody: string): number | null {
  try {
    const id = (JSON.parse(responseBody) as { result?: { message_id?: unknown } }).result
      ?.message_id;
    return typeof id === 'number' ? id : null;
  } catch {
    return null;
  }
}

/** Sends a message from a Telegram bot to a chat. */
export const telegramAction: ActionHandler = async (metadata, payload) => {
  const { url, body } = telegramRequest(metadata, payload);
  const response = await postJson(url, body);
  return { output: { chatId: body.chat_id, messageId: sentMessageId(response.body) } };
};
