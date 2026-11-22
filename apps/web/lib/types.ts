// Response shapes from the API service (apps/api).

export interface Integration {
  id: string;
  name: string;
  image: string;
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
  userId: number;
  createdAt: string;
  actions: ZapAction[];
  trigger: { id: string; type: Integration } | null;
}

export interface User {
  name: string;
  email: string;
}
