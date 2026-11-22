import type { JsonObject, JsonValue } from '@integrix/database';
import { postJson } from '../http';
import { parse } from '../parser';
import type { ActionHandler } from './types';

// Discord rejects longer messages outright, so they are cut instead of failing the run.
const MAX_CONTENT_LENGTH = 2000;

/** The webhook call for a step's settings. */
export const discordRequest = (metadata: JsonObject, payload: JsonValue) => ({
  url: String(metadata.webhookUrl ?? '').trim(),
  body: { content: parse(String(metadata.content ?? ''), payload).slice(0, MAX_CONTENT_LENGTH) },
});

/** Posts a message to a Discord channel webhook. */
export const discordAction: ActionHandler = async (metadata, payload) => {
  const { url, body } = discordRequest(metadata, payload);
  await postJson(url, body);
  return { output: { sent: true } };
};
