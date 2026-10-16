# Supabase as a Backend: What Runs Where

A **21-slide, 38-minute** internal engineering talk within a 60-minute session. It teaches the boundaries between Supabase's Postgres database, APIs, Auth, Storage, Realtime, Edge Functions and background work through Atif's private task app. A 90-second slide explains the new Supabase Compute private alpha and why our project cannot use it yet. One short example shows an optional Cloudflare Worker gateway for abuse protection and a branded API entry point. Five Studio slides explain every dashboard section shown in the project menu. A production-habits slide covers dashboard MFA recovery, migrations, Security Advisor and Observability. The audience deck uses a white presentation with a restrained accent; detailed field-by-field material remains in separate presenter documents.

## Run locally

```bash
cd supabase-talk
npm run dev
```

Open <http://127.0.0.1:4173/>. The site is static and uses no packages, credentials or live Supabase connection. Keep the terminal running while presenting.

| Key or control | Action |
| --- | --- |
| Right arrow / left arrow | Next / previous slide |
| Home / End | First / last slide |
| Space (when the page has focus) | Next slide |
| Footer arrows | Next / previous slide |
| Browser Back / Forward | Return to previously visited slides |
| Overview (top right) | See every section and slide title; select one to jump to it. Escape or Close returns to the slide. |

Slide number and section are shown in the footer. The overview shows the company session format and is generated from the slide list, so its titles and talk time stay in sync with the deck. It also links to the official Docs, CLI reference and Atif's quick command notes. There are no audience-facing notes or theme controls.

## Supabase project-start references

- [Official Supabase Developer Docs](https://supabase.com/docs) — start here for current product guidance.
- [Official Supabase CLI reference](https://supabase.com/docs/reference/cli/introduction) — check command syntax and flags.
- [Atif's Supabase project setup and command notes](https://docs.google.com/document/d/1BuuqS7D1_e4EBkRsocbWcxqVBCOK2_jKl3bIAOkuTyw/edit?tab=t.0#heading=h.93vq90vfy6sb) — personal reference when starting a project. Verify commands against the official CLI reference before running them.

## Presenter preparation

Start with [PRESENTER-GUIDE.md](docs/PRESENTER-GUIDE.md): it has the exact slide timing and talk track. Study the [dashboard guide](docs/DASHBOARD-GUIDE.md), [Usage guide](docs/USAGE-GUIDE.md), [CLI reference](docs/CLI-REFERENCE.md), and retained [task-app code examples](docs/PRACTICAL-EXAMPLES.md) for questions. The [demo runbook](docs/DEMO-RUNBOOK.md) gives a 4–5 minute live route and a prepared offline fallback. [Facilitator guide](docs/FACILITATOR-GUIDE.md) has the quiz and Q&A separately. [Session format](docs/SESSION-FORMAT.md) and [scope](docs/TECH-TALK-SCOPE.md) preserve the company requirements.

The main deck contains illustrative task data and a labeled example Pro Usage snapshot. It never represents them as live project data. If the local server fails during the demo, open the [standalone six-frame screenshot fallback](assets/demo-fallback/index.html) directly. Sources and qualifications are in [SOURCES.md](docs/SOURCES.md). The earlier [Observability reference](docs/OBSERVABILITY-GUIDE.md) remains for optional study.

## Build and deploy

```bash
cd supabase-talk
npm run check
npm run build
```

The static output is `dist/`. Render is configured by [render.yaml](../render.yaml) for automatic deployment from the repository's `main` branch. For a manually created Render Static Site, use root directory `supabase-talk`, build command `npm run build`, and publish directory `dist`. No web service or database is needed for the audience deck.

Edit slide content and timings in `src/slides.js`, rendering in `src/app.js`, and layout in `src/style.css`. The old PostgreSQL course remains in `../postgresql-age-of-ai/`.
