# Vivek Kumar — Portfolio

A fully static portfolio site built with **Astro v7** and **Tailwind 4** (via `@tailwindcss/vite`),
deployed on **Cloudflare Workers**. All content is baked into HTML at build time; JavaScript only
powers animation, interaction, and the on-page chat assistant.

## Stack

- **Astro 7** — `output: "static"`, `build.format: "file"` (every page emitted as `*.html`)
- **Tailwind 4** — through the `@tailwindcss/vite` plugin (no PostCSS config)
- **Vite 8**
- **No server adapter** — the whole site is prerendered to `dist/`, then served as static assets
  on **Cloudflare Workers** (via `wrangler`). No server function is needed.
- **Node 22.12+** (see `.nvmrc`)

## Project structure

```
src/
  data/            # single source of truth (edit content here)
    site.json        # identity, nav, socials, SEO, footer, stats, hero terminal, contact
    portfolio.json   # about, skills, experience, projects, achievements, education, testimonials
    themes.json      # color palettes -> :root + html[data-theme="…"]
    chat.json        # chat UI strings, suggestions, refusal line, and the knowledge base
  layouts/
    BaseLayout.astro # <head>, SEO, font links, theme-token injection, pre-paint theme script
  components/        # Nav, Hero, About, Skills, Experience, Projects, ProjectCard, ArchFlow,
                     # QuoteAssistDiagram, SidecarDiagram, AchievementsEducation, Contact,
                     # Footer, ChatWidget
  scripts/
    ui.js            # theme toggle + persistence, scroll reveal, skill bars, nav state, year
    chat.js          # rule-based assistant (reads chat.json)
    qa-flow.js       # QuoteAssist animated request-flow loop
  styles/
    global.css       # Tailwind entry, @theme fonts, component styles, keyframes
  pages/
    index.astro      # assembles the single page
public/              # Vivek-Kumar-Resume.pdf and other static assets
_design-source/      # the original Claude Design export (HTML/CSS/JS), kept for reference
```

## Editing content

Everything visible on the site comes from `src/data/*.json` — no markup edits needed for content
changes. After editing JSON, rebuild (or the dev server hot-reloads).

- **Add a project** → add an item to the relevant group in `portfolio.json`. `variant: "flagship"`
  renders the full card (with a diagram); `variant: "compact"` renders a small card.
- **Add a theme** → add an entry under `themes.themes` in `themes.json`; a `html[data-theme="…"]`
  block is generated automatically.
- **Tune the chat** → edit `chat.json`: `ui` strings, `assistant.refusal` (the off-topic reply),
  and the `knowledge` array (each intent = `keys` to match + an `answer`).

### About the chat assistant

The assistant is intentionally **rule-based and 100% static** — it matches a question against the
knowledge base in `chat.json` and replies locally in the browser. There is no API key, no backend,
and no per-message cost. Off-topic questions get the polite refusal from `chat.json`.

## Commands

```bash
nvm use            # Node 22
npm install
npm run dev        # local dev server on http://localhost:5173
npm run build      # production build -> dist/ (static .html + assets)
npm run preview    # serve the built dist/ locally
npm run deploy     # build, then `wrangler deploy` to Cloudflare Workers
```

## Deploy — Cloudflare Workers (static assets)

`astro build` prerenders the entire site to `dist/`. There is no server function, so deployment is
just uploading those static assets. [`wrangler.jsonc`](./wrangler.jsonc) at the repo root points
Wrangler at `dist/`, and [`public/_headers`](./public/_headers) sets immutable caching on the
hashed `/_astro/*` files.

**Option A — Wrangler from your machine / CI**

```bash
npm run deploy     # = astro build && wrangler deploy
```

The first deploy will prompt you to authenticate (`npx wrangler login`).

**Option B — Git integration**

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Connect to Git** → pick the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Set the build **Node version to 22** (matches `.nvmrc`).
5. **Save and Deploy.** Every push to the production branch redeploys automatically.

No worker code or secrets are needed — the static assets in `dist/` are the entire site.
