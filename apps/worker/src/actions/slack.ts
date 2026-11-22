import type { JsonObject, JsonValue } from '@integrix/database';
import { postJson } from '../http';
import { parse } from '../parser';
import type { ActionHandler } from './types';

/** The webhook call for a step's settings. */
export const slackRequest = (metadata: JsonObject, payload: JsonValue) => ({
  url: String(metadata.webhookUrl ?? '').trim(),
  body: { text: parse(String(metadata.text ?? ''), payload) },
});

/** Posts a message to a Slack incoming webhook. */
export const slackAction: ActionHandler = async (metadata, payload) => {
  const { url, body } = slackRequest(metadata, payload);
  await postJson(url, body);
  return { output: { sent: true } };
};
