# Supabase — From Idea to Production

An interactive, 14-screen, approximately 30-minute talk for **FS-03: Supabase as a backend — what runs where**. The main route tells one story: build and ship a private taskboard with Supabase. It covers Database, Data API and OpenAPI, Auth and introductory RLS, Storage, Realtime, Edge Functions, Queues and Cron. Technical detail and speaker notes are available per screen without extending the main talk.

Use [TECH-TALK-SCOPE.md](docs/TECH-TALK-SCOPE.md) to keep this talk distinct from the other company sessions. Follow [SESSION-FORMAT.md](docs/SESSION-FORMAT.md) for the 60-minute event. Q&A and quiz questions are prepared separately and are not presentation screens.

## Run

```bash
cd supabase-talk
npm run dev
```

Open <http://127.0.0.1:4173/>. For a static build, run `npm run build`; the deployable output is `dist/`. No packages or credentials are required.

## Present

- **← / →:** previous and next screen
- **Space / ↓:** next step inside the current illustration
- **Home / End:** first and last screen
- **O:** overview
- **D:** technical details and real SQL/code
- **N:** speaker notes
- **Esc:** close a panel

The **Play flow** button advances an illustration automatically. Interactive scenes are conceptual demonstrations, clearly labeled where they simulate a result. Real SQL and SDK examples are in the technical details panels; the deck does not connect to a live Supabase project. Product claims link to official Supabase docs; see [SOURCES.md](docs/SOURCES.md).

## Edit the talk

Slide titles, timing, notes and sources live in `src/slides.js`. The visual renderers and controls live in `src/app.js`; all responsive styling is in `src/style.css`.

## Deploy

Render is configured from the repository root in `../render.yaml`. For a manually created Static Site: root directory `supabase-talk`, build command `npm run build`, publish directory `dist`.

If an existing manual Render site still builds from `postgresql-age-of-ai`, its `npm run build` now publishes this Supabase talk as well. This keeps the current site working while you switch its root directory when convenient.

The previous PostgreSQL course remains under `../postgresql-age-of-ai/` for reference.
