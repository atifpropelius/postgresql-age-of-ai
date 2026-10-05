# Visualization map

| Visual | Learner question | Interaction / data | Fidelity |
|---|---|---|---|
| Hosting fit | Where should PostgreSQL run? | Select prototype, steady critical, or host-control scenario | Decision aid, not a price claim |
| API vs database | Which process uses which CPU, RAM and storage? | Play a SQL request and returned rows between hosts | Conceptual |
| Build a database | What exists inside what? | Step server → database → schema → table → row and inspect exact SQL | Conceptual |
| Table anatomy | What are column, row, cell and heap tuple? | Highlight each part of a typed table | Conceptual |
| Mathematical relation and FK | Is the relation the FK arrow? | Distinguish set of tuples from value-check constraint and JOIN | Conceptual |
| Concurrent transactions | Who waits and what can a reader see? | Play 8 phases showing row lock, wait, snapshot and commit | Simplified READ COMMITTED; no timing claim |
| Views | Why is a materialized result stale? | Insert base row, compare normal view and materialized view, refresh | Conceptual |
| Extensions | What can be added to PostgreSQL? | Animate core plus pg_trgm, PostGIS and vector | Conceptual |
| Supabase | Which service rests on which database capability? | Highlight Auth, API, Realtime, Storage, Edge Functions, Studio | Architecture map |
| Query path | Where does SQL go? | Step through parse → plan → execute → buffers/storage | Conceptual |
| Relationships | Why keys? | Select entity, highlight links | Conceptual |
| Transaction | What does rollback undo? | Commit/rollback state | Deterministic toy model |
| MVCC | Why can an old read continue? | Advance two transactions through versions | Simplified visibility model |
| Index | How is scanning avoided? | Compare linear search with B-tree path | Conceptual |
| EXPLAIN tree | What did the database actually do? | Select node, see estimates/actuals/buffers | LIVE JSON when connected |
| Performance | Did the index help here? | Seed, run, index, rerun | Real PostgreSQL LIVE; labeled prepared example |
| VACUUM | Where do dead tuples go? | Update then vacuum page cells | Simplified page model |
| WAL/replicas | What survives and propagates? | Step write, flush, replay | Conceptual |
| Pool | What happens when demand exceeds capacity? | Pool size/request sliders, queue/timeouts | Deterministic illustrative scheduler |
| Partitioning | Which months are scanned? | Change date predicate | Conceptual pruning |
| Vector space | What does semantic similarity mean? | Select query, highlight neighbors | Illustrative 2D only |
| RAG | What evidence reaches the model? | Ask, inspect chunks, reveal answer | LIVE requires configured services; prepared mode labeled |
| Resource dashboard | Which resource is pressured? | Switch workload | Illustrative, never actual telemetry |

All motion has an explanatory text equivalent and honors reduced motion. SVG/CSS are used for the diagrams because they carry the concepts without heavy WebGL dependencies.
