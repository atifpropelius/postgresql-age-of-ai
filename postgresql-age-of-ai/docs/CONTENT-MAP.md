# Curriculum and content map

Reviewed 2026-10-05. Main route: **35 screens / 45 minutes**. Q&A: 15 minutes; exercises: 10–15 minutes. Click through an animation during the main route; use Study path for the full 114-lesson course. LIVE measurements require the separate local PostgreSQL demo service.

| # | Topic | Minutes | Simple explanation | Visual / demo |
|---:|---|---:|---|---|
| 1 | PostgreSQL in the Age of AI | 1 | From a single SQL query to a production data system and an AI answer. | hero |
| 2 | What is PostgreSQL—and when should you choose it? | 1 | PostgreSQL is open-source database server software: it stores related data, runs SQL and protects changes with transactions. | pillars |
| 3 | Your API server is not your database | 1 | The API runs application code. PostgreSQL is a separate server process with its own CPU, RAM, storage and connections. | runtime |
| 4 | PostgreSQL in one picture | 1 | A request crosses connection handling, parsing, planning, execution, memory and storage. | pipeline |
| 5 | From PostgreSQL server to your first row | 1 | Start the server, create a database, connect, create a schema and table, then insert and query a row. | create |
| 6 | Tables, columns, rows—and tuples | 1 | A table defines a shape. Columns are named typed fields; rows are records; a cell is one value. | table |
| 7 | A relation is a mathematical idea, not an FK line | 1 | In the relational model, a relation is a set of tuples with named attributes. A SQL table is its practical counterpart. | relation |
| 8 | Relationships make data useful | 1 | A primary key identifies a row. A foreign key checks that a value refers to an allowed row in another table. | relations |
| 9 | What can you do with SQL? | 1 | Define tables, read results, change rows, control transactions and grant access. | sqlFamilies |
| 10 | What happens during INSERT? | 1 | A write creates a new tuple and WAL records the change before commit is acknowledged as durable. | write |
| 11 | A transaction keeps changes together | 1 | Move ₹2,000 between accounts. Either both updates commit or neither does. | transaction |
| 12 | Who reads, who waits, and who sees the new version? | 1 | T1 updates a row and holds its row lock. T2 tries to update that same row and waits. A normal reader can still see a suitable committed version. | concurrency |
| 13 | MVCC: readers see a snapshot | 2 | An update creates a new row version. Existing readers can continue using a version visible to their snapshot. | mvcc |
| 14 | The same query gets expensive | 1 | As row count grows, a full table scan examines more data even when the result stays one row. | growth |
| 15 | An index narrows the search | 1 | A B-tree is another structure that helps locate candidate rows; it costs space and write work. | btree |
| 16 | EXPLAIN ANALYZE: PostgreSQL’s receipt | 2 | Run the query, inspect its plan tree, then compare estimated rows with actual rows, time, loops and buffers. | explain |
| 17 | Make it slow. Measure. Fix it. | 4 | Prepare a real dataset, run the exact query, add one index, and compare actual PostgreSQL plans. | lab |
| 18 | Where does a row live? | 1 | Relations are made of pages; pages hold tuple versions. Shared buffers cache pages in memory. | pages |
| 19 | Why VACUUM exists | 1 | UPDATE and DELETE leave obsolete versions. VACUUM reclaims eligible space for reuse. | vacuum |
| 20 | WAL lets PostgreSQL recover | 1 | Log records make committed changes recoverable even if dirty data pages were not flushed before a crash. | wal |
| 21 | Primary → replicas | 1 | A primary sends WAL to replicas. Replicas can serve reads, but lag and failover need explicit handling. | replication |
| 22 | Connection pooling controls concurrency | 2 | Requests borrow a limited set of reusable connections. Excess requests wait or time out. | pool |
| 23 | Partitioning lets PostgreSQL skip data | 1 | A date predicate can prune partitions outside the requested range. | partition |
| 24 | Partitioning ≠ sharding | 1 | Partitions live under one logical PostgreSQL database. Shards split data across databases and add routing complexity. | scale |
| 25 | Self-host, serverless Postgres, or managed RDS? | 1 | Choose from workload shape, operational control, availability needs and observed CPU, RAM, I/O and connection pressure. | deploy |
| 26 | Roles, grants and RLS protect rows | 1 | Authentication identifies a caller. Grants and row-level security decide what the caller may access. | rls |
| 27 | Views and materialized views are different | 1 | A view stores a query definition. A materialized view stores the query result until you refresh it. | views |
| 28 | What Supabase builds around PostgreSQL | 1 | PostgreSQL stores the data; Auth, PostgREST APIs, Realtime, Storage, Edge Functions and Studio add product services. | supabase |
| 29 | Extensions add database capabilities | 1 | Extensions install SQL objects such as types, functions, operators and index methods into a database. | extensions |
| 30 | JSONB and text search | 1 | Structured columns, JSONB, full-text search and trigram search answer different retrieval questions. | search |
| 31 | What is an embedding? | 2 | An embedding model maps text to a numeric vector. Nearby vectors can represent related meaning. | vector |
| 32 | pgvector adds vector search | 1 | Store vectors beside metadata and use SQL to rank nearest neighbors. | pgvector |
| 33 | RAG retrieves evidence before answering | 3 | Question → embedding → vector search → visible chunks → context → model answer. | rag |
| 34 | Scale the bottleneck you measure | 2 | Load balancing, stateless APIs, pools, cache, replicas, queues and observability each have a job. | resources |
| 35 | One request. One database. Many guarantees. | 1 | SQL, transactions, plans, pages, WAL, maintenance, pooling and retrieval now form one picture. | final |

## Concepts deliberately visible in the main route

What PostgreSQL is and when to choose it; server versus API resources; create your own database; database/schema/table/column/row/tuple; relation as mathematical concept versus foreign key; SQL command families (DDL, SELECT, DML, transaction and access commands); two concurrent writers, a snapshot reader and lock waiting; EXPLAIN ANALYZE fields and live JSON plan; views versus materialized views; extension installation; Supabase service boundaries; and self-host, serverless and managed hosting choices.

## Teaching boundaries

- The transaction timeline and resource dashboard are illustrative. There is no universal transaction duration; use observed latency, transaction age and lock waits.
- `EXPLAIN ANALYZE` executes SQL. LIVE plans and timings come from PostgreSQL; prepared mode has no invented timing. Output rows are not the same as rows examined.
- A foreign key enforces integrity and does not automatically create an index on referencing columns.
- A normal view reads base data at query time; a materialized view retains a result until REFRESH.
- A relation in theory is a set of tuples; SQL tables can allow duplicates and NULL. PostgreSQL heap tuples are physical row versions.
- The 2D vector plot is a teaching illustration.

## Full zero-to-hero study route

| Screen | Main topic | Study lessons | Coverage |
|---:|---|---:|---|
| 1 | PostgreSQL in the Age of AI | 1 | The whole data journey |
| 2 | What is PostgreSQL—and when should you choose it? | 6 | What PostgreSQL actually is; Choose PostgreSQL for a concrete workload; When another primary store fits better; Why a database exists; PostgreSQL versus other data systems; Choosing PostgreSQL honestly |
| 3 | Your API server is not your database | 2 | What CPU, RAM and disk do in a database server; API process versus database process |
| 4 | PostgreSQL in one picture | 2 | What happens to a SELECT; Connection and process lifecycle |
| 5 | From PostgreSQL server to your first row | 5 | Server, database, schema and table are four levels; Create your own database; First psql habits; Install locally, use a container, or use a service; Schema changes are code |
| 6 | Tables, columns, rows—and tuples | 7 | Read one table without jargon; Why data types and constraints exist; Table, row, column and physical tuple; Types, NULL and time; Identity, UUID and sequence behavior; Status values and domain rules; Arrays and ranges have specific jobs |
| 7 | A relation is a mathematical idea, not an FK line | 1 | Mathematical relation versus relationship |
| 8 | Relationships make data useful | 5 | What primary keys, foreign keys and JOINs each do; Model one-to-many and many-to-many; JOINs and missing matches; Normalize facts before duplicating them; Foreign keys and delete actions |
| 9 | What can you do with SQL? | 12 | What SQL is and what a query returns; Why SQL does not tell PostgreSQL how to scan; DDL: create and change database structure; DML: insert, update, delete and return rows; SELECT: filter, sort and limit a result; JOIN and GROUP BY answer multi-table questions; Subqueries, CTEs, set operations and windows; Transaction and privilege commands; Read SELECT in logical order; Subqueries and CTEs; Aggregation and windows; Recursive CTEs for hierarchies |
| 10 | What happens during INSERT? | 4 | A write before disk flush; Write, change and return rows; COPY and bulk loading; Soft delete versus real delete |
| 11 | A transaction keeps changes together | 4 | ACID is four different guarantees; Isolation levels and anomalies; Savepoints and partial rollback; Idempotency for retried writes |
| 12 | Who reads, who waits, and who sees the new version? | 3 | Two writers and one reader; Deadlocks and safe retries; Lock queues and timeouts |
| 13 | MVCC: readers see a snapshot | 2 | Tuple versions and snapshots; HOT updates and visibility map |
| 14 | The same query gets expensive | 1 | Why data growth changes the plan |
| 15 | An index narrows the search | 5 | B-tree and access paths; Choose the index family for the operator; Composite, partial and expression indexes; Index-only scans and covering data; Index bloat and REINDEX |
| 16 | EXPLAIN ANALYZE: PostgreSQL’s receipt | 6 | EXPLAIN versus EXPLAIN ANALYZE; Read an execution plan; Planner statistics and estimates; Scan, join, sort and aggregate nodes; Extended statistics for correlated columns; Buffers, cache and repeated measurement |
| 17 | Make it slow. Measure. Fix it. | 1 | A repeatable performance experiment |
| 18 | Where does a row live? | 2 | Pages, buffers and TOAST; Heap, index, TOAST and size accounting |
| 19 | Why VACUUM exists | 3 | Dead tuples and normal VACUUM; Autovacuum, ANALYZE and bloat; Freeze and transaction ID wraparound |
| 20 | WAL lets PostgreSQL recover | 3 | WAL, checkpoints and crash recovery; Backups and PITR; Recovery objectives and restore rehearsal |
| 21 | Primary → replicas | 3 | Physical and logical replication; Replication slots and WAL retention; Logical replication and change streams |
| 22 | Connection pooling controls concurrency | 2 | Why a pool exists; Pool sizing is a queueing problem |
| 23 | Partitioning lets PostgreSQL skip data | 2 | Partition pruning and maintenance; Partition lifecycle and pruning proof |
| 24 | Partitioning ≠ sharding | 2 | From one database to many; Choosing a shard key |
| 25 | Self-host, serverless Postgres, or managed RDS? | 2 | Serverless versus managed instance versus self-host; Choose hosting and size from evidence |
| 26 | Roles, grants and RLS protect rows | 3 | Roles, GRANT and schemas; Roles, grants and RLS; SECURITY DEFINER and view boundaries |
| 27 | Views and materialized views are different | 3 | View versus materialized view; Functions and triggers; Refresh cost and concurrent readers |
| 28 | What Supabase builds around PostgreSQL | 5 | Why Supabase can expose PostgreSQL to an app; What Supabase builds on PostgreSQL; Direct client access and RLS; Auth, API and RLS end to end; Realtime, Storage and Edge Functions are distinct services |
| 29 | Extensions add database capabilities | 2 | Extensions and operational control; Extensions as production dependencies |
| 30 | JSONB and text search | 3 | Relational columns, JSONB and text search; JSONB indexing and field ownership; Full-text and trigram search solve different questions |
| 31 | What is an embedding? | 1 | What an embedding is |
| 32 | pgvector adds vector search | 3 | Exact vector search and approximate indexes; Hybrid retrieval; HNSW versus IVFFlat as an operational choice |
| 33 | RAG retrieves evidence before answering | 3 | RAG as visible evidence flow; Failure modes of AI retrieval; RAG evaluation and tenant safety |
| 34 | Scale the bottleneck you measure | 4 | Operate by SLO and bottleneck; Application query patterns; Safe schema evolution; Observe the database, not just CPU |
| 35 | One request. One database. Many guarantees. | 1 | Capstone: explain one request end to end |
