# PostgreSQL in the Age of AI

An interactive 35-screen, 45-minute presentation with a 114-lesson zero-to-hero study path. The main route now begins with PostgreSQL, tables, columns, rows, SQL command families and database choice before moving through internals, production systems and AI. It runs as a static site. A separate localhost demo controller provides real PostgreSQL benchmark measurements and, when configured, pgvector retrieval and RAG.

## Open the presentation

Requirements: Python 3 to serve static files; Node.js 20+ and `psql` only for LIVE demos.

```bash
cd postgresql-age-of-ai
npm run dev
```

Open `http://127.0.0.1:4173`. No package installation or build step is needed. The default **PREPARED** mode works without a database. Prepared mode labels illustrative diagrams and contains no invented timing data.

Keep this command running in its own terminal. `npm run demo` starts only the separate API on port 8765; its root URL returns `{"error":"Not found"}` because it does not serve the presentation. If the browser says port 4173 refused the connection, start `npm run dev` in another terminal and check that it remains running.

Use ←/→ or Space to navigate, Home/End to jump, `O` for overview, `N` for speaker notes and Escape to close overlays. The top controls open the 114-lesson **Study path**, simple and deep explanations, a light theme and a full-deck print/PDF view. Slides have shareable `?slide=17` URLs. Q&A includes the 100 supplied question-bank prompts plus curated questions; exercises contain 20 short tasks.

## Follow the zero-to-hero study route

Open **Study path** on any screen, or read [ZERO-TO-HERO-GUIDE.md](docs/ZERO-TO-HERO-GUIDE.md). It contains 114 lessons and 17 guided experiments from creating a database through SQL, transactions, internals, operations, Supabase and RAG. To run the small worked examples in a disposable local database:

```bash
createdb learning
psql -d learning -f demo/study-schema.sql
psql -d learning
```

In each new psql session run `SET search_path TO study, public;`. The separate million-row performance lab below has its own `pgai_demo` schema.

For a complete, rerunnable SQL workshop covering DDL, INSERT/UPDATE/DELETE, SELECT, JOIN, GROUP BY, subqueries, CTEs, windows, views, transactions and EXPLAIN, use a disposable database:

```bash
createdb learning
psql -v ON_ERROR_STOP=1 -d learning -f examples/sql-workshop.sql
```

The script creates only the `workshop` schema. It is also linked from the SQL screen's Study path.

## Start LIVE performance demos

Create a disposable PostgreSQL database and set the usual libpq environment variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`). Use a database user allowed to create a schema and table. `compose.yaml` provides an optional pgvector-enabled PostgreSQL 17 container on localhost port 5544. The controller binds only to `127.0.0.1:8765` and accepts fixed operations, not browser-submitted SQL.

```bash
npm run demo
npm run preflight
```

Start the static server in another terminal, switch the UI to **LIVE**, then open slide 17. Select 100K or 1M rows, **Seed**, **Run before**, **Create index**, **Run after**. Dataset generation runs in 100K-row batches and reports progress. The comparison uses PostgreSQL JSON plans and actual execution timings and buffers. The unindexed query may be slower or faster on a different machine; the plan is authoritative.

5M and 10M are opt-in. Start the demo API with `PGAI_FULL_MODE=1 npm run demo` only after checking available disk and time. Seeding replaces the demo users and orders tables. **Reset** drops only `pgai_demo` in the configured database. The seed response reports generation time and database size from the current machine.

## Configure vector retrieval and answer generation

LIVE RAG requires an installed `vector` extension and an OpenAI-compatible embedding endpoint. Set `EMBEDDING_URL` and `EMBEDDING_MODEL` (and optionally `EMBEDDING_API_KEY`). The demo seeds eight PostgreSQL teaching chunks with embeddings from that endpoint and retrieves the top three using pgvector cosine distance. It displays those chunks first.

For answer generation, also set `LLM_URL` and `LLM_MODEL` (optionally `LLM_API_KEY`) for an OpenAI-compatible chat completions endpoint. Without it, LIVE mode still shows real retrieval and clearly reports that answer generation is unavailable. Do not mix embeddings from different models in the same demo table; reset the `pgai_demo` schema when changing models. The demo currently uses exact pgvector search; HNSW and IVFFlat are explained conceptually rather than benchmarked.

Ollama's `/api/embed` and `/api/chat` endpoints are also supported. For example, after installing and starting Ollama and pulling suitable local models, set `EMBEDDING_URL=http://127.0.0.1:11434/api/embed`, `EMBEDDING_MODEL` to the embedding model name, `LLM_URL=http://127.0.0.1:11434/api/chat`, and `LLM_MODEL` to the chat model name. Model downloads are separate from this repository.

## Deployment

The public presentation needs `index.html`, `src/`, `examples/` and optionally `exports/` for the PDF. `npm run build` copies those files to `dist/` for **PREPARED** mode. No server-side runtime is needed.

### Render with automatic Git deployment

The Git repository's root is currently the parent `ppt/` directory. Its [`render.yaml`](../render.yaml) defines a Render static site with root directory `postgresql-age-of-ai`, build command `npm run build`, publish directory `dist`, and automatic deployment on each push to `main`. In Render, choose **New → Blueprint**, connect the GitHub repository, select `main`, review the one static site, then **Deploy Blueprint**. The resulting `*.onrender.com` URL serves the prepared presentation.

If you prefer creating a Render **Static Site** without the Blueprint, use the same four settings above. Do not create a Web Service for this frontend.

For a free Cloudflare Pages direct upload, package only the public files from this directory:

```bash
cd ~/Atif/Workspace/active/ppt/postgresql-age-of-ai
npm run build
```

In Cloudflare **Workers & Pages**, choose **Create application → Get started → Drag and drop your files** and upload the `dist/` folder. The resulting `*.pages.dev` URL serves the prepared presentation.

For automatic deployment, put this project in its own GitHub or GitLab repository and connect it to Cloudflare Pages through **Import an existing Git repository**. Set the production branch to `main`, build command to `npm run build`, and build output directory to `dist`. Each push to `main` will publish the new presentation. The generated `dist/` folder is ignored by Git. This keeps the local demo controller and Compose configuration out of the public site.

The LIVE controls call `127.0.0.1:8765` in the viewer's browser. They need the local demo controller and PostgreSQL on that same computer; uploading the static files does not host those services. Do not expose the current demo controller on the internet without authentication, rate limiting, TLS and resource controls.

Use the print icon for a supporting PDF export. A 35-page, 16:9 copy is included at [`exports/postgresql-age-of-ai.pdf`](exports/postgresql-age-of-ai.pdf). The HTML experience is the primary artifact.

## Project guide

- `src/slides.js`: 35 main screens and curated exercises
- `src/curriculum.js`, `src/curriculum-foundations.js` and `src/curriculum-advanced.js`: 114 lessons with plain explanations, SQL, production decisions and sources
- `src/walkthroughs.js`: 17 guided experiments with expected observations
- `docs/ZERO-TO-HERO-GUIDE.md`: exportable full study text
- `src/question-bank.js`: 100 questions extracted from the supplied Question Bank
- `src/app.js`: navigation, speaker mode, demos and visual renderers
- `demo/server.js`: localhost PostgreSQL/pgvector/RAG controller
- `scripts/preflight.js`: environment checks
- `docs/`: curriculum, source, visualization, POC and presentation runbooks

See [DEMO-RUNBOOK.md](docs/DEMO-RUNBOOK.md) and [PRESENTATION-RUNBOOK.md](docs/PRESENTATION-RUNBOOK.md).
