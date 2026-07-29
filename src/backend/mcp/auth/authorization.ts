import type { D1Database } from "../../auth/d1-session-store";
import { createSessionToken, hashSessionToken } from "../../auth/session";

export const OAUTH_TRANSACTION_TTL_SECONDS = 10 * 60;
export const AUTHORIZATION_CODE_TTL_SECONDS = 5 * 60;
export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

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

export interface OAuthClientGrant {
  grantId: string;
  clientId: string;
  clientName: string | null;
  subject: string;
  resource: string;
  createdAt: number;
  updatedAt: number;
  revokedAt: number | null;
}

export interface OAuthAuthorizationCode {
  codeHash: string;
  grantId: string;
  clientId: string;
  redirectUri: string;
  subject: string;
  codeChallenge: string;
  resource: string;
  scope: string;
  createdAt: number;
  expiresAt: number;
}

export interface OAuthAccessToken {
  tokenHash: string;
  grantId: string;
  clientId: string;
  subject: string;
  resource: string;
  scope: string;
  createdAt: number;
  expiresAt: number;
}

interface TransactionRow {
  id_hash: string; client_id: string; client_name: string | null; redirect_uri: string;
  state: string | null; code_challenge: string; resource: string; scope: string;
  created_at: number; expires_at: number;
}
interface GrantRow {
  grant_id: string; client_id: string; client_name: string | null; subject: string; resource: string;
  created_at: number; updated_at: number; revoked_at: number | null;
}
interface AuthorizationCodeRow {
  code_hash: string; grant_id: string; client_id: string; redirect_uri: string; subject: string;
  code_challenge: string; resource: string; scope: string; created_at: number; expires_at: number;
}
interface AccessTokenRow {
  token_hash: string; grant_id: string; client_id: string; subject: string; resource: string; scope: string;
  created_at: number; expires_at: number;
}

function mapGrant(row: GrantRow): OAuthClientGrant {
  return { grantId: row.grant_id, clientId: row.client_id, clientName: row.client_name, subject: row.subject,
    resource: row.resource, createdAt: row.created_at, updatedAt: row.updated_at, revokedAt: row.revoked_at };
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
    ).bind(await hashSessionToken(id), input.clientId, input.clientName, input.redirectUri, input.state,
      input.codeChallenge, input.resource, input.scope, now, now + OAUTH_TRANSACTION_TTL_SECONDS).run();
    return id;
  }

  async findTransaction(id: string): Promise<OAuthTransaction | null> {
    const now = Math.floor(Date.now() / 1000);
    const row = await this.db.prepare(
      `SELECT id_hash, client_id, client_name, redirect_uri, state, code_challenge, resource, scope, created_at, expires_at
       FROM oauth_transactions WHERE id_hash = ? AND expires_at > ?`,
    ).bind(await hashSessionToken(id), now).first<TransactionRow>();
    return row ? { idHash: row.id_hash, clientId: row.client_id, clientName: row.client_name,
      redirectUri: row.redirect_uri, state: row.state, codeChallenge: row.code_challenge,
      resource: row.resource, scope: row.scope, createdAt: row.created_at, expiresAt: row.expires_at } : null;
  }

  async consumeTransaction(id: string): Promise<OAuthTransaction | null> {
    const transaction = await this.findTransaction(id);
    if (!transaction) return null;
    await this.db.prepare("DELETE FROM oauth_transactions WHERE id_hash = ?").bind(transaction.idHash).run();
    return transaction;
  }

  async authorizeClient(transaction: OAuthTransaction, subject: string): Promise<OAuthClientGrant> {
    const now = Math.floor(Date.now() / 1000);
    const grantId = createSessionToken();
    await this.db.prepare(
      `INSERT INTO oauth_client_grants
       (grant_id, client_id, client_name, subject, resource, created_at, updated_at, revoked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
       ON CONFLICT(client_id, subject, resource) DO UPDATE SET
         client_name = excluded.client_name,
         updated_at = excluded.updated_at,
         revoked_at = NULL`,
    ).bind(grantId, transaction.clientId, transaction.clientName, subject, transaction.resource, now, now).run();
    const row = await this.db.prepare(
      `SELECT grant_id, client_id, client_name, subject, resource, created_at, updated_at, revoked_at
       FROM oauth_client_grants WHERE client_id = ? AND subject = ? AND resource = ?`,
    ).bind(transaction.clientId, subject, transaction.resource).first<GrantRow>();
    if (!row) throw new Error("Failed to persist OAuth client grant.");
    return mapGrant(row);
  }

  async createAuthorizationCode(transaction: OAuthTransaction, subject: string, grantId: string): Promise<string> {
    const code = createSessionToken();
    const now = Math.floor(Date.now() / 1000);
    await this.db.prepare(
      `INSERT INTO oauth_authorization_codes
       (code_hash, grant_id, client_id, redirect_uri, subject, code_challenge, resource, scope, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(await hashSessionToken(code), grantId, transaction.clientId, transaction.redirectUri, subject,
      transaction.codeChallenge, transaction.resource, transaction.scope, now, now + AUTHORIZATION_CODE_TTL_SECONDS).run();
    return code;
  }

  async consumeAuthorizationCode(code: string): Promise<OAuthAuthorizationCode | null> {
    const now = Math.floor(Date.now() / 1000);
    const row = await this.db.prepare(
      `DELETE FROM oauth_authorization_codes WHERE code_hash = ? AND expires_at > ?
       RETURNING code_hash, grant_id, client_id, redirect_uri, subject, code_challenge, resource, scope, created_at, expires_at`,
    ).bind(await hashSessionToken(code), now).first<AuthorizationCodeRow>();
    return row ? { codeHash: row.code_hash, grantId: row.grant_id, clientId: row.client_id, redirectUri: row.redirect_uri,
      subject: row.subject, codeChallenge: row.code_challenge, resource: row.resource, scope: row.scope,
      createdAt: row.created_at, expiresAt: row.expires_at } : null;
  }

  async isClientGrantActive(grantId: string, subject: string): Promise<boolean> {
    const row = await this.db.prepare(
      "SELECT grant_id FROM oauth_client_grants WHERE grant_id = ? AND subject = ? AND revoked_at IS NULL",
    ).bind(grantId, subject).first<{ grant_id: string }>();
    return row !== null;
  }

  async createAccessToken(grant: OAuthAuthorizationCode): Promise<{ token: string; access: OAuthAccessToken }> {
    const token = createSessionToken();
    const now = Math.floor(Date.now() / 1000);
    const access: OAuthAccessToken = { tokenHash: await hashSessionToken(token), grantId: grant.grantId,
      clientId: grant.clientId, subject: grant.subject, resource: grant.resource, scope: grant.scope, createdAt: now,
      expiresAt: now + ACCESS_TOKEN_TTL_SECONDS };
    await this.db.prepare(
      `INSERT INTO oauth_access_tokens (token_hash, grant_id, client_id, subject, resource, scope, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(access.tokenHash, access.grantId, access.clientId, access.subject, access.resource, access.scope,
      access.createdAt, access.expiresAt).run();
    return { token, access };
  }

  async findAccessToken(token: string): Promise<OAuthAccessToken | null> {
    const now = Math.floor(Date.now() / 1000);
    const row = await this.db.prepare(
      `SELECT tokens.token_hash, tokens.grant_id, tokens.client_id, tokens.subject, tokens.resource,
              tokens.scope, tokens.created_at, tokens.expires_at
       FROM oauth_access_tokens AS tokens
       JOIN oauth_client_grants AS grants ON grants.grant_id = tokens.grant_id
       WHERE tokens.token_hash = ? AND tokens.expires_at > ? AND grants.revoked_at IS NULL`,
    ).bind(await hashSessionToken(token), now).first<AccessTokenRow>();
    return row ? { tokenHash: row.token_hash, grantId: row.grant_id, clientId: row.client_id, subject: row.subject,
      resource: row.resource, scope: row.scope, createdAt: row.created_at, expiresAt: row.expires_at } : null;
  }

  async listClientGrants(subject: string): Promise<OAuthClientGrant[]> {
    const result = await this.db.prepare(
      `SELECT grant_id, client_id, client_name, subject, resource, created_at, updated_at, revoked_at
       FROM oauth_client_grants WHERE subject = ? ORDER BY updated_at DESC`,
    ).bind(subject).all<GrantRow>();
    return result.results.map(mapGrant);
  }

  async revokeClientGrant(subject: string, grantId: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const row = await this.db.prepare(
      `UPDATE oauth_client_grants SET revoked_at = ?, updated_at = ?
       WHERE grant_id = ? AND subject = ? AND revoked_at IS NULL
       RETURNING grant_id`,
    ).bind(now, now, grantId, subject).first<{ grant_id: string }>();
    if (!row) return false;
    await this.db.prepare("DELETE FROM oauth_authorization_codes WHERE grant_id = ?").bind(grantId).run();
    await this.db.prepare("DELETE FROM oauth_access_tokens WHERE grant_id = ?").bind(grantId).run();
    return true;
  }
}