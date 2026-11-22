import type { JsonObject, JsonValue } from '@integrix/database';

/** Runs one action step; `metadata` holds templates, `payload` is the webhook body. */
export type ActionHandler = (metadata: JsonObject, payload: JsonValue) => Promise<void>;
