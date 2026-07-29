import type { D1Database } from "../../auth/d1-session-store";
import { createSessionToken, hashSessionToken } from "../../auth/session";

export const OAUTH_TRANSACTION_TTL_SECONDS = 10 * 60;
export const AUTHORIZATION_CODE_TTL_SECONDS = 5 * 60;

export interface OAuthTransaction {
  idHash: string;
  clientId: string;
  clientName: string | null;
  redirectUri: string;
  state: string | null;
  codeChallenge: string;
  resource: string;
  scope: string;
  createdAt: number;
  expiresAt: number;
}

interface TransactionRow {
  id_hash: string;
  client_id: string;
  client_name: string | null;
  redirect_uri: string;
  state: string | null;
  code_challenge: string;
  resource: string;
  scope: string;
  created_at: number;
  expires_at: number;
}

export class OAuthAuthorizationStore {
  constructor(private readonly db: D1Database) {}

  async createTransaction(input: Omit<OAuthTransaction, "idHash" | "createdAt" | "expiresAt">): Promise<string> {
    const id = createSessionToken();
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(
      `INSERT INTO oauth_transactions
       (id_hash, client_id, client_name, redirect_uri, state, code_challenge, resource, scope, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      await hashSessionToken(id), input.clientId, input.clientName, input.redirectUri, input.state,
      input.codeChallenge, input.resource, input.scope, now, now + OAUTH_TRANSACTION_TTL_SECONDS,
    ).run();
    return id;
  }

  async findTransaction(id: string): Promise<OAuthTransaction | null> {
    const now = Math.floor(Date.now() / 1000);
    const row = await this.db.prepare(
      `SELECT id_hash, client_id, client_name, redirect_uri, state, code_challenge, resource, scope, created_at, expires_at
       FROM oauth_transactions WHERE id_hash = ? AND expires_at > ?`,
    ).bind(await hashSessionToken(id), now).first<TransactionRow>();
    return row ? {
      idHash: row.id_hash, clientId: row.client_id, clientName: row.client_name,
      redirectUri: row.redirect_uri, state: row.state, codeChallenge: row.code_challenge,
      resource: row.resource, scope: row.scope, createdAt: row.created_at, expiresAt: row.expires_at,
    } : null;
  }

  async consumeTransaction(id: string): Promise<OAuthTransaction | null> {
    const transaction = await this.findTransaction(id);
    if (!transaction) return null;
    await this.db.prepare("DELETE FROM oauth_transactions WHERE id_hash = ?").bind(transaction.idHash).run();
    return transaction;
  }

  async createAuthorizationCode(transaction: OAuthTransaction, subject: string): Promise<string> {
    const code = createSessionToken();
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(
      `INSERT INTO oauth_authorization_codes
       (code_hash, client_id, redirect_uri, subject, code_challenge, resource, scope, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      await hashSessionToken(code), transaction.clientId, transaction.redirectUri, subject,
      transaction.codeChallenge, transaction.resource, transaction.scope, now,
      now + AUTHORIZATION_CODE_TTL_SECONDS,
    ).run();
    return code;
  }
}
