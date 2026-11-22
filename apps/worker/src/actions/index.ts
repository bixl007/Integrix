import { delayAction } from './delay';
import { discordAction } from './discord';
import { emailAction } from './email';
import { filterAction } from './filter';
import { httpAction } from './http';
import { slackAction } from './slack';
import { solanaAction } from './solana';
import { telegramAction } from './telegram';
import type { ActionHandler } from './types';

// Add a new integration by registering its handler here (keyed by AvailableAction.id).
export const actionHandlers: Record<string, ActionHandler> = {
  delay: delayAction,
  discord: discordAction,
  email: emailAction,
  filter: filterAction,
  http: httpAction,
  slack: slackAction,
  solana: solanaAction,
  telegram: telegramAction,
};
