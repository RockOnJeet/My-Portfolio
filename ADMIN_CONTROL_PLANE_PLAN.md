# Admin Control Plane Plan

## Objective

Build a secure, extensible `/admin` control plane for the portfolio without changing existing public behavior. The initial implementation should establish the admin UI and reusable backend boundaries while leaving the existing Spotify visitor flow operational.

The control plane is not intended to become a general CMS. Its purpose is to manage backend integrations, MCP exposure, runtime-manageable site properties, health checks, and diagnostic logs.

## Existing application constraints

The current application is a React + TypeScript SPA built with Vite and routed with Wouter. Backend endpoints use Cloudflare Pages Functions under `functions/`, while provider logic is kept under `src/backend/`.

The useful existing convention should be preserved:

```text
HTTP / Pages Function
        ↓
thin request adapter
        ↓
backend service / provider logic
```

The existing public Spotify page must continue to display playback information belonging only to the configured portfolio-owner Spotify account. Visitors must never participate in Spotify authorization.

## Trust boundaries

Three authentication domains must remain independent:

```text
Admin Auth
    → who may use /admin and /api/admin/*

Integration Auth
    → what external services the backend may access

MCP Auth
    → which MCP clients may invoke exposed tools
```

MCP tools must consume service-layer APIs rather than implement provider authentication themselves.

For example:

```text
MCP tool
   ↓
GitHubService.readFile(...)
   ↓
GitHub App authentication
   ↓
GitHub API
```

## Admin navigation

The initial admin shell should provide:

```text
/admin
├── Dashboard
├── Integrations
├── MCP
├── Site
└── Logs
```

### Dashboard

The dashboard is primarily an operational summary. It should expose:

- integration counts and connection state
- MCP server state
- site/runtime state
- log/event summary
- integration enable/disable controls
- compact diagnostic log output

Detailed mutation and configuration belongs on the corresponding management pages.

## Integration model

The admin UI must not assume all integrations use OAuth.

Supported conceptual authentication families include:

```text
Integration
├── OAuth authentication
│   └── Spotify
├── App authentication
│   └── GitHub App
├── API-key authentication
└── future mechanisms
```

Common integration information should include only concepts that are genuinely shared, such as:

- identifier and display metadata
- enabled state
- connection/status state
- health/test operation
- capabilities
- provider management route

Provider-specific authentication and configuration remain behind the provider implementation and provider-specific admin screen.

An integration being **enabled** is distinct from it being **connected**. Disabling an integration should prevent runtime use without necessarily destroying its authorization/configuration state.

## Spotify management

Target route:

```text
/admin/integrations/spotify
```

The management screen should expose:

- enabled state
- connected/not-connected state
- OAuth authorization status
- reauthorization action
- disconnect action
- health test
- account/owner status
- mutable capabilities
- configurable backend endpoint path
- Spotify-specific logs

Initial capabilities include:

```text
playback.read
queue.read
```

Capabilities should support adding/removing entries where supported by the provider implementation. Changes that alter required OAuth scopes may require reauthorization and the UI must make that dependency explicit.

The backend endpoint used by the frontend should eventually be represented as mutable integration configuration rather than being assumed by the generic admin UI.

Immutable provider credentials are deployment-managed. If no credential can safely be viewed or modified through the control plane, the UI should show one concise configuration-boundary warning rather than repeatedly displaying secret placeholders.

The eventual Spotify authorization flow should be:

```text
/admin/integrations/spotify
        ↓
Reauthorize
        ↓
server authorization endpoint
        ↓
Spotify authorization
        ↓
server callback
        ↓
code exchange
        ↓
persist mutable authorization state
        ↓
integration status updated
```

This migration should occur after the common admin foundation is stable.

## GitHub management

Target route:

```text
/admin/integrations/github
```

GitHub authentication should use a GitHub App rather than user OAuth for repository automation.

Expected service flow:

```text
GitHub App credentials
        ↓
App authentication
        ↓
installation access token
        ↓
GitHubService
        ↓
selected repository
```

The admin screen should expose:

- enabled state
- connected/install state
- installation identity/status
- selected repository
- health test
- mutable backend capabilities
- GitHub-specific logs

Initial conceptual capabilities include:

```text
contents.read
contents.write
```

The admin capability set cannot grant privileges beyond the permissions already granted to the GitHub App installation. GitHub remains authoritative for installation permissions and repository access.

Mutable configuration may include installation ID and selected repository. The App private key and other high-value credentials remain deployment-managed secrets.

Installation access tokens are runtime credentials and should not become persistent admin-managed configuration.

## MCP management

Target route:

```text
/admin/mcp
```

The MCP management screen should expose:

- server enabled state
- online/health state
- endpoint configuration
- transport/protocol information
- MCP authentication/access policy
- active client/session summary
- tool registry
- per-tool enable/disable controls
- backing service for each tool
- MCP logs

Example tool presentation:

```text
repo.search → GitHubService
repo.read   → GitHubService
repo.write  → GitHubService
```

The tool layer must not own GitHub authentication. Tool availability should be constrained by both the tool configuration and the capabilities/status of its backing service.

MCP authentication remains independent from admin authentication.

## Site management

Target route:

```text
/admin/site
```

This page is initially a placeholder for runtime-manageable portfolio settings. It should not turn the application into a CMS.

Only properties that have a concrete runtime-management requirement should be added.

## Logs

Target route:

```text
/admin/logs
```

Logs are a first-class control-plane feature rather than a generic "recent activity" feed.

The log view should eventually support useful diagnostic information such as:

- timestamp
- severity
- subsystem/integration
- operation
- result/error
- duration where useful

Relevant events include:

- integration health tests
- OAuth/authorization events
- GitHub App/token events
- capability changes
- endpoint/configuration changes
- MCP authentication/session events
- MCP tool calls and failures
- admin control-plane operations

Logs must never contain provider secrets, bearer tokens, authorization codes, private keys, or other credentials.

## Configuration and secrets

Maintain a strict distinction between immutable/high-value credentials and mutable runtime state.

### Deployment-managed secrets

Examples:

```text
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
GITHUB_APP_ID
GITHUB_APP_PRIVATE_KEY
admin authentication secrets
MCP authentication secrets where applicable
```

These must never be returned by admin APIs.

### Mutable runtime state

Examples:

```text
Spotify refresh/authorization state
Spotify configured capabilities
integration enabled state
integration endpoint configuration
GitHub installation ID
selected GitHub repository
MCP enabled state
MCP tool configuration
runtime site properties
```

The persistence mechanism should be selected according to actual consistency and data-model requirements rather than introducing KV, D1, or Durable Objects simply because an admin panel exists.

A storage abstraction is appropriate if it provides genuine migration flexibility without hiding useful Cloudflare semantics.

## Backend boundaries

The target dependency direction is approximately:

```text
functions/api/admin/*
        ↓
admin/application services
        ↓
integration / MCP / site services
        ↓
provider clients + storage + configuration
```

Major business logic should not live directly inside Pages Function handlers.

Useful boundaries are expected around:

- HTTP/API adaptation
- admin authorization
- integration registry/status
- provider authentication
- provider services
- runtime configuration storage
- secret/configuration bindings
- logging
- MCP tools and access policy

Avoid deep inheritance and abstractions that force unrelated authentication mechanisms to implement meaningless operations. Prefer composition and small interfaces derived from actual Spotify/GitHub requirements.

## Admin authentication

Both the frontend admin routes and backend admin APIs require protection.

The intended boundary is:

```text
/admin/*
/api/admin/*
```

Cloudflare Access is the leading candidate, subject to final deployment verification and implementation testing. Backend authorization must verify the authenticated identity rather than relying solely on the fact that the frontend route was hidden/protected.

External provider callbacks, public Spotify APIs, and future MCP endpoints must be considered separately and must not accidentally inherit the wrong admin-access policy.

## Implementation phases

### Phase 1 — Admin frontend shell

- add `/admin` routing
- add reusable admin layout/sidebar
- implement Dashboard, Integrations, MCP, Site and Logs page shells
- reproduce the agreed control-plane visual language using the existing React/Tailwind/Radix stack
- use mock/static status data initially where backend contracts do not yet exist
- do not change existing public Spotify behavior

### Phase 2 — Admin API and authentication boundary

- establish `/api/admin/*`
- introduce typed Cloudflare environment/binding contracts where useful
- add admin authentication verification
- add common API response/error conventions
- verify local-development behavior

### Phase 3 — Integration foundation

- introduce the minimal reusable integration contracts justified by Spotify and GitHub
- add integration registry/status representation
- separate enabled state from connection state
- introduce runtime configuration/storage boundary
- connect admin integration cards to real status APIs

### Phase 4 — Logging and health checks

- establish structured, redacted control-plane events
- add integration health-test operations
- connect dashboard/log views to backend data

### Phase 5 — Spotify migration

- adapt the existing Spotify backend behind the common integration/service boundary
- move mutable authorization state away from manual deployment configuration where appropriate
- implement admin reauthorization/callback flow
- expose mutable capabilities and endpoint configuration
- preserve visitor behavior

### Phase 6 — GitHub App integration

- implement GitHub App authentication
- create `GitHubService`
- manage installation/repository selection
- expose health/status and capabilities through admin
- keep private key immutable and installation tokens ephemeral

### Phase 7 — MCP control plane

- implement MCP authentication independently from admin/provider auth
- register tools against service-layer capabilities
- expose tool enable/disable configuration
- add MCP health/session/tool-call diagnostics

## Initial implementation checkpoint

The first coding checkpoint should be deliberately narrow:

1. create the `/admin` frontend route and layout,
2. implement the agreed visual shell,
3. populate it with typed mock view models,
4. verify existing routes and Spotify behavior remain unchanged,
5. run build/typecheck,
6. review before introducing authentication, persistence, or provider migrations.

This keeps the first change easy to review and rollback while establishing the frontend structure against which later backend contracts can be designed.
mplement GitHub App authentication
- create `GitHubService`
- manage installation/repository selection
- expose health/status and capabilities through admin
- keep private key immutable and installation tokens ephemeral

### Phase 7 — MCP control plane

- implement MCP authentication independently from admin/provider auth
- register tools against service-layer capabilities
- expose tool enable/disable configuration
- add MCP health/session/tool-call diagnostics

## Initial implementation checkpoint

The first coding checkpoint should be deliberately narrow:

1. create the `/admin` frontend route and layout,
2. implement the agreed visual shell,
3. populate it with typed mock view models,
4. verify existing routes and Spotify behavior remain unchanged,
5. run build/typecheck,
6. review before introducing authentication, persistence, or provider migrations.

This keeps the first change easy to review and rollback while establishing the frontend stru