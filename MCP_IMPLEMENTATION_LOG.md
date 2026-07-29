# MCP Implementation Log

This file tracks implementation work and architectural decisions for the MCP server only. Keep it current after each MCP implementation batch.

## Baseline

- Working branch: `test/mcp`.
- Local implementation intentionally starts from commit `b15e167` rather than the discarded upstream `test/mcp` implementation.
- Existing application architecture uses Cloudflare Pages Functions under `functions/` with backend logic under `src/backend/`.
- MCP implementation lives under `src/backend/mcp/`, with the HTTP request boundary under `functions/mcp.ts`.
- The Pages project is dashboard-configured rather than Wrangler-configured. Cloudflare Pages `Secrets and Variables` and D1 bindings are available to Functions.

## Current Architecture

```text
GitHub OAuth App
       |
       | upstream identity proof only
       v
Application auth layer
       |
       +---- D1-backed browser session -> future /admin
       |
       `---- future MCP Authorization Server
                     |
                     v
Cloudflare Pages /mcp Resource Server
       |
       v
loadMcpConfig() -> authMode dispatch
       |
       v
MCP handler -> server factory -> capability registry
```

MCP behavioral configuration remains file-backed for now. Runtime-managed behavioral configuration will be introduced later with Wrangler/Cloudflare infrastructure. Migration seams must be marked with `TODO(wrangler)`.

Deployment-specific secrets/variables and auth persistence are separate from MCP behavioral configuration and may use existing Cloudflare Pages bindings immediately.

## Completed Work

### Phase 1 - Data model and configuration surface

- Added `McpServerConfig` with server identity, auth mode, supported scopes, and enabled capabilities.
- Added file-backed defaults and `loadMcpConfig()` provider seam.
- Added canonical capability registry.

### Phase 2 - MCP v2 foundation

- Removed MCP SDK v1 and migrated to `@modelcontextprotocol/server@2.0.0` with Zod 4.
- Added configuration-aware capability contracts, registry orchestration, and fresh MCP server construction.
- Added deterministic read-only `server_info` capability.

### Phase 3A - Cloudflare HTTP boundary

- Added `functions/mcp.ts` using MCP v2 `createMcpHandler()` and Web-standard `fetch()`.
- Test deployment validated Streamable HTTP initialization, server identity, `tools/list`, `server_info`, and route ownership.

### Phase 3B - Explicit auth-mode boundary

- Current file-backed default is `authMode: "none"`, matching deployed behavior.
- `none` forwards to MCP; `oauth` fails closed with HTTP 503 until implemented.
- Configuration is loaded once per request and passed into server construction.

### Superseded Phase 3C1 - Cloudflare Access exploration

- Cloudflare Access was evaluated and rejected as the shared authorization control plane.
- Application code retains ownership of authorization and MCP OAuth.
- Temporary Access-specific modules/dependency were removed before integration/deployment.

### Phase 3C2 - GitHub upstream identity foundation

- Chose a GitHub OAuth App intentionally: only upstream human identity is needed, not GitHub installation/repository semantics.
- Added provider-neutral `ApplicationIdentity` keyed by immutable numeric GitHub subject.
- Added GitHub OAuth login/callback with HMAC-bound state cookie and owner-ID authorization.
- GitHub API request uses the required application `User-Agent`; no additional GitHub OAuth scope is requested.
- GitHub access tokens remain backend-only and are discarded after identity lookup.
- Deployment validation passed end-to-end for GitHub login, callback, identity lookup, and owner authorization.

### Phase 3C3 - Application session foundation

- Chose Cloudflare D1 rather than KV for auth persistence because sessions and future OAuth grants/transactions are relational state.
- Added canonical migration `migrations/auth/0001_sessions.sql` and applied it to the D1 database bound as `AUTH_DB`.
- Added opaque 256-bit application session tokens; only SHA-256 token hashes are stored in D1.
- Added a 7-day HttpOnly/Secure/SameSite=Lax application session cookie.
- GitHub callback now creates a D1-backed application session after successful owner authentication.
- Added temporary `/oauth/session` diagnostic endpoint, marked `TODO(auth-cleanup)`, and POST `/oauth/logout` for server-side revocation.
- Deployment validation passed: session creation, identity recovery, logout/revocation, and post-logout unauthenticated state all behaved correctly.

### Phase 3C4 - OAuth discovery metadata

- Added `src/backend/mcp/auth/metadata.ts` as the canonical MCP OAuth endpoint/metadata builder.
- Uses MCP v2 SDK `oauthMetadataResponse()` and `getOAuthProtectedResourceMetadataUrl()` rather than hand-rolling RFC 9728 protected-resource metadata.
- Added `/.well-known/oauth-protected-resource/mcp` for the `/mcp` Resource Server.
- Added `/.well-known/oauth-authorization-server` for the application-owned Authorization Server.
- Metadata derives MCP resource name and supported scopes from loaded MCP configuration.
- Authorization Server metadata advertises the implemented Authorization Code flow, PKCE S256, public-client token authentication (`none`), configured MCP scopes, and CIMD support.
- Client Identifier Metadata Document (CIMD) support is advertised and implemented for public MCP OAuth clients; no Dynamic Client Registration endpoint is advertised.
- `/mcp` now runs in `authMode: "oauth"`; bearer-token validation is enforced before MCP dispatch.

### Phase 3C5 - Authorization Code + PKCE and scoped MCP access

- Added application-owned Authorization Code + PKCE S256 flow backed by D1 authorization transactions, one-time authorization codes, and opaque access tokens.
- Added client metadata resolution and redirect-URI validation for MCP OAuth clients.
- Added bearer-token enforcement at `/mcp`, including token expiry/resource validation and SDK `AuthInfo` propagation.
- OAuth authorization requests reject scopes outside `McpServerConfig.supportedScopes`; issued access tokens retain the normalized granted scope set.
- MCP server construction now receives the authenticated request's granted scopes. Enabled capabilities are registered only when every `requiredScopes` entry is granted.
- Capability registration fails closed when a capability declares a scope absent from `supportedScopes`, preventing configuration drift from silently creating an invalid authorization contract.
- Capabilities with no required scopes remain available to any successfully authenticated MCP client. `server_info` is currently the only capability and intentionally remains scope-free.
- Temporary OAuth/CIMD/bearer diagnostic logging and diagnostic response detail used during interoperability debugging were removed after validation.


### Phase 3C6 - Client authorization lifecycle and manual revocation

- Added persistent D1 `oauth_client_grants` records keyed by immutable OAuth `client_id` + owner subject + MCP resource. Human-readable client metadata is retained only as display information.
- Authorization consent creates or reactivates the client's grant and authorization codes/access tokens carry the grant identity.
- Existing access tokens are backfilled into grants by the `0004_oauth_client_grants.sql` migration; pre-migration short-lived authorization codes are intentionally invalidated because they cannot be safely associated with a grant.
- Bearer-token validation now joins the token to its grant and fails closed for revoked grants.
- Added owner-session-protected `GET /oauth/grants` to enumerate client authorizations and `POST /oauth/grants` to revoke one grant by `grant_id`.
- Grant revocation marks the authorization revoked and deletes all outstanding authorization codes and access tokens for that grant. A later explicit consent can reactivate the client without reviving previously revoked credentials.
## Architectural Decisions

### MCP SDK and OAuth responsibility

Use MCP TypeScript SDK v2 through `@modelcontextprotocol/server`. MCP v2 is the Resource Server implementation. Do not restore frozen v1-style Authorization Server helpers for new OAuth code.

The application owns authentication state, authorization policy, MCP OAuth behavior, sessions/tokens, scopes, and capability authorization.

### GitHub OAuth App as upstream IdP

GitHub proves human identity only. The application authorizes the returned immutable numeric GitHub user ID against `GITHUB_OWNER_ID`.

The GitHub access token is backend-only and never becomes an MCP bearer token. GitHub scopes and MCP scopes are separate namespaces.

### Shared admin + MCP authentication

The future admin portal and MCP authorization UI share the application identity/session foundation:

```text
GitHub login
    |
    v
D1-backed application session
    |
    +---- /admin authorization
    |
    `---- MCP authorization/consent
             |
             v
       application-issued MCP token
```

### OAuth discovery ownership

The MCP Resource Server advertises this application's Authorization Server, not GitHub. GitHub remains an implementation detail behind the application's human authentication boundary.

Canonical public endpoints currently are:

```text
/mcp
/.well-known/oauth-protected-resource/mcp
/.well-known/oauth-authorization-server
/oauth/authorize
/oauth/token
/oauth/grants          (owner-session-protected client grant listing/revocation)
```

The SDK's metadata helper derives the protected-resource well-known path from the `/mcp` resource URL. The Authorization Server issuer is the request origin.

### Protocol revision

Do not mix MCP 2026-07-28 wire-protocol opt-in work into OAuth discovery. The installed v2 SDK can serve current/legacy MCP traffic through `createMcpHandler`; protocol-era migration is a separate concern from OAuth metadata.

### OAuth transaction state

The GitHub identity bootstrap uses a short-lived signed browser cookie for upstream OAuth state. Durable application sessions use D1. Future MCP authorization transactions/grants may extend D1 independently of MCP behavioral configuration.

### Deployment configuration

Required Pages variables/secrets:

```text
GITHUB_CLIENT_ID=<GitHub OAuth App client ID>
GITHUB_CLIENT_SECRET=<secret>
GITHUB_OWNER_ID=<immutable numeric GitHub user ID>
AUTH_COOKIE_SECRET=<high-entropy secret>
```

Required D1 binding:

```text
AUTH_DB
```

The GitHub OAuth App test callback is:

```text
https://test-mcp.rockonjeet.pages.dev/oauth/github/callback
```

### Configuration storage

MCP behavioral settings remain file-backed until the planned runtime-config/admin migration. D1 is currently auth/session persistence only; do not conflate it with future runtime-managed MCP behavioral configuration.

## Verification History

Each implemented code batch is followed by workspace diagnostics and repository typecheck/build validation.

Current verification commands:

```text
npm run typecheck -- --pretty false
npm run build
```

Phase 3C2 and 3C3 have additionally passed their respective test-deployment checkpoints.

Phase 3C4/3C5 deployment interoperability has been validated with ChatGPT/MCPJam: OAuth discovery, CIMD client identification, owner consent, Authorization Code + PKCE exchange, bearer authentication, MCP initialization, and `tools/list`/`server_info` all succeeded.

## Deferred Work

- Deploy/apply `migrations/auth/0004_oauth_client_grants.sql` and validate Phase 3C6 grant grouping/revocation against real MCP clients.
- Add additional capabilities and exercise positive/negative scope filtering with at least one scoped capability.
- Remove temporary `/oauth/session` once `/admin` consumes application sessions.
- Port file-backed MCP behavioral configuration to runtime-managed storage through Wrangler when requested.
- Add the future admin-console configuration surface, consuming the grant listing/revocation API for client access management.

## Next Step

Audit the complete Phase 3C5/3C6 working-tree diff, apply `migrations/auth/0004_oauth_client_grants.sql` to `AUTH_DB`, then commit/deploy. Validate that existing deployed client access survives migration, new authorization is grouped under one client grant, revoking that grant immediately makes all of its bearer tokens fail with 401, and a fresh explicit authorization succeeds without reviving old credentials.