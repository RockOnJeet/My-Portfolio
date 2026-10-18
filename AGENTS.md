# Project Structure

This project uses Astro's file-based routing. Keep the structure understandable and introduce extra folders only when there is code to put in them.

## Source layout

```text
src/
├── pages/                 # URL routes: Astro maps files here to URLs.
├── features/
│   ├── shared/            # Components, helpers, or data reused by multiple experiences.
│   ├── landing/           # Landing page, organized by page-level feature
│   │   ├── hero/          # Hero component, styles, browser script, and headline data/content
│   │   ├── cellular-automata-background/ # Background component, styles, and browser script
│   │   └── legacy/        # Retained assets not currently used by active features
│   ├── tardis/            # TARDIS experience implementation and its local pieces.
│   └── spotify/           # Spotify experience implementation and its local pieces.
├── layouts/               # Optional page shells that wrap page content when multiple routes share a document structure.
└── global.css             # Site-wide CSS and semantic design tokens.
```

### How to decide where code belongs

- **`pages/` — routing and assembly.** An `.astro` file here determines a URL. Keep route files small: import the appropriate feature and compose it into a page. Astro handles the route mapping; do not add a custom router unless there is a specific need.
- **`features/shared/` — shared resources.** Put components, helpers, and data here only when more than one experience uses them. Examples might include a site-wide navigation component, footer, or generic button. A component used by only one experience belongs inside that experience instead.
- **`features/landing/`, `features/tardis/`, and `features/spotify/` — isolated experiences.** Keep each experience's own components, data, types, browser scripts, and React components together. Within an experience, give each substantial page-level feature its own directory containing its component, styles, and browser script; keep feature-specific data/content alongside the feature that owns it. Use `legacy/` only for retained assets not currently used by active features. Add subdirectories only when they organize actual files.
- **`layouts/` — reusable outer page structure.** A layout can contain the document-level HTML, metadata, common chrome, and an Astro `<slot />` where page content goes. Layouts are optional: keep one when multiple pages benefit from the same shell; different experiences may use different layouts or none.
- **`global.css` — global appearance.** Keep site-wide base styles and semantic CSS variables here. Prefer semantic names (for example, background, text, border, accent) so theme values can be adjusted centrally. Component-specific styles may live next to the component.

## Working principles

- Separate route selection, feature behavior/content, shared UI, and visual styling.
- Prefer simple Astro components for static or server-rendered markup. Use React/client-side JavaScript when actual browser interactivity requires it.
- Do not create placeholder abstractions or directory trees without a current use.
- Preserve unrelated worktree changes; inspect Git status and diffs before cleanup or deletion.
- When changing structure, verify route imports and run the project's available Astro checks/builds where practical.

## Development

When starting the dev server, use background mode:

```sh
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
