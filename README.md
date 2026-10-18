# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

The project is organized by route and isolated page-level features:

```text
src/
├── pages/
│   └── index.astro
├── features/
│   ├── shared/                         # Reused across experiences
│   ├── landing/
│   │   ├── hero/                       # Hero markup, styles, script, and headline data/content
│   │   │   ├── Hero.astro
│   │   │   ├── hero.css
│   │   │   ├── hero.ts
│   │   │   ├── data/
│   │   │   └── content/
│   │   ├── cellular-automata-background/ # Background markup, styles, and script
│   │   │   ├── CellularAutomataBackground.astro
│   │   │   ├── cellular-automata-background.css
│   │   │   └── cellular-automata-background.ts
│   │   └── legacy/                      # Retained assets not currently used
│   ├── tardis/
│   └── spotify/
├── global.css                           # Site-wide styles and semantic tokens
└── layouts/

public/
scripts/                                 # Project scripts, including headline ID generation
tests/                                   # Automated tests
package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

This project organizes UI components by feature under `src/features/`. Shared components belong in `src/features/shared/`, while page-specific components belong in their respective feature directories.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
