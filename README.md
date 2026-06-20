# Vivek Kumar — Portfolio

A fully static portfolio site built with **Astro v6** and **Tailwind 4** (via `@tailwindcss/vite`).
All content is baked into HTML at build time; JavaScript only powers animation, interaction, and
the on-page chat assistant.

## Stack

- **Astro 6** — `output: "static"`, `build.format: "file"`
- **Tailwind 4** — through the `@tailwindcss/vite` plugin (no PostCSS config)
- **Vite 7**
- **Node 22** (see `.nvmrc`)

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
npm run build      # production build -> dist/
npm run preview    # serve the built dist/ locally
```

## Deploy — Cloudflare Pages

This is a static site, so **no SSR adapter is required**.

**Option A — Git integration (recommended)**

1. Push this repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Environment variables → add **`NODE_VERSION` = `22`** (matches `.nvmrc`).
5. **Save and Deploy.** Every push to the production branch redeploys automatically.

**Option B — Direct upload via Wrangler**

```bash
npm run build
npx wrangler pages deploy dist --project-name vivek-kumar-portfolio
```

No `functions/` directory and no secrets are needed — the build output in `dist/` is the entire site.
