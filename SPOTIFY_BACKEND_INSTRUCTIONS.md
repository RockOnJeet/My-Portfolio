# Spotify Backend Instructions

This document describes the current Spotify backend implementation, the intended architecture, and the fixes needed to complete the Cloudflare deployment safely.

## Current implementation state

- A dedicated backend helper exists in `src/backend/spotify/`.
- It currently supports:
  - refreshing Spotify access tokens via `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
  - retrying Spotify requests on `429`, `502`, `503`, and `504`
  - fetching `/v1/me/player` and `/v1/me/player/queue`
- A Cloudflare Pages endpoint exists at `functions/api/spotify/console.ts` and is currently a request-triggered snapshot endpoint.
- The current design does not include any auth flow or admin UI.

## Current behavior

- Spotify API calls happen only when `/api/spotify/console` is requested.
- There is no internal polling loop, cache, or durable state.
- Each request does a fresh token decryption, refresh, and API fetch.
- This is fine for a simple snapshot endpoint, but it is not optimized for change detection or low-bandwidth push delivery.

## Test deploy mode

For the Cloudflare test deploy, the Spotify page is configured to fetch the backend from:

- `https://rockonjeet.pages.dev/api/spotify/console/`
- `https://rockonjeet.pages.dev/api/spotify/subscribe/`

That keeps the page pointed at the deployed Pages backend instead of the local dev server.

## `/api/spotify/console` endpoint format

The endpoint is a simple GET snapshot API. It returns JSON in one of two shapes:

Success:

```json
{
  "success": true,
  "payload": {
    "playbackData": { /* Spotify /me/player response or error info */ },
    "queueData": { /* Spotify /me/player/queue response or error info */ }
  }
}
```

Failure:

```json
{
  "success": false,
  "error": "Some descriptive error message"
}
```

If one of the Spotify requests fails, the endpoint still returns `success: true` and embeds the failure in the matching payload field, for example:

```json
{
  "success": true,
  "payload": {
    "playbackData": { "error": "Player request failed with 403" },
    "queueData": { /* potentially valid queue payload */ }
  }
}
```

The endpoint must never return secret values such as `SPOTIFY_REFRESH_TOKEN` or OAuth credentials.

## Environment variables required

The backend uses only these env vars:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REFRESH_TOKEN`

These values must remain private in Cloudflare.

## Intended Cloudflare architecture

The preferable Cloudflare-compatible architecture for this service is:

1. Keep `GET /api/spotify/console` as a snapshot endpoint.
2. Add a push-style subscription endpoint, e.g. `GET /api/spotify/subscribe`.
3. Use a Durable Object as the central state coordinator.
4. The Durable Object should:
   - hold the latest cached Spotify playback/queue state
   - run a polling loop against Spotify at a controlled interval
   - compare new state to the last state and detect changes
   - broadcast state-changed messages to connected clients via SSE
5. Clients subscribe once and receive only changed frames, instead of polling repeatedly.

## Why this architecture is better

- bandwidth is reduced because clients do not each poll Spotify
- Spotify token usage is reduced because polling is centralized
- multiple concurrent users can share one poll result
- the server can push state only when it changes
- for 5–10 moderate concurrent users, it is likely to remain within Cloudflare free-tier limits

## Can it be kept free-tier?

Yes, for moderate use, this can be kept within free tier if:

- polling is limited to a sensible interval (for example, 2–5 seconds)
- state diffing is lightweight
- the Durable Object does not perform expensive work per request
- total request volume stays below 100,000/day

A single Durable Object is enough for the core flow; a separate DB is not required.

## Recommended fix list

1. Preserve the existing `functions/api/spotify/console.ts` snapshot endpoint.
2. Add a Cloudflare Worker or Durable Object with SSE subscription support.
3. Implement a central polling loop in the Durable Object.
4. Detect changes on the server using key fields such as:
   - `item.id`
   - `progress_ms`
   - `is_playing`
   - `timestamp`
   - `device.id`
5. Push only meaningful update frames to connected clients.
6. Keep payloads minimal and read-only; never include secrets or tokens.
7. Avoid using a database for the main flow; the Durable Object can store the current state.

## Notes for implementation

- The service is not real-time from Spotify; it is server-side polling plus client push.
- The endpoint should remain safe by never returning secret material.
- The current helper code is the right basis for token refresh and Spotify fetch logic.
- The next fix is to add central state coordination and push delivery in Cloudflare.
