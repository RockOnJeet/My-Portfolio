import type { ApplicationIdentity } from "./identity";
import type { SessionStore, StoredSession } from "./session-store";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface SessionRow {
  token_hash: string;
  provider: string;
  subject: string;
  login: string;
  created_at: number;
  expires_at: number;
}

export interface AuthDatabaseEnv {
  AUTH_DB: D1Database;
}

export class D1SessionStore implements SessionStore {
  constructor(private readonly db: D1Database) {}

  async create(session: StoredSession): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO auth_sessions (token_hash, provider, subject, login, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        session.tokenHash,
        session.identity.provider,
        session.identity.subject,
        session.identity.login,
        session.createdAt,
        session.expiresAt,
      )
      .run();
  }

  async findValid(tokenHash: string, now: number): Promise<StoredSession | null> {
    const row = await this.db
      .prepare(
        `SELECT token_hash, provider, subject, login, created_at, expires_at
         FROM auth_sessions
         WHERE token_hash = ? AND expires_at > ?`,
      )
      .bind(tokenHash, now)
      .first<SessionRow>();

    if (!row || row.provider !== "github") return null;

    const identity: ApplicationIdentity = {
      provider: "github",
      subject: row.subject,
      login: row.login,
    };

    return {
      tokenHash: row.token_hash,
      identity,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
    };
  }

  async delete(tokenHash: string): Promise<void> {
    await this.db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").bind(tokenHash).run();
  }
}
