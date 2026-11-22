// Response shapes from the API service (apps/api).

export interface Integration {
  id: string;
  name: string;
  image: string;
  /** Actions only: settings the API masks in responses. */
  secretFields?: string[];
  /** Actions only: the credential keys a connection for it holds. */
  connectionFields?: string[];
}

export interface ZapAction {
  id: string;
  sortingOrder: number;
  metadata?: Record<string, string> | null;
  type: Integration;
}

export interface Zap {
  id: string;
  name: string | null;
  enabled: boolean;
  userId: number;
  createdAt: string;
  actions: ZapAction[];
  /** When a scheduled zap fires next; null without a schedule. */
  nextRunAt: string | null;
  trigger: { id: string; type: Integration; metadata?: Record<string, string> | null } | null;
}

export interface User {
  name: string;
  email: string;
}

export interface ZapRunStep {
  stage: number;
  /** Connector id (`AvailableAction.id`) that ran. */
  actionId: string;
  status: string;
  error: string | null;
  output: Record<string, unknown> | null;
  startedAt: string;
  finishedAt: string;
}

export interface ZapRun {
  id: string;
  status: string;
  createdAt: string;
  finishedAt: string | null;
  steps: ZapRunStep[];
}

/** A saved credential; the credential itself never leaves the server. */
export interface Connection {
  id: string;
  /** The connector (`AvailableAction.id`) it is for. */
  connectorId: string;
  name: string;
  createdAt: string;
}
