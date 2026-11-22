import { emailAction } from './email';
import { filterAction } from './filter';
import { solanaAction } from './solana';
import type { ActionHandler } from './types';

// Add a new integration by registering its handler here (keyed by AvailableAction.id).
export const actionHandlers: Record<string, ActionHandler> = {
  email: emailAction,
  filter: filterAction,
  solana: solanaAction,
};
