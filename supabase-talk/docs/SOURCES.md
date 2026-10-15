# Supabase content and source map

Reviewed: 2026-10-15. The official documentation and Supabase's own announcement are the source of record. The talk has no live project connection; illustrated users, tasks, and request flows are examples.

| Topic | Main screens | Official source | Confidence / limit |
| --- | --- | --- | --- |
| Platform architecture, Postgres core, service boundaries | 1, 2, 4, 14 | [Architecture](https://supabase.com/docs/guides/getting-started/architecture) | High. Diagram is simplified for teaching. |
| Adoption, valuation, and business model | 1 | [Series F announcement](https://supabase.com/blog/series-f), [Supabase press release](https://www.prnewswire.com/news-releases/supabase-raises-500m-at-10-5b-to-accelerate-lead-in-agentic-infrastructure-302791787.html), [Billing](https://supabase.com/docs/guides/platform/billing-on-supabase) | High for Supabase-reported figures. In June 2026 the company said nearly 10M developers built on Supabase, more than 250K customers, and $10.5B post-money valuation. It did not disclose how many customers pay. Developer count, customer count, paying count, valuation, and revenue are different measures. |
| Database, schema, tables and keys | 5 | [Database overview](https://supabase.com/docs/guides/database/overview) | High. SQL example is illustrative and not run against a Supabase project. |
| Data API and client access | 6 | [Data API](https://supabase.com/docs/guides/api), [Connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres) | High. Request example omits deployment-specific hostname. |
| Auth identity and JWT | 7 | [Auth architecture](https://supabase.com/docs/guides/auth/architecture) | High. |
| RLS, grants, keys, and policy example | 7, 13 | [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [API keys](https://supabase.com/docs/guides/getting-started/api-keys) | High. The two-user result is a simulated policy walkthrough. |
| Storage metadata and object bytes | 8 | [Storage schema](https://supabase.com/docs/guides/storage/schema/design) | High. |
| Database Changes, Broadcast, Presence | 9 | [Realtime architecture](https://supabase.com/docs/guides/realtime/architecture) | High. Scene is illustrative, not a running WebSocket demo. |
| Edge Functions | 10 | [Edge Functions architecture](https://supabase.com/docs/guides/functions/architecture) | High. Secret example is conceptual. |
| pgvector and embeddings | 11 | [Vector columns](https://supabase.com/docs/guides/ai/vector-columns) | High. Vector space graphic is conceptual, not a measured embedding. |
| CLI and migration workflow | 12 | [Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows) | High. Commands stop at dry run by design. |
| Connection modes, sizing and operational decisions | 13 | [Connect to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres), [Compute and Disk](https://supabase.com/docs/guides/platform/compute-and-disk) | High. No universal pool or compute size is prescribed. |

The archived PostgreSQL course and supplied System Design Crash Course informed the teaching style, but the current talk is a new Supabase story with its own examples.
