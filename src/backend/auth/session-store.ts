import type { ApplicationIdentity } from "./identity";

export interface StoredSession {
  tokenHash: string;
  identity: ApplicationIdentity;
  createdAt: number;
  expiresAt: number;
}

export interface SessionStore {
  create(session: StoredSession): Promise<void>;
  findValid(tokenHash: string, now: number): Promise<StoredSession | null>;
  delete(tokenHash: string): Promise<void>;
}
