# Performance Notes for Contributors / AI Agents

Please preserve the current architecture unless there is a measurable improvement.

## Current design

- `/api/spotify/console` returns Spotify playback + queue metadata.
- Hero artwork is fetched separately through `/api/spotify/artwork`.
- Artwork requests are deduplicated and cached client-side.
- Queue UI is **hidden by default** and only shown after user interaction.

## Optimization priorities

### 1. Prioritize hero artwork (highest priority)

The currently playing artwork is the page's LCP element.

- Load it eagerly.
- Give it highest network priority (`fetchpriority="high"` where applicable).
- Do not let hidden queue artwork compete with it.

### 2. Queue artwork is non-critical

Do **not** eagerly fetch artwork for hidden queue items.

Prefer one of:

- fetch when queue is opened
- fetch on idle (`requestIdleCallback`)
- fetch progressively as items become visible

Initial page load should optimize for the hero artwork only.

### 3. Preserve request deduplication

The existing in-flight request tracking and artwork cache prevent duplicate downloads. Maintain this behavior when refactoring.

### 4. Backend

`/api/spotify/console` already performs Spotify player and queue requests in parallel.

Before optimizing backend logic, profile first.

The only backend optimization currently identified is caching Spotify access tokens until expiry instead of refreshing every request.

### 5. Potential future improvement

The current artwork endpoint returns Base64-encoded JSON.

If the architecture allows, consider returning streamed image responses (`image/*`) instead of JSON. This would reduce JS memory usage, remove Base64 overhead, and allow the browser's native image pipeline and HTTP cache to handle artwork efficiently.

## Rule of thumb

Optimize **critical rendering path first**, not total work.

The hero artwork affects LCP.

Hidden queue artwork does not.