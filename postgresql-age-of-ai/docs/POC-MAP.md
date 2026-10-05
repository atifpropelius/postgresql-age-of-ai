# Proof-of-concept map

| POC | Live source | Prepared behavior | Reset / failure behavior |
|---|---|---|---|
| Million-row index benchmark | Local `psql`, `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` | Labeled teaching example with no fabricated times | Schema-scoped reset; API error leaves slide usable |
| 100K–10M datasets | `generate_series`, batched inserts, opt-in 5M/10M | Progress illustration only | Sizes above 1M require full mode |
| VACUUM | Fixed local UPDATE and VACUUM statements; PostgreSQL statistics are estimates | Animated page model | Reset demo table and visual |
| Transaction | Fixed local COMMIT / ROLLBACK scripts and real balances | Deterministic bank transfer visual | Reset account balances |
| Pool exhaustion | Browser scheduler | Same deterministic scheduler | Reset sliders |
| Vector retrieval | Local pgvector + configured embedding endpoint; exact cosine ranking | Labeled conceptual flow only | Restore seed chunks |
| RAG answer | Configured embedding and LLM endpoints | Labeled prepared question/chunks/answer | Clear question and result |

The static presentation is independent of the local demo API. No fake timing value is shown in prepared mode. LIVE calls are bound to a local server and fixed SQL templates; arbitrary SQL is not accepted from the browser.
