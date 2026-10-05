# Demo runbook

1. Start a disposable PostgreSQL database. For a pgvector-enabled example, run `docker compose up -d` and set `PGHOST=127.0.0.1`, `PGPORT=5544`, `PGUSER=pgai`, `PGPASSWORD=pgai_local_demo`, `PGDATABASE=pgai`. Or point libpq variables to another disposable database with pgvector installed.
2. Run `npm run demo` in the presentation directory. The API binds to `127.0.0.1:8765`.
3. Run `npm run dev` in another terminal; open `http://127.0.0.1:4173`.
4. Click **LIVE** and open slide 17 via overview or `?slide=17`.
5. Select **1,000,000 rows** and click **Seed**. Wait for the real progress count and completion message.
6. Click **Run before**, **Create index**, **Run after**. Read scan type, execution time, filter removals and buffer hits from the measured plan. Use slide 16 for the clickable plan tree.
7. Test a broad filter. An index may not be selected or may not help; explain selectivity rather than promising universal speedups.
8. For 5M/10M only, restart the API with `PGAI_FULL_MODE=1`; allow enough disk/time and reseed.
9. For vector/RAG, verify `pgvector` is available; set `EMBEDDING_URL`, `EMBEDDING_MODEL`, `LLM_URL`, `LLM_MODEL` and optional keys before starting the API. Ollama `/api/embed` and `/api/chat` work as local endpoints. On slide 32, run a real top-three vector search. On slide 33, ask a question, inspect the retrieved chunks, then reveal the answer.
10. Run `npm run preflight`. A failed check describes a missing service or dataset. Prepared mode remains available.
11. Use **Reset** on the performance slide to drop the `pgai_demo` schema. Seed again before the next LIVE run.

The API never accepts arbitrary SQL. RAG answers are generated only if an LLM endpoint is configured. Vector search uses actual pgvector results when the extension and embedding endpoint are available.

## Recovery during a talk

If LIVE fails, click **LIVE** to return to **PREPARED**. The visuals continue and show no invented execution times. Continue with the plan explanation and run the benchmark after the talk if useful.
