# PostgreSQL in the Age of AI — zero-to-hero guide

This is the full study route behind the **35-screen, 45-minute** talk. It contains **96 original lessons** in dependency order, including 17 guided experiments, followed by 20 exercises in the interactive deck. Follow one lesson at a time: read the model, inspect the mechanism, type the example into a disposable PostgreSQL database when its referenced tables exist, then explain the production decision and common mistake in your own words. Examples are teaching fragments; some require tables introduced in earlier lessons.

The main presentation stays concise. The interactive **Study path** reader exposes these lessons, SQL/commands and primary references on every screen.

## Prepare a disposable study database

The small schema in `demo/study-schema.sql` supplies agencies, donors, users, accounts, orders, donations, events and documents for the worked SQL. Keep it separate from production and from the optional million-row performance lab.

```bash
createdb learning
psql -d learning -f demo/study-schema.sql
psql -d learning
```

In each new `psql` session, run `SET search_path TO study, public;` before the unqualified lesson queries. Use `\dt` to inspect the tables. `createdb` and `psql` use your normal PostgreSQL connection environment variables. Examples that create objects or mutate rows should be run in this disposable database; some examples are conceptual or require optional extensions.

## 1. PostgreSQL in the Age of AI

**Talk focus:** From a single SQL query to a production data system and an AI answer.

### 1.1 The whole data journey

**What it means.** A database is a running system that turns requests into durable, queryable state. A table is only one part of it.

**How it works.** A client connects; PostgreSQL parses and plans SQL, executes it against pages and indexes, checks transaction visibility, and may log a write before acknowledging commit.

**Example**

```sql
SELECT current_database(), current_user, version();
```

**Production decision.** For each architecture box, ask what guarantee it gives and which resource it consumes.

**Common mistake.** An attractive architecture diagram is not evidence that its latency, consistency or recovery behavior is correct.

**Primary source:** https://www.postgresql.org/docs/current/tutorial.html

## 2. When should you choose PostgreSQL?

**Talk focus:** Choose it when relationships, constraints, SQL and reliable transactions matter; measure when a specialized store is a better fit.

### 2.1 Why a database exists

**What it means.** A file stores bytes. A database adds a data model, concurrent access, constraints, queries, recovery and operational tools.

**How it works.** PostgreSQL coordinates transactions and uses WAL to recover committed changes. SQL constraints protect data even when several services write to it.

**Example**

```sql
CREATE TABLE orders (id bigint PRIMARY KEY, total numeric(12,2) CHECK (total >= 0));
```

**Production decision.** Choose PostgreSQL when related entities, reliable writes and flexible querying are central. A cache, object store, warehouse or search system can complement it.

**Common mistake.** Choosing by popularity alone ignores access patterns, latency targets and team operations.

**Primary source:** https://www.postgresql.org/docs/current/intro-whatis.html

### 2.2 PostgreSQL versus other data systems

**What it means.** Choose by the shape of data and the guarantees you need. PostgreSQL is a strong default when joins, constraints and transactions are central; another engine may be a better primary store for a different workload.

**How it works.** Compare candidates on consistency needs, query flexibility, indexing, development skill, managed options, migration cost and operational risk. A document model can suit document-first access; a columnar warehouse suits large analytical scans; a cache suits short-lived repeat reads.

**Example**

```sql
-- Write the important access patterns before selecting a database.
-- Example: fetch a tenant order, join its lines, update stock atomically.
```

**Production decision.** Run a small workload test and describe why each alternative wins or loses for that workload. Multiple systems are useful only if synchronization and operations are justified.

**Common mistake.** A product label such as “NoSQL” does not tell you its transaction, query or scaling behavior.

**Primary source:** https://www.postgresql.org/docs/current/intro-whatis.html

### 2.3 Choosing PostgreSQL honestly

**What it means.** PostgreSQL is an open-source relational database with JSON, text search and extension support. It is a strong general-purpose choice, not a promise to fit every workload.

**How it works.** Compare transactional throughput, joins, query flexibility, data volume, isolation needs, operational model and specialized search or analytics requirements.

**Example**

```sql
SELECT * FROM pg_available_extensions LIMIT 10;
```

**Production decision.** Start with workload tests. Keep a separate system when it solves a measured limitation rather than duplicating data by default.

**Common mistake.** “SQL versus NoSQL” is not a single feature comparison; products differ in consistency, query model and operations.

**Primary source:** https://www.postgresql.org/docs/current/intro-whatis.html

## 3. Your API server is not your database

**Talk focus:** The API runs application code. PostgreSQL is a separate server process with its own CPU, RAM, storage and connections.

### 3.1 API process versus database process

**What it means.** The API server handles HTTP and application rules. PostgreSQL runs its own server processes and owns the data files. Both consume CPU and RAM on whichever host runs them.

**How it works.** A query travels over a connection. PostgreSQL backends perform query work; shared buffers cache pages; the operating system and storage serve misses. WAL and table/index files occupy disk.

**Example**

```sql
SELECT pid, state, wait_event_type FROM pg_stat_activity;
```

**Production decision.** Measure API CPU and DB CPU separately. A busy API cannot be fixed by adding a database index; a saturated DB is not fixed by adding API replicas.

**Common mistake.** “The database is inside the API server” is only a deployment possibility, not the architecture.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-arch.html

## 4. PostgreSQL in one picture

**Talk focus:** A request crosses connection handling, parsing, planning, execution, memory and storage.

### 4.1 What happens to a SELECT

**What it means.** SQL describes a result. PostgreSQL chooses physical operators to obtain it.

**How it works.** Parsing checks syntax; analysis resolves names and types; rewriting can expand views; planning estimates paths; execution runs scans, joins and sorts. Shared buffers may supply cached pages.

**Example**

```sql
EXPLAIN (VERBOSE, COSTS) SELECT * FROM users WHERE id = 42;
```

**Production decision.** A query plan is an explanation of chosen work, not a fixed property of the SQL text. Plans can change with data and statistics.

**Common mistake.** The planner cost is not milliseconds; it is a relative estimate.

**Primary source:** https://www.postgresql.org/docs/current/using-explain.html

### 4.2 Connection and process lifecycle

**What it means.** A session is a long-lived connection. A transaction is a bounded unit of work inside a session. A query is one statement.

**How it works.** A client authenticates, establishes a backend session, submits statements and eventually disconnects. Too many sessions can consume memory even while idle.

**Example**

```sql
SELECT state, count(*) FROM pg_stat_activity GROUP BY state;
```

**Production decision.** Bound concurrent work with application pools or PgBouncer and watch wait time as well as active sessions.

**Common mistake.** Treating connections as free encourages exhaustion under request bursts.

**Primary source:** https://www.postgresql.org/docs/current/runtime-config-connection.html

## 5. From PostgreSQL server to your first row

**Talk focus:** Start the server, create a database, connect, create a schema and table, then insert and query a row.

### 5.1 Create your own database

**What it means.** A PostgreSQL server cluster holds databases; each database holds schemas; schemas organize tables, views and functions.

**How it works.** Start PostgreSQL, connect with psql, create a database, reconnect to it, then create schema objects. CREATE DATABASE requires sufficient privilege and is run outside a transaction block.

**Walk through it.** What changes when you create a database? The server remains the same process; its cluster gains another named database.

1. Connect to the running PostgreSQL server with psql.
2. Run CREATE DATABASE learning while connected to a different database.
3. Reconnect with psql -d learning; create schema app and a table.
4. Insert one row, then query it and inspect the schema with \dt.

**Observe.** current_database() returns learning only after reconnecting. app is a schema inside learning; it is not another server.

**Decision.** Keep schema creation in migrations after the first experiment.

**Example**

```sql
CREATE DATABASE learning;
-- reconnect: psql -d learning
CREATE SCHEMA app;
CREATE TABLE app.users (id bigint PRIMARY KEY, name text NOT NULL);
INSERT INTO app.users VALUES (1, 'Atif');
```

**Production decision.** Keep schema definitions in migration files so development, test and production can reproduce them.

**Common mistake.** A schema is not a separate database, and creating a table does not start a PostgreSQL server.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-createdb.html

### 5.2 First psql habits

**What it means.** psql is a client, not the database server. Its backslash commands inspect your environment.

**How it works.** Use connection information to confirm the target database before edits. Describe tables and list schemas to discover what exists.

**Example**

```sql
\conninfo
\l
\dn
\dt app.*
\d app.users
```

**Production decision.** Before modifying data, confirm the database, schema and role. Run dangerous edits in an explicit transaction you can inspect before COMMIT.

**Common mistake.** A missing semicolon makes psql wait for more SQL; a wrong connection can affect the wrong database.

**Primary source:** https://www.postgresql.org/docs/current/app-psql.html

### 5.3 Install locally, use a container, or use a service

**What it means.** PostgreSQL is open-source server software. You can run it on a laptop or VM, in a container, or through a managed provider; psql connects to any of them.

**How it works.** The data directory and WAL must persist independently of an application process. A disposable container without a persistent volume loses its database when removed. Managed services still leave schema, access and query design to you.

**Example**

```sql
psql -h localhost -U postgres -d learning
SELECT current_database(), current_user;
```

**Production decision.** For learning, choose a disposable setup you can reset. For production, define backups, upgrades, network access and ownership before importing real data.

**Common mistake.** A container image is not a backup and a GUI connection is not the PostgreSQL server.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-start.html

### 5.4 Schema changes are code

**What it means.** Creating a database once by hand is easy; keeping test and production identical requires ordered migrations.

**How it works.** A migration is versioned SQL applied once. Keep the application compatible while a new column is added and old rows are backfilled. Large DDL may wait on locks even when the statement itself is quick.

**Example**

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name text;
-- Backfill in batches before enforcing NOT NULL.
```

**Production decision.** Review migration lock level and table size. Rehearse against realistic data and record a rollback or forward-fix plan.

**Common mistake.** GUI-only schema edits cannot be reviewed, reproduced or reliably replayed in another environment.

**Primary source:** https://www.postgresql.org/docs/current/ddl-alter.html

## 6. Database → schema → table → row → column

**Talk focus:** A column is one named, typed field; a row (tuple) is one record; a table groups rows of the same shape.

### 6.1 Table, row, column and physical tuple

**What it means.** A table has named typed columns. Each row is one logical record. In relational language row means tuple; in PostgreSQL storage a heap tuple is a physical row version.

**How it works.** Constraints such as PRIMARY KEY, UNIQUE, NOT NULL, CHECK and FOREIGN KEY enforce data rules. PostgreSQL can store several physical versions of one logical row after updates.

**Walk through it.** What is the difference between a logical row and a stored tuple version?

1. SELECT id,name FROM users WHERE id=1.
2. UPDATE users SET name='Atif Updated' WHERE id=1.
3. Query the same row again and inspect xmin with SELECT xmin,id,name FROM users WHERE id=1.

**Observe.** The logical user is still id 1. PostgreSQL can store a newer physical version and make it visible after commit.

**Decision.** Use a primary key for logical identity; do not use xmin as an application ID.

**Example**

```sql
CREATE TABLE customers (id bigint PRIMARY KEY, email text NOT NULL UNIQUE, joined_at timestamptz NOT NULL DEFAULT now());
```

**Production decision.** Pick types and constraints that match the domain. Database constraints protect all writers, including scripts and future services.

**Common mistake.** A table is not merely a spreadsheet: rows have identity rules, concurrent visibility and transactional updates.

**Primary source:** https://www.postgresql.org/docs/current/ddl-basics.html

### 6.2 Types, NULL and time

**What it means.** Types define valid values and operations; NULL means unknown or absent, not zero or empty text.

**How it works.** Use bigint or identity keys as needed, numeric for exact money, text for strings, boolean for flags, timestamptz for instants, and JSONB for flexible documents. SQL uses three-valued logic with NULL.

**Walk through it.** What does SQL do with unknown?

1. Run SELECT NULL = NULL and observe NULL, not true.
2. Run SELECT NULL IS NULL and observe true.
3. Compare now() with now() AT TIME ZONE 'UTC'.

**Observe.** NULL participates in three-valued logic. timestamptz represents an instant and is displayed in a session time zone.

**Decision.** Use IS NULL for missing values and store real instants with timestamptz.

**Example**

```sql
SELECT NULL = NULL AS unknown, NULL IS NULL AS true_check;
SELECT now() AT TIME ZONE 'UTC';
```

**Production decision.** Use explicit time zones and domain checks. Prefer structured columns for stable fields and relationships.

**Common mistake.** `WHERE column = NULL` never tests for missing values; use `IS NULL`. Floating point is usually unsuitable for exact currency.

**Primary source:** https://www.postgresql.org/docs/current/datatype.html

### 6.3 Identity, UUID and sequence behavior

**What it means.** An identity column asks PostgreSQL to generate keys. UUIDs are useful when IDs must be generated across services or before a database round trip.

**How it works.** Identity uses a sequence. Sequence values are not rolled back, so gaps after failed transactions are normal. Key choice affects index size and insertion pattern.

**Example**

```sql
CREATE TABLE invoices (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, amount numeric(12,2) NOT NULL);
```

**Production decision.** Choose keys for uniqueness, exposure and write pattern. Treat IDs as identifiers, never as a count of rows.

**Common mistake.** A missing sequence number is not evidence that a row was deleted.

**Primary source:** https://www.postgresql.org/docs/current/ddl-identity-columns.html

### 6.4 Status values and domain rules

**What it means.** An enum, CHECK constraint and lookup table all restrict values, but they support different change patterns.

**How it works.** A CHECK is simple for a short list. An enum is a dedicated type with an evolution process. A lookup table supports labels, ordering and metadata and can be managed as rows.

**Example**

```sql
CREATE TABLE jobs (id bigint PRIMARY KEY, status text NOT NULL CHECK (status IN ('queued','running','done')));
```

**Production decision.** Pick the form based on how often statuses change and whether statuses carry data. Keep the database rule aligned with API validation.

**Common mistake.** A plain text status without a constraint allows misspellings from every writer.

**Primary source:** https://www.postgresql.org/docs/current/ddl-constraints.html

### 6.5 Arrays and ranges have specific jobs

**What it means.** Arrays store a small collection in one column; range types represent intervals. Neither replaces every relational table.

**How it works.** An array element cannot be the target of a normal foreign key. A range can express overlap and, with an exclusion constraint, prevent double bookings atomically.

**Example**

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE bookings (room_id int, during tstzrange, EXCLUDE USING gist (room_id WITH =, during WITH &&));
```

**Production decision.** Use a join table when array items need attributes, ownership or their own FKs. Use ranges when overlap is part of the invariant.

**Common mistake.** A boolean “available” check in the API can race with another booking unless the database enforces the invariant.

**Primary source:** https://www.postgresql.org/docs/current/rangetypes.html

## 7. A relation is a mathematical idea, not an FK line

**Talk focus:** In the relational model, a relation is a set of tuples with named attributes. A SQL table is its practical counterpart.

### 7.1 Mathematical relation versus relationship

**What it means.** A relation is a set of tuples described by attributes. A foreign-key relationship is a separate integrity rule between table values.

**How it works.** A SQL table is the practical counterpart of a relation but can contain duplicate rows and NULL. A JOIN matches row values at query time; an FK checks that a referenced value is allowed.

**Walk through it.** Does a foreign key create a shortcut to related rows?

1. Inspect donors.agency_id and agencies.id.
2. Try INSERT INTO donors(id,agency_id,name) VALUES (99,999,'No Agency').
3. See the foreign-key violation; then run a JOIN to retrieve names.
4. EXPLAIN the JOIN and inspect whether an index participates.

**Observe.** The constraint rejects invalid references. The JOIN is a separate read operation and planner choice.

**Decision.** Keep FKs for integrity and add indexes for measured access patterns.

**Example**

```sql
CREATE TABLE agencies (id bigint PRIMARY KEY);
CREATE TABLE donors (id bigint PRIMARY KEY, agency_id bigint REFERENCES agencies(id));
```

**Production decision.** Use FKs to preserve integrity, and indexes when query patterns or parent-row updates justify them.

**Common mistake.** An FK does not store a pointer, perform the JOIN, or automatically index the referencing column.

**Primary source:** https://www.postgresql.org/docs/current/ddl-constraints.html

## 8. Relationships make data useful

**Talk focus:** A primary key identifies a row. A foreign key checks that a value refers to an allowed row in another table.

### 8.1 Model one-to-many and many-to-many

**What it means.** One-to-many places the FK on the many side. Many-to-many uses a bridge table. One-to-one uses a UNIQUE FK.

**How it works.** A normalized model stores a fact once and joins it where needed; denormalization can be deliberate for measured reads but creates synchronization work.

**Example**

```sql
CREATE TABLE enrollments (student_id bigint REFERENCES students(id), course_id bigint REFERENCES courses(id), PRIMARY KEY(student_id,course_id));
```

**Production decision.** Decide ON DELETE behavior for each relationship and test the volume of affected rows.

**Common mistake.** CASCADE can delete far more rows than the visible parent, holding locks and generating WAL.

**Primary source:** https://www.postgresql.org/docs/current/ddl-constraints.html

### 8.2 JOINs and missing matches

**What it means.** INNER JOIN keeps matching pairs; LEFT JOIN keeps all left rows and uses NULL for a missing right match.

**How it works.** The ON clause defines matching values. Filters in WHERE can remove NULL-extended rows from an outer join, changing the result.

**Walk through it.** Which agencies survive when they have no donor?

1. Run the LEFT JOIN in the lesson against the study schema.
2. Find East, which has no donor, in the result.
3. Move a donor filter from ON to WHERE and compare results.

**Observe.** East remains with NULL donor fields in a LEFT JOIN. A WHERE filter on the right table can remove that NULL-extended row.

**Decision.** Write and test outer-join filters deliberately.

**Example**

```sql
SELECT a.id, d.id FROM agencies a LEFT JOIN donors d ON d.agency_id = a.id;
```

**Production decision.** Check cardinality: a one-to-many JOIN can multiply rows before GROUP BY or LIMIT.

**Common mistake.** A JOIN does not become fast merely because an FK exists; indexes and selectivity matter.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-join.html

### 8.3 Normalize facts before duplicating them

**What it means.** Normalization asks where each fact belongs. A customer name belongs to the customer; an order points to the customer instead of copying the name into every row.

**How it works.** Duplicating mutable facts creates update anomalies. Deliberate denormalization is a measured read optimization and needs a refresh rule.

**Example**

```sql
SELECT o.id,u.name FROM orders o JOIN users u ON u.id=o.user_id;
```

**Production decision.** Begin with clear ownership and keys. Duplicate only when a query or availability requirement justifies its synchronization cost.

**Common mistake.** A faster-looking flat table can become incorrect when one copy changes and another does not.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-fk.html

### 8.4 Foreign keys and delete actions

**What it means.** ON DELETE RESTRICT/NO ACTION, SET NULL and CASCADE express different domain behavior. A cascade can touch many more rows than the parent delete suggests.

**How it works.** FK checks preserve references inside transactions. Referencing columns are not automatically indexed; a parent delete or update may need to inspect referencing rows.

**Example**

```sql
SELECT conname,confdeltype FROM pg_constraint WHERE contype='f';
```

**Production decision.** Choose delete behavior from business meaning. Inspect child cardinality and index common FK paths.

**Common mistake.** A cascade is not merely convenient cleanup; it can generate large WAL and hold locks for a long time.

**Primary source:** https://www.postgresql.org/docs/current/ddl-constraints.html

## 9. What happens when we run SQL?

**Talk focus:** PostgreSQL turns text into a plan, then the executor visits the needed pages and returns rows.

### 9.1 Read SELECT in logical order

**What it means.** Written SQL starts with SELECT; reasoning about rows starts with FROM and JOIN, then WHERE, GROUP BY, HAVING, SELECT, ORDER BY and LIMIT.

**How it works.** WHERE filters input rows before grouping; HAVING filters groups. An alias created in SELECT generally cannot be used in WHERE of the same level.

**Walk through it.** Why can HAVING use count(*) while WHERE cannot?

1. Filter active donor rows with WHERE.
2. Group the remaining rows by agency_id.
3. Filter grouped counts with HAVING and order the output.

**Observe.** WHERE acts on individual input rows; HAVING sees completed groups. SELECT then shapes the displayed columns.

**Decision.** Check intermediate row counts when a long query surprises you.

**Example**

```sql
SELECT agency_id, count(*) AS donors
FROM donors
WHERE active
GROUP BY agency_id
HAVING count(*) >= 5
ORDER BY donors DESC;
```

**Production decision.** Confirm a query returns the right rows before optimizing it. Avoid SELECT * when you need only a few columns.

**Common mistake.** A row count after a JOIN can differ from the source table count.

**Primary source:** https://www.postgresql.org/docs/current/sql-select.html

### 9.2 Subqueries and CTEs

**What it means.** A subquery is a query inside another query. A common table expression (WITH) gives a named intermediate result, making multi-step logic easier to read.

**How it works.** A correlated subquery depends on values from the outer row; an uncorrelated one can stand alone. PostgreSQL may inline or materialize a CTE depending on semantics and planner choice, so inspect EXPLAIN instead of assuming it is a cache.

**Example**

```sql
WITH donor_totals AS (
  SELECT agency_id,count(*) AS n FROM donors GROUP BY agency_id
)
SELECT a.id,coalesce(t.n,0) FROM agencies a
LEFT JOIN donor_totals t ON t.agency_id=a.id;
```

**Production decision.** Use a CTE for clarity or reuse inside a statement, then check whether its plan performs well on representative data.

**Common mistake.** Nested SQL is not automatically slow, and a CTE does not automatically materialize or improve performance.

**Primary source:** https://www.postgresql.org/docs/current/queries-with.html

### 9.3 Aggregation and windows

**What it means.** GROUP BY collapses rows into groups. Window functions calculate across a partition while retaining individual rows.

**How it works.** A CTE names a subquery; it improves structure but is not automatically a performance optimization. A window ORDER BY and frame affect cumulative results.

**Example**

```sql
SELECT id, agency_id, amount,
       row_number() OVER (PARTITION BY agency_id ORDER BY amount DESC) AS rank_in_agency
FROM donations;
```

**Production decision.** Use windows for rankings and running totals; use GROUP BY for one row per group. Inspect the plan if sorting is costly.

**Common mistake.** A window function cannot be used directly in WHERE; wrap it in a subquery or CTE.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-window.html

### 9.4 Recursive CTEs for hierarchies

**What it means.** A recursive WITH query starts with an anchor and repeatedly expands reachable rows until no new rows are produced.

**How it works.** This fits organization trees, category paths and dependency graphs. Guard against cycles and excessive depth; request an explicit order when presentation order matters.

**Example**

```sql
WITH RECURSIVE tree AS (
  SELECT id,parent_id,1 AS depth FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id,c.parent_id,t.depth+1 FROM categories c JOIN tree t ON c.parent_id=t.id
) SELECT * FROM tree;
```

**Production decision.** Choose a max depth or cycle strategy for arbitrary user-defined graphs. Test on deep and broad trees.

**Common mistake.** The order rows happen to emerge is not a stable hierarchy display order without ORDER BY.

**Primary source:** https://www.postgresql.org/docs/current/queries-with.html

## 10. What happens during INSERT?

**Talk focus:** A write creates a new tuple and WAL records the change before commit is acknowledged as durable.

### 10.1 A write before disk flush

**What it means.** PostgreSQL changes shared buffers and records WAL so committed changes can survive a crash before every modified heap page is flushed.

**How it works.** The INSERT travels through parsing, planning/execution, constraints, tuple insertion, WAL generation and commit acknowledgement. Dirty data pages can be written later.

**Example**

```sql
BEGIN; INSERT INTO events(id) VALUES (1); COMMIT;
```

**Production decision.** Distinguish transaction commit latency from later checkpoint and background I/O.

**Common mistake.** WAL is not simply “a second copy of the table”; it records changes for recovery.

**Primary source:** https://www.postgresql.org/docs/current/wal-intro.html

### 10.2 Write, change and return rows

**What it means.** INSERT, UPDATE and DELETE are statements that run within transactions. RETURNING exposes affected rows without a second read.

**How it works.** ON CONFLICT uses a unique constraint or unique index to define the conflict. COPY or batched INSERT suits bulk loading better than a network round trip per row.

**Example**

```sql
INSERT INTO users(id,email) VALUES (1,'a@example.test')
ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email
RETURNING id,email;
```

**Production decision.** For high-volume changes, batch work and watch WAL, lock duration, index maintenance and autovacuum.

**Common mistake.** UPDATE or DELETE without a WHERE clause affects all qualifying rows. Check the target and affected count.

**Primary source:** https://www.postgresql.org/docs/current/dml.html

### 10.3 COPY and bulk loading

**What it means.** One INSERT per row across a network repeats parsing and round-trip overhead. COPY streams many rows efficiently into a table.

**How it works.** Bulk import still checks constraints and writes WAL. Indexes and triggers add work; a staging table lets you validate and transform before merging into the final schema.

**Example**

```sql
\copy study.donors(id,agency_id,name,active) FROM 'donors.csv' CSV HEADER
```

**Production decision.** Use a disposable staging table and count rejects. Compare elapsed time and WAL/disk demand rather than relying on a fixed rows-per-second claim.

**Common mistake.** Dropping all production constraints to load faster can admit invalid data that is hard to repair later.

**Primary source:** https://www.postgresql.org/docs/current/sql-copy.html

### 10.4 Soft delete versus real delete

**What it means.** A soft delete keeps a row and marks it inactive. It helps some restore or audit workflows but changes every read and uniqueness rule.

**How it works.** Real DELETE creates obsolete tuple versions and VACUUM later reuses eligible space. Soft-deleted rows remain live and require filters, retention rules and often partial unique indexes.

**Example**

```sql
CREATE TABLE contacts (id bigint PRIMARY KEY, tenant_id bigint, email text, deleted_at timestamptz);
CREATE UNIQUE INDEX contacts_active_email ON contacts(tenant_id,email) WHERE deleted_at IS NULL;
```

**Production decision.** Choose soft delete only when the product needs recoverability or history. Define retention and privacy deletion separately.

**Common mistake.** A forgotten WHERE deleted_at IS NULL can expose records believed to be deleted.

**Primary source:** https://www.postgresql.org/docs/current/indexes-partial.html

## 11. A transaction keeps changes together

**Talk focus:** Move ₹2,000 between accounts. Either both updates commit or neither does.

### 11.1 ACID is four different guarantees

**What it means.** Atomicity groups changes; consistency depends on declared rules and correct application logic; isolation controls concurrent observations; durability protects committed state.

**How it works.** BEGIN opens a transaction. COMMIT makes its changes durable and visible to suitable future snapshots. ROLLBACK abandons them. Savepoints allow partial rollback within one transaction.

**Walk through it.** Can one side of a transfer commit alone?

1. BEGIN; update account 1 and account 2.
2. SELECT both balances before COMMIT in the same session.
3. ROLLBACK; query again in a new statement.
4. Repeat and COMMIT; query from a second session.

**Observe.** ROLLBACK abandons both changes. COMMIT makes both updates visible to a later suitable snapshot. Isolation still needs thought for concurrent transfers.

**Decision.** Keep the whole business invariant inside one transaction and test concurrent execution.

**Example**

```sql
BEGIN;
UPDATE accounts SET balance=balance-2000 WHERE id=1;
UPDATE accounts SET balance=balance+2000 WHERE id=2;
COMMIT;
```

**Production decision.** Check invariant conditions and concurrent access; one transaction alone does not eliminate every race.

**Common mistake.** “The database guarantees business consistency” overstates ACID if the business invariant is not encoded or checked.

**Primary source:** https://www.postgresql.org/docs/current/tutorial-transactions.html

### 11.2 Isolation levels and anomalies

**What it means.** READ COMMITTED gives each statement a fresh snapshot. REPEATABLE READ keeps a transaction snapshot. SERIALIZABLE aims for an outcome equivalent to some serial order.

**How it works.** Higher isolation can detect conflicts and require application retries. Row locks can protect a read-modify-write sequence when appropriate.

**Example**

```sql
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- perform related reads and writes
COMMIT;
```

**Production decision.** Choose the weakest isolation that preserves the actual invariant, then test concurrent cases and retry transient serialization failures.

**Common mistake.** Isolation does not mean “no waiting”; writers may still block or deadlock.

**Primary source:** https://www.postgresql.org/docs/current/transaction-iso.html

### 11.3 Savepoints and partial rollback

**What it means.** A savepoint marks a point inside a transaction. ROLLBACK TO abandons later work while the outer transaction remains open.

**How it works.** This can recover from a specific statement error without losing earlier valid work, but every operation is still part of one overall commit or rollback.

**Example**

```sql
BEGIN; SAVEPOINT before_optional;
-- optional statement
ROLLBACK TO before_optional; COMMIT;
```

**Production decision.** Use savepoints for bounded optional work, not as a substitute for clear transaction boundaries.

**Common mistake.** A savepoint does not make a long transaction cheap; locks and old snapshots can remain until outer COMMIT.

**Primary source:** https://www.postgresql.org/docs/current/sql-savepoint.html

### 11.4 Idempotency for retried writes

**What it means.** Networks fail between a successful commit and the client receiving the reply. A retry can repeat the business action.

**How it works.** A unique idempotency key lets the database reject or return the prior result for the same logical request. The key and business write should commit in one transaction.

**Example**

```sql
CREATE TABLE request_keys (key text PRIMARY KEY, result_id bigint);
INSERT INTO request_keys VALUES ($1,$2) ON CONFLICT (key) DO NOTHING;
```

**Production decision.** Design retries for deadlocks, serialization failures and network ambiguity. Test duplicate submission.

**Common mistake.** A transaction makes its own operations atomic; it does not prevent the caller from submitting the whole transaction twice.

**Primary source:** https://www.postgresql.org/docs/current/sql-insert.html

## 12. Who reads, who waits, and who sees the new version?

**Talk focus:** T1 updates a row and holds its row lock. T2 tries to update that same row and waits. A normal reader can still see a suitable committed version.

### 12.1 Two writers and one reader

**What it means.** Two UPDATEs of the same row conflict. A normal SELECT can usually read a committed version without waiting for that row lock.

**How it works.** T1 updates and retains a row-level lock until it ends. T2 waits, then rechecks the row. Under READ COMMITTED a new SELECT statement uses a new snapshot.

**Walk through it.** Who waits when three sessions touch the same row?

1. Session A: BEGIN; UPDATE accounts SET balance=9000 WHERE id=1; leave it open.
2. Session B: UPDATE accounts SET balance=8000 WHERE id=1; it waits.
3. Session C: SELECT balance FROM accounts WHERE id=1; it sees the committed version.
4. Session A: COMMIT; observe B complete, then read again.

**Observe.** B waits for A’s row lock. A plain snapshot read in C normally uses a committed row version. Waiting time depends on when A ends.

**Decision.** Inspect wait_event_type and transaction age before changing pool size or query syntax.

**Example**

```sql
SELECT pid,state,wait_event_type,wait_event,now()-xact_start AS transaction_age
FROM pg_stat_activity WHERE xact_start IS NOT NULL;
```

**Production decision.** Keep transactions short and measure lock waits and transaction age. The duration depends on workload and application behavior; there is no universal “usual transaction time.”

**Common mistake.** A plain SELECT and SELECT FOR UPDATE have different locking behavior.

**Primary source:** https://www.postgresql.org/docs/current/explicit-locking.html

### 12.2 Deadlocks and safe retries

**What it means.** A deadlock is a cycle: T1 holds A and wants B while T2 holds B and wants A. PostgreSQL aborts one transaction to break it.

**How it works.** Consistent lock ordering reduces deadlocks; it does not remove every possible conflict. The application must recognize retryable errors.

**Example**

```sql
-- Both transfer paths should lock accounts in the same id order.
SELECT id FROM accounts WHERE id IN (1,2) ORDER BY id FOR UPDATE;
```

**Production decision.** Retry the whole transaction only when the operation is safe to retry, using idempotency where needed.

**Common mistake.** A timeout alone does not tell you which statement caused the blocking chain.

**Primary source:** https://www.postgresql.org/docs/current/explicit-locking.html

### 12.3 Lock queues and timeouts

**What it means.** A waiting DDL statement can create a queue behind it. Row lock contention can make a fast query appear slow because it spends time waiting.

**How it works.** pg_stat_activity exposes wait_event_type and transaction age. pg_blocking_pids identifies blockers. lock_timeout bounds waiting to acquire a lock; statement_timeout bounds total statement duration.

**Example**

```sql
SELECT pid,pg_blocking_pids(pid),wait_event_type,now()-query_start AS age
FROM pg_stat_activity WHERE wait_event_type='Lock';
```

**Production decision.** Use timeouts that match the operation and inspect the blocker before killing sessions. Keep transactions short.

**Common mistake.** Reducing query execution time will not fix an application that holds locks while waiting on a user or remote API.

**Primary source:** https://www.postgresql.org/docs/current/explicit-locking.html

## 13. MVCC: readers see a snapshot

**Talk focus:** An update creates a new row version. Existing readers can continue using a version visible to their snapshot.

### 13.1 Tuple versions and snapshots

**What it means.** An UPDATE normally creates a new physical row version. A snapshot decides which committed version a statement can see.

**How it works.** Tuple headers contain transaction metadata including xmin and xmax. Visibility considers those IDs, transaction status and the active snapshot. Old versions remain while relevant readers might need them.

**Example**

```sql
SELECT xmin,xmax,id,balance FROM accounts WHERE id=1;
```

**Production decision.** Long transactions and idle-in-transaction sessions can delay cleanup. Monitor them when bloat grows.

**Common mistake.** MVCC reduces read/write blocking; it does not mean PostgreSQL has no locks.

**Primary source:** https://www.postgresql.org/docs/current/mvcc-intro.html

### 13.2 HOT updates and visibility map

**What it means.** Some updates can avoid changing indexes when indexed values stay the same and a suitable page has room. This is called HOT.

**How it works.** The visibility map records pages whose tuples are visible to all transactions. VACUUM maintains it; index-only scans can avoid heap visits when the map says a page is all-visible.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT id FROM users WHERE id=1;
```

**Production decision.** Leave sensible fillfactor only after measuring update-heavy tables. Check heap fetches for index-only scans.

**Common mistake.** “Index-only” does not promise zero heap reads; visibility checks may still need the heap.

**Primary source:** https://www.postgresql.org/docs/current/indexes-index-only-scans.html

## 14. The same query gets expensive

**Talk focus:** As row count grows, a full table scan examines more data even when the result stays one row.

### 14.1 Why data growth changes the plan

**What it means.** One returned row may require examining many rows or pages. Selectivity, row width, cache state and statistics determine cost.

**How it works.** Sequential scans are efficient when much of a table is needed. Index lookups help selective predicates but can add random heap fetches. The planner compares alternatives.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM demo_users WHERE email='user500000@example.test';
```

**Production decision.** Capture the exact query and representative data before changing schema. Compare actual time, rows and buffers.

**Common mistake.** A Seq Scan is not inherently bad; it can be the cheapest path.

**Primary source:** https://www.postgresql.org/docs/current/using-explain.html

## 15. An index narrows the search

**Talk focus:** A B-tree is another structure that helps locate candidate rows; it costs space and write work.

### 15.1 B-tree and access paths

**What it means.** An index is a second structure that maps keys toward rows. PostgreSQL can still prefer a sequential scan, bitmap scan or index-only scan.

**How it works.** B-tree handles equality and ranges. Composite indexes depend on leading keys and query order. Partial and expression indexes represent narrower predicates. Index-only scans need suitable index data and visibility information.

**Example**

```sql
CREATE INDEX ON users (tenant_id, created_at DESC);
CREATE INDEX ON users (lower(email));
```

**Production decision.** Index high-value query patterns, then account for extra write cost, storage and maintenance.

**Common mistake.** Adding every possible index can make writes slower and enlarge backups.

**Primary source:** https://www.postgresql.org/docs/current/indexes.html

### 15.2 Choose the index family for the operator

**What it means.** GIN is useful for inverted search such as JSONB containment and full text; BRIN summarizes ranges; pg_trgm can support substring-like matching.

**How it works.** The index must support the actual operator and predicate. A B-tree on a text column does not generally make a leading-wildcard search fast.

**Example**

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX users_name_trgm ON users USING gin (name gin_trgm_ops);
```

**Production decision.** Benchmark with realistic data. BRIN is attractive for very large physically correlated data, not random point lookups.

**Common mistake.** “An index exists” does not mean the planner can use it for the query.

**Primary source:** https://www.postgresql.org/docs/current/indexes-types.html

### 15.3 Composite, partial and expression indexes

**What it means.** An index is useful only when its key order and expression match the query. Composite indexes often favor predicates on leading columns.

**How it works.** Partial indexes omit rows outside a predicate. Expression indexes store computed keys such as lower(email). Each design increases write work and requires a query pattern that can use it.

**Example**

```sql
CREATE INDEX users_tenant_joined_idx ON users(tenant_id,joined_at DESC);
CREATE INDEX users_lower_email_idx ON users(lower(email));
```

**Production decision.** Design from the most expensive frequent queries, not from a list of columns. Verify with EXPLAIN and realistic selectivity.

**Common mistake.** An index on email does not generally serve WHERE lower(email)=... unless the expression is indexed.

**Primary source:** https://www.postgresql.org/docs/current/indexes-expressional.html

### 15.4 Index-only scans and covering data

**What it means.** An INCLUDE index can carry extra columns so the index may satisfy a query without reading row data.

**How it works.** This works best when the visibility map marks relevant heap pages all-visible. A frequently updated table may still require many heap fetches. INCLUDE columns enlarge the index.

**Example**

```sql
CREATE INDEX orders_agency_cover ON orders(agency_id) INCLUDE (amount,day);
```

**Production decision.** Compare heap fetches, index size and write cost before adding covering columns.

**Common mistake.** An index-only scan node in EXPLAIN may still show heap fetches.

**Primary source:** https://www.postgresql.org/docs/current/indexes-index-only-scans.html

### 15.5 Index bloat and REINDEX

**What it means.** Indexes also change and can become inefficient after heavy updates or deletes. Rebuilding is an operational action with lock and resource implications.

**How it works.** REINDEX CONCURRENTLY can reduce blocking for supported relations but still consumes I/O, disk and time. Invalid indexes can remain after failed concurrent builds.

**Example**

```sql
SELECT indexrelid::regclass,idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan;
```

**Production decision.** Investigate plan use, index size and write pattern before rebuilding. Schedule headroom and verify the replacement.

**Common mistake.** A low idx_scan count does not prove an index is useless if it protects a rare critical query or constraint.

**Primary source:** https://www.postgresql.org/docs/current/sql-reindex.html

## 16. EXPLAIN ANALYZE: PostgreSQL’s receipt

**Talk focus:** Run the query, inspect its plan tree, then compare estimated rows with actual rows, time, loops and buffers.

### 16.1 Read an execution plan

**What it means.** EXPLAIN shows the chosen tree. ANALYZE executes the SQL and adds actual row counts and timing. BUFFERS adds cache and read activity.

**How it works.** Read child nodes first. Estimate and actual rows reveal cardinality errors. Actual rows are per loop. Rows Removed by Filter is a useful measure of rejected tuples at a scan node; cost units are not milliseconds.

**Walk through it.** Did an index change work or just the label of the plan?

1. Seed the real performance lab before presenting.
2. Run EXPLAIN (ANALYZE, BUFFERS) on the email query.
3. Read Plan Rows, Actual Rows, loops, Rows Removed by Filter and block activity.
4. Create the matching index and rerun the exact SQL.

**Observe.** A selective index often reduces scanned work, but actual timing and plan choice depend on the machine and dataset. Prepared mode shows structure without invented timings.

**Decision.** Compare real measurements and query correctness, not an assumed speedup.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM demo_users WHERE email='user500000@example.test';
```

**Production decision.** Compare the same SQL before and after a change. Use representative data and account for warmed caches.

**Common mistake.** EXPLAIN ANALYZE of UPDATE, DELETE or INSERT really changes data unless wrapped and rolled back.

**Primary source:** https://www.postgresql.org/docs/current/using-explain.html

### 16.2 Planner statistics and estimates

**What it means.** The optimizer estimates selectivity and row counts from table statistics, not by executing every candidate plan.

**How it works.** ANALYZE refreshes stats. Skewed or correlated columns can make simple estimates inaccurate; extended statistics can help some patterns.

**Example**

```sql
ANALYZE demo_users;
SELECT attname,n_distinct FROM pg_stats WHERE tablename='demo_users';
```

**Production decision.** Fix stale or inadequate statistics when estimated and actual rows differ greatly before forcing an access path.

**Common mistake.** A fast execution on one sample does not prove the plan is stable across tenants or parameter values.

**Primary source:** https://www.postgresql.org/docs/current/planner-stats.html

### 16.3 Scan, join, sort and aggregate nodes

**What it means.** A plan is an operator tree: scans produce rows; joins combine them; sorts order them; aggregates reduce or group them.

**How it works.** Nested Loop can be ideal for a small outer input with an indexed inner lookup. Hash Join can suit larger equality joins; Merge Join uses ordered inputs. Look at rows, loops, actual time and buffers together.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT a.id,count(d.id) FROM agencies a LEFT JOIN donors d ON d.agency_id=a.id GROUP BY a.id;
```

**Production decision.** Identify the first expensive or misestimated subtree before changing indexes or SQL.

**Common mistake.** A red-looking node is not automatically the cause; a parent includes work done by children.

**Primary source:** https://www.postgresql.org/docs/current/using-explain.html

### 16.4 Extended statistics for correlated columns

**What it means.** Single-column statistics may misestimate predicates when columns are dependent or share a joint distribution.

**How it works.** CREATE STATISTICS can collect dependencies, most-common-value combinations or distinct counts across columns. ANALYZE populates them. They help some estimates, not every join or expression.

**Example**

```sql
CREATE STATISTICS users_tenant_active_stats (dependencies) ON tenant_id,active FROM users;
ANALYZE users;
```

**Production decision.** Add them only for a demonstrated estimate error on relevant queries. Recheck the plan after ANALYZE.

**Common mistake.** Extended stats are not an index and do not directly make execution faster without changing a plan.

**Primary source:** https://www.postgresql.org/docs/current/planner-stats.html

### 16.5 Buffers, cache and repeated measurement

**What it means.** Shared hit means a block was found in PostgreSQL shared buffers; shared read means it was read into them. Neither number alone explains all CPU or OS cache effects.

**How it works.** A first run and warmed run can differ. Sort or hash nodes may spill to temporary files. Compare query planning and execution times separately.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS, SETTINGS) SELECT * FROM users WHERE email='atif@example.com';
```

**Production decision.** Run representative workloads more than once and record cache state. Interpret timing with rows, loops and I/O.

**Common mistake.** A measured 2 ms result in a warm local cache is not a production latency promise.

**Primary source:** https://www.postgresql.org/docs/current/using-explain.html

## 17. Make it slow. Measure. Fix it.

**Talk focus:** Prepare a real dataset, run the exact query, add one index, and compare actual PostgreSQL plans.

### 17.1 A repeatable performance experiment

**What it means.** Optimization means measure, form a hypothesis, change one thing and measure again.

**How it works.** Seed representative rows, ANALYZE, capture EXPLAIN (ANALYZE, BUFFERS), create a specific index, rerun the exact SQL and compare. Then test a broad predicate where an index may lose.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM demo_users WHERE email='user500000@example.test';
```

**Production decision.** Report machine, dataset size, cache state and plan along with time. Use p95 or repeated runs for production decisions.

**Common mistake.** Prepared diagrams are explanatory; only LIVE mode supplies real execution timing.

**Primary source:** https://www.postgresql.org/docs/current/performance-tips.html

## 18. Where does a row live?

**Talk focus:** Relations are made of pages; pages hold tuple versions. Shared buffers cache pages in memory.

### 18.1 Pages, buffers and TOAST

**What it means.** A relation is stored in pages, normally 8 KB. Pages hold line pointers and physical tuple versions.

**How it works.** Shared buffers cache database pages; the operating system may cache them too. Wide values can be compressed or moved to TOAST storage. Index files are separate relations.

**Example**

```sql
SELECT pg_size_pretty(pg_relation_size('demo_users')), pg_size_pretty(pg_total_relation_size('demo_users'));
```

**Production decision.** Distinguish heap size from total size including indexes and TOAST. Reads can cost CPU even on buffer hits.

**Common mistake.** A row shown as one rectangle is a teaching simplification; real page layout includes headers, item identifiers and free space.

**Primary source:** https://www.postgresql.org/docs/current/storage-page-layout.html

### 18.2 Heap, index, TOAST and size accounting

**What it means.** A table has a main heap; indexes are separate relations. Oversized attributes may use TOAST storage. Total database size includes more than visible row payload.

**How it works.** pg_relation_size measures a relation file; pg_total_relation_size includes its indexes and TOAST. A growing index or TOAST table can explain disk growth even when row count is stable.

**Example**

```sql
SELECT pg_size_pretty(pg_relation_size('users')) AS heap,
       pg_size_pretty(pg_total_relation_size('users')) AS total;
```

**Production decision.** Use storage measurements by object before deciding to VACUUM FULL or add disks.

**Common mistake.** Returning space to PostgreSQL for reuse is different from shrinking files at the operating-system level.

**Primary source:** https://www.postgresql.org/docs/current/storage-toast.html

## 19. Why VACUUM exists

**Talk focus:** UPDATE and DELETE leave obsolete versions. VACUUM reclaims eligible space for reuse.

### 19.1 Dead tuples and normal VACUUM

**What it means.** MVCC leaves older row versions after UPDATE or DELETE. VACUUM reclaims versions that no relevant transaction can see.

**How it works.** Normal VACUUM makes table space reusable, maintains visibility metadata and protects against transaction ID wraparound. It usually does not shrink the file to return space to the OS.

**Walk through it.** Why did the table file not shrink after DELETE?

1. Inspect pg_total_relation_size before changes.
2. Update or delete a group of rows and inspect table statistics.
3. Run VACUUM (ANALYZE), then inspect reusable space and estimates.

**Observe.** Normal VACUUM makes eligible space reusable inside PostgreSQL. It usually does not return the table file’s space to the OS.

**Decision.** Look for long transactions and autovacuum activity before considering a rewrite.

**Example**

```sql
VACUUM (VERBOSE, ANALYZE) demo_users;
```

**Production decision.** Keep autovacuum enabled and watch dead tuples, old snapshots and worker progress.

**Common mistake.** VACUUM FULL rewrites the table and takes a strong lock; it is not normal routine cleanup.

**Primary source:** https://www.postgresql.org/docs/current/routine-vacuuming.html

### 19.2 Autovacuum, ANALYZE and bloat

**What it means.** Autovacuum runs based on table activity thresholds and scale factors. ANALYZE updates planner statistics.

**How it works.** A high-update table can accumulate dead versions faster than cleanup. Long transactions can prevent removal even when workers run. Bloat means extra space relative to useful data.

**Example**

```sql
SELECT relname,n_live_tup,n_dead_tup,last_autovacuum,last_autoanalyze
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC;
```

**Production decision.** Tune per table when measured activity justifies it; investigate blockers before increasing worker aggressiveness.

**Common mistake.** A single n_dead_tup estimate is approximate and may lag the real table state.

**Primary source:** https://www.postgresql.org/docs/current/routine-vacuuming.html

### 19.3 Freeze and transaction ID wraparound

**What it means.** PostgreSQL transaction IDs are finite; old tuple metadata must be maintained so ancient rows stay safely visible as IDs advance.

**How it works.** Autovacuum also performs freezing, not only dead-tuple cleanup. Anti-wraparound vacuum can become urgent even on a table with few updates.

**Example**

```sql
SELECT datname,age(datfrozenxid) FROM pg_database ORDER BY age(datfrozenxid) DESC;
```

**Production decision.** Do not disable autovacuum globally. Monitor age and long-running transactions that block cleanup.

**Common mistake.** A table with few dead tuples can still require vacuum for freeze safety.

**Primary source:** https://www.postgresql.org/docs/current/routine-vacuuming.html

## 20. WAL lets PostgreSQL recover

**Talk focus:** Log records make committed changes recoverable even if dirty data pages were not flushed before a crash.

### 20.1 WAL, checkpoints and crash recovery

**What it means.** PostgreSQL logs changes before the related dirty data pages must be flushed. Recovery can replay logged changes after a crash.

**How it works.** A checkpoint establishes a recovery starting point and moves dirty pages toward storage. The WAL stream also supports physical replication and point-in-time recovery when archived with a base backup.

**Example**

```sql
SELECT pg_current_wal_lsn();
SHOW archive_mode;
```

**Production decision.** Monitor WAL retention and disk. Test restore procedures rather than assuming files imply a recoverable backup.

**Common mistake.** Replication is not a backup: it can reproduce accidental deletes and corruption.

**Primary source:** https://www.postgresql.org/docs/current/wal-intro.html

### 20.2 Backups and PITR

**What it means.** A backup lets you reconstruct a database after loss; PITR restores to a selected time using a base backup plus archived WAL.

**How it works.** Logical dumps are useful for portability and object-level restore; physical backup plus WAL supports point-in-time recovery. Recovery time and recovery point objectives determine the plan.

**Example**

```sql
pg_dump -Fc learning > learning.dump
-- Physical/PITR setup requires base backups and WAL archiving.
```

**Production decision.** Practice restoring into a separate environment and record RPO/RTO.

**Common mistake.** A successful backup job is not evidence that the restore process works.

**Primary source:** https://www.postgresql.org/docs/current/backup.html

### 20.3 Recovery objectives and restore rehearsal

**What it means.** RPO is the acceptable amount of data loss; RTO is the acceptable time to restore service. Backups and HA solve different pieces.

**How it works.** A base backup plus archived WAL can support point-in-time recovery. Restore must include roles, extensions, configuration and an application cutover plan.

**Example**

```sql
-- Inspect configuration before relying on PITR.
SHOW archive_mode; SHOW wal_level;
```

**Production decision.** Set measurable recovery objectives, automate backups and rehearse a restore into an isolated environment.

**Common mistake.** A green backup job says files were written; it does not prove a usable recovery path.

**Primary source:** https://www.postgresql.org/docs/current/continuous-archiving.html

## 21. Primary → replicas

**Talk focus:** A primary sends WAL to replicas. Replicas can serve reads, but lag and failover need explicit handling.

### 21.1 Physical and logical replication

**What it means.** Physical standbys replay WAL and can serve read-only queries. Logical replication publishes selected table changes.

**How it works.** Asynchronous physical replicas may lag. Synchronous settings change commit latency and durability tradeoffs. Failover requires promoting a node and rerouting clients.

**Example**

```sql
SELECT application_name,state,sent_lsn,replay_lsn
FROM pg_stat_replication;
```

**Production decision.** Send read-after-write traffic to the primary unless you have measured and handled replica lag. Test failover.

**Common mistake.** Read replicas do not automatically scale writes or replace independent backups.

**Primary source:** https://www.postgresql.org/docs/current/warm-standby.html

### 21.2 Replication slots and WAL retention

**What it means.** A replication slot remembers how far a consumer has read. It can prevent required WAL from being removed.

**How it works.** Physical and logical consumers use different slot behavior. A stalled consumer can retain large WAL volume. Asynchronous replicas can lag, so read-after-write may be stale.

**Example**

```sql
SELECT slot_name,slot_type,active,restart_lsn FROM pg_replication_slots;
```

**Production decision.** Monitor lag and retained WAL alongside disk. Have a procedure for abandoned slots.

**Common mistake.** A replica can be healthy as a process while serving stale reads or retaining dangerous amounts of WAL.

**Primary source:** https://www.postgresql.org/docs/current/warm-standby.html

### 21.3 Logical replication and change streams

**What it means.** Logical replication sends table changes rather than a byte-for-byte physical standby image. It supports selective publication and downstream consumers.

**How it works.** Initial copy, schema compatibility, replica identity and slots matter. A change stream used for APIs or analytics adds its own delivery and authorization concerns.

**Example**

```sql
CREATE PUBLICATION study_events FOR TABLE events;
-- A subscriber is configured separately.
```

**Production decision.** Choose physical replication for standby/HA needs and logical streams when selected data must flow to another consumer.

**Common mistake.** A logical subscriber is not a transparent failover primary and replication does not replace backups.

**Primary source:** https://www.postgresql.org/docs/current/logical-replication.html

## 22. Connection pooling controls concurrency

**Talk focus:** Requests borrow a limited set of reusable connections. Excess requests wait or time out.

### 22.1 Why a pool exists

**What it means.** Each database session uses resources. A pool reuses a bounded number of sessions and queues extra application work.

**How it works.** Session pooling holds a server session for a client session; transaction pooling can reuse server sessions between transactions but changes session-state assumptions.

**Example**

```sql
SELECT state,count(*) FROM pg_stat_activity GROUP BY state;
```

**Production decision.** Tune from active query time, DB CPU/RAM, connection limits and queue wait. No universal pool size exists.

**Common mistake.** A bigger pool may increase contention while apparently reducing queue length.

**Primary source:** https://www.postgresql.org/docs/current/runtime-config-connection.html

### 22.2 Pool sizing is a queueing problem

**What it means.** A request waits if every DB connection is busy. More connections may reduce waiting until database CPU, memory or lock contention becomes the limiter.

**How it works.** A rough starting model relates arrival rate, average DB time and active concurrency; real workloads need p95 and burst measurement. Session state, prepared statements and temporary tables affect transaction-pooling compatibility.

**Walk through it.** What happens to 100 concurrent DB jobs with a 20-connection pool?

1. Set requests to 100 and pool size to 20 in the visual.
2. Observe up to 20 busy connections and the rest waiting initially.
3. Increase pool size, then ask whether DB CPU or locks can sustain the added active work.

**Observe.** A pool bounds DB concurrency; it does not multiply CPU. Waiting and timeouts are application-level outcomes.

**Decision.** Tune pool size using queue wait, query time and DB saturation together.

**Example**

```sql
SELECT state,count(*) FROM pg_stat_activity GROUP BY state;
```

**Production decision.** Measure pool wait, active sessions, DB saturation and query duration together. Adjust pool size gradually.

**Common mistake.** A pool of 100 does not make a single CPU core execute 100 expensive queries efficiently.

**Primary source:** https://www.postgresql.org/docs/current/runtime-config-connection.html

## 23. Partitioning lets PostgreSQL skip data

**Talk focus:** A date predicate can prune partitions outside the requested range.

### 23.1 Partition pruning and maintenance

**What it means.** A partitioned table divides one logical relation into child tables, commonly by time.

**How it works.** When a query predicate aligns with bounds, PostgreSQL can skip irrelevant partitions. Inserts route to the matching child. Local indexes and maintenance still need planning.

**Example**

```sql
CREATE TABLE events_by_year(id bigint, created_at date) PARTITION BY RANGE(created_at);
CREATE TABLE events_2026 PARTITION OF events_by_year FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

**Production decision.** Use partitioning for lifecycle management and pruning on large data with a natural key. Inspect actual plans.

**Common mistake.** Partitioning is not sharding and is not an automatic speed boost for unrelated predicates.

**Primary source:** https://www.postgresql.org/docs/current/ddl-partitioning.html

### 23.2 Partition lifecycle and pruning proof

**What it means.** Partitions help when data has a natural boundary and queries include that boundary. They can make old data removal operationally simpler.

**How it works.** Create future partitions before data arrives. DROP or DETACH an old partition when retention allows. EXPLAIN should show only relevant partitions for the query predicate.

**Example**

```sql
EXPLAIN SELECT * FROM events_by_year WHERE created_at >= DATE '2026-01-01';
```

**Production decision.** Plan partition count, indexes, backup/retention and maintenance jobs.

**Common mistake.** Too many partitions can increase planning time and catalog work without reducing scanned data.

**Primary source:** https://www.postgresql.org/docs/current/ddl-partitioning.html

## 24. Partitioning ≠ sharding

**Talk focus:** Partitions live under one logical PostgreSQL database. Shards split data across databases and add routing complexity.

### 24.1 From one database to many

**What it means.** Scale only after identifying a bottleneck. Cache, replicas, partitioning, queues and sharding solve different problems.

**How it works.** Cache reduces repeat reads but creates invalidation rules; replicas add read capacity and lag; queues absorb asynchronous work; sharding routes independent data across database instances.

**Example**

```sql
-- Example of a partition-friendly predicate
SELECT * FROM events WHERE created_at >= DATE '2026-01-01';
```

**Production decision.** Sharding is justified when a single primary cannot satisfy measured storage or write capacity after simpler options. Plan cross-shard queries and transactions.

**Common mistake.** “Millions of requests” alone does not specify database load: cache hit rate, query cost and write ratio matter.

**Primary source:** https://www.postgresql.org/docs/current/high-availability.html

### 24.2 Choosing a shard key

**What it means.** A shard key decides where each row lives. It becomes expensive to change once data and queries depend on it.

**How it works.** Tenant ID often keeps a tenant’s related rows together, but large tenants can cause skew. Cross-shard joins, global uniqueness and transactions require extra design.

**Example**

```sql
-- Conceptual: shard = hash(tenant_id) % shard_count
-- Routing and rebalancing belong to the application or platform.
```

**Production decision.** Shard after exhausting measured single-primary options and writing a rebalancing plan.

**Common mistake.** Even distribution by row count does not guarantee even CPU or storage work.

**Primary source:** https://www.postgresql.org/docs/current/high-availability.html

## 25. Self-host, serverless Postgres, or managed RDS?

**Talk focus:** Choose from workload shape, operational control, availability needs and observed CPU, RAM, I/O and connection pressure.

### 25.1 Serverless versus managed instance versus self-host

**What it means.** Serverless PostgreSQL offerings can pause or resize compute; managed instances provide chosen capacity and managed operations; self-hosting provides host control with full responsibility.

**How it works.** For idle or bursty development, test wake latency and connection behavior. For steady production, test fixed-capacity economics, backups, availability and storage I/O. For self-hosting, plan patching, monitoring, failover and restore drills.

**Walk through it.** What changes when the same app is idle overnight and busy at noon?

1. Select prototype/bursty in the hosting visual and list wake latency, connection and working-set risks.
2. Select steady/critical and list instance sizing, backup and availability needs.
3. Select self-host and list patching, restore and failover responsibilities.

**Observe.** The same PostgreSQL SQL can run in each option; compute behavior and operational responsibility differ.

**Decision.** Load-test realistic p95 latency and estimate both active and idle periods before choosing.

**Example**

```sql
SELECT pg_size_pretty(pg_database_size(current_database()));
SELECT state,count(*) FROM pg_stat_activity GROUP BY state;
```

**Production decision.** A hosting decision is revisited as workload changes. Check provider-specific extension support, networking, backup and failover terms.

**Common mistake.** Serverless does not mean zero operational concerns, and managed does not mean your schema or queries are automatically fast.

**Primary source:** https://neon.com/docs/manage/endpoints/

### 25.2 Choose hosting and size from evidence

**What it means.** Self-hosting, managed instances and serverless PostgreSQL change who operates the service and how compute responds to load.

**How it works.** Size CPU for query/concurrent work, RAM for hot pages and sorts, storage for capacity and IOPS, and connections for bounded concurrency. Load-test representative p95 latency and leave headroom.

**Example**

```sql
SELECT datname,pg_size_pretty(pg_database_size(datname)) FROM pg_database;
```

**Production decision.** A variable or idle workload can benefit from serverless behavior; steady workloads may suit managed fixed capacity; self-hosting gives control with operational responsibility. Validate provider-specific limits.

**Common mistake.** Do not choose by a single database-size number; 100 GB hot random reads and 100 GB cold archives need different resources.

**Primary source:** https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.Summary.html

## 26. Roles, grants and RLS protect rows

**Talk focus:** Authentication identifies a caller. Grants and row-level security decide what the caller may access.

### 26.1 Roles, GRANT and schemas

**What it means.** A role may log in or group permissions. Schemas organize objects and have their own USAGE and CREATE privileges. Object ownership and grants determine operations before RLS restricts rows.

**How it works.** Use a restricted application role and separate migration/owner role. Grant only the tables, sequences and functions needed; default privileges can manage future objects.

**Example**

```sql
CREATE ROLE app_reader LOGIN;
GRANT USAGE ON SCHEMA app TO app_reader;
GRANT SELECT ON app.documents TO app_reader;
```

**Production decision.** Test permissions with SET ROLE or a real app connection, not a superuser session.

**Common mistake.** Granting SELECT on a table without schema USAGE can still prevent access; ownership and BYPASSRLS can bypass row policies.

**Primary source:** https://www.postgresql.org/docs/current/user-manag.html

### 26.2 Roles, grants and RLS

**What it means.** Authentication proves identity; privileges authorize operations; RLS adds predicates that decide which rows a role can access.

**How it works.** The application must establish trusted tenant context. Table owners and BYPASSRLS roles can bypass policies unless configured appropriately. Test policies using actual app roles.

**Walk through it.** Can a tenant read rows simply because the browser sent a tenant_id?

1. Create a restricted role and grant only needed table operations.
2. Enable RLS and define a policy using trusted session identity.
3. Test as tenant A, tenant B, anonymous and a privileged role.

**Observe.** The policy filters by the trusted identity context. Ownership or BYPASSRLS can change behavior.

**Decision.** Treat browser-supplied tenant IDs as untrusted and test policies through the real API role.

**Example**

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_read ON documents FOR SELECT USING (tenant_id = current_setting('app.tenant_id')::bigint);
```

**Production decision.** Use least privilege, test SELECT/INSERT/UPDATE/DELETE separately, and review policy impact on plans.

**Common mistake.** RLS is not safe if client-controlled tenant IDs are trusted without identity verification.

**Primary source:** https://www.postgresql.org/docs/current/ddl-rowsecurity.html

### 26.3 SECURITY DEFINER and view boundaries

**What it means.** A function or view can execute with privileges different from the caller’s. This is useful for controlled operations and dangerous when misunderstood.

**How it works.** SECURITY DEFINER functions should use a safe search_path and narrow grants. Views may use owner privileges unless security_invoker is chosen where supported. RLS must be tested with the actual application role.

**Example**

```sql
-- PostgreSQL 15+
CREATE VIEW safe_documents WITH (security_invoker=true) AS SELECT id,body FROM documents;
```

**Production decision.** Review every exposed view and RPC in a Supabase-like API. Test tenant isolation through the actual client path.

**Common mistake.** A table with RLS can leak through an owner-privileged view if the view boundary is not designed carefully.

**Primary source:** https://www.postgresql.org/docs/current/sql-createview.html

## 27. Views and materialized views are different

**Talk focus:** A view stores a query definition. A materialized view stores the query result until you refresh it.

### 27.1 View versus materialized view

**What it means.** A view stores a SELECT definition; a materialized view stores the result rows and may become stale.

**How it works.** A normal view is evaluated against underlying data when queried. REFRESH MATERIALIZED VIEW recomputes the stored result. Materialized views can have indexes.

**Walk through it.** Why does one named query change immediately while the other stays stale?

1. Create a view and materialized view over orders.
2. Insert one new order, then query both objects.
3. Run REFRESH MATERIALIZED VIEW and query again.

**Observe.** A normal view runs against current base rows. A materialized view serves its stored result until refresh.

**Decision.** State a freshness target before choosing materialization.

**Example**

```sql
CREATE VIEW active_users AS SELECT id FROM users WHERE active;
CREATE MATERIALIZED VIEW daily_counts AS SELECT day,count(*) FROM orders GROUP BY day;
REFRESH MATERIALIZED VIEW daily_counts;
```

**Production decision.** Use views for reusable interfaces and materialized views when precomputation outweighs refresh cost and staleness. Review security_invoker behavior for RLS.

**Common mistake.** A normal view is not a cache, and a materialized view is not automatically up to date.

**Primary source:** https://www.postgresql.org/docs/current/rules-materializedviews.html

### 27.2 Functions and triggers

**What it means.** A function packages database logic; a trigger runs on a table event.

**How it works.** Functions can support reusable queries or invariants. Triggers can maintain audit columns or derived data but hide work from callers. Security definer functions need careful search_path and privilege review.

**Example**

```sql
CREATE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
```

**Production decision.** Use declarative constraints first. Keep triggers small, documented and tested under bulk writes.

**Common mistake.** A trigger can turn one visible statement into many hidden writes and extra latency.

**Primary source:** https://www.postgresql.org/docs/current/triggers.html

### 27.3 Refresh cost and concurrent readers

**What it means.** A materialized view stores a snapshot of a query result. Refresh must recompute data and can be expensive.

**How it works.** REFRESH MATERIALIZED VIEW CONCURRENTLY permits readers during refresh under its requirements, including a suitable UNIQUE index. It is not a continuous incremental update.

**Example**

```sql
CREATE UNIQUE INDEX daily_counts_day_idx ON daily_counts(day);
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_counts;
```

**Production decision.** Set an explicit freshness target and schedule refresh around load. Compare against a normal view plus indexes.

**Common mistake.** A materialized view can serve stale results until the refresh finishes.

**Primary source:** https://www.postgresql.org/docs/current/sql-refreshmaterializedview.html

## 28. What Supabase builds around PostgreSQL

**Talk focus:** PostgreSQL stores the data; Auth, PostgREST APIs, Realtime, Storage, Edge Functions and Studio add product services.

### 28.1 What Supabase builds on PostgreSQL

**What it means.** Supabase uses PostgreSQL as the data core and provides Auth, API, Realtime, Storage, Edge Functions and Studio around it.

**How it works.** Auth stores identities in an auth schema and issues tokens; PostgREST exposes database objects; RLS restricts rows. Realtime can consume change streams. Storage keeps object metadata in Postgres while file bytes use object storage. Edge Functions run outside the DB.

**Walk through it.** Which Supabase component answers a sign-in, a table read and a file request?

1. Trace sign-in through Auth and its database-backed identity data.
2. Trace a table request through API role, grants and RLS.
3. Trace a file request through Storage metadata/policy and object bytes.
4. Trace Realtime as a separate change-delivery service.

**Observe.** PostgreSQL is the transactional data core; Auth, API, Storage, Realtime and Functions are distinct services with their own boundaries.

**Decision.** Design policies and secrets at each service boundary, not only at the table.

**Example**

```sql
SELECT schemaname,tablename,rowsecurity FROM pg_tables WHERE schemaname='public';
```

**Production decision.** Treat each service boundary separately: client token, API grants, RLS policy, storage policy and function secrets all matter.

**Common mistake.** Supabase is not a different database engine, and enabling Auth does not automatically make every public table safe.

**Primary source:** https://supabase.com/docs/guides/getting-started/architecture

### 28.2 Direct client access and RLS

**What it means.** A browser can call an auto-generated API safely only when exposed tables and functions have the intended privileges and policies.

**How it works.** Authenticated and anonymous roles are distinct. Policy expressions participate in queries; views created with owner privileges can change RLS behavior. Service roles should remain server-side.

**Example**

```sql
CREATE POLICY own_rows ON documents FOR SELECT TO authenticated USING (owner_id = auth.uid());
```

**Production decision.** Test as anon and authenticated users, including negative cases and joins. Measure policy performance on large tables.

**Common mistake.** Never ship a service-role key to a browser.

**Primary source:** https://supabase.com/docs/guides/database/postgres/row-level-security

### 28.3 Auth, API and RLS end to end

**What it means.** Supabase Auth signs users in and issues tokens. PostgREST exposes database objects. PostgreSQL roles and RLS enforce row access.

**How it works.** The auth schema stores identities; the API maps a request role and JWT context to SQL. A service role has elevated privileges and belongs only on trusted servers.

**Example**

```sql
SELECT auth.uid();
-- In Supabase, policies can compare owner_id with auth.uid().
```

**Production decision.** Test anonymous, authenticated and privileged paths separately. Keep public schemas and functions intentionally exposed.

**Common mistake.** A valid login does not automatically grant correct table permissions or row policies.

**Primary source:** https://supabase.com/docs/guides/database/postgres/row-level-security

### 28.4 Realtime, Storage and Edge Functions are distinct services

**What it means.** Realtime can stream database changes; Storage serves file objects with database metadata; Edge Functions run application logic outside PostgreSQL.

**How it works.** Realtime change feeds use replication machinery for postgres_changes. Storage object bytes belong in object storage, while metadata and policies live in the platform database.

**Example**

```sql
-- Database metadata and application file bytes are different resources.
SELECT * FROM storage.objects LIMIT 3;
```

**Production decision.** Choose the service for the job and account for change-stream lag, file access policies and function secrets.

**Common mistake.** A file stored through Supabase Storage is not simply a large bytea value in your application table.

**Primary source:** https://supabase.com/docs/guides/getting-started/architecture

## 29. Extensions add database capabilities

**Talk focus:** Extensions install SQL objects such as types, functions, operators and index methods into a database.

### 29.1 Extensions and operational control

**What it means.** Extensions install database objects such as types, functions, operators and index methods; the server must have their files available.

**How it works.** CREATE EXTENSION enables an installed extension in a database. Managed providers decide which extensions and versions they support. pg_trgm, PostGIS and vector serve different needs.

**Example**

```sql
SELECT name,installed_version FROM pg_available_extensions WHERE name IN ('pg_trgm','postgis','vector');
```

**Production decision.** Check version compatibility, privileges, upgrade path and provider support before relying on an extension.

**Common mistake.** CREATE EXTENSION cannot download arbitrary extension code into a managed server.

**Primary source:** https://www.postgresql.org/docs/current/sql-createextension.html

### 29.2 Extensions as production dependencies

**What it means.** Extensions can introduce data types, functions, operators, background workers or index methods. They must be available and supported on the host.

**How it works.** A managed provider may support only selected versions. Some extensions need preload or additional configuration. Upgrades can require coordination with PostgreSQL upgrades.

**Example**

```sql
SELECT name,installed_version,default_version FROM pg_available_extensions WHERE installed_version IS NOT NULL;
```

**Production decision.** Record required extensions and versions in deployment checks and migrations.

**Common mistake.** CREATE EXTENSION may fail even for a valid extension if server files or privileges are missing.

**Primary source:** https://www.postgresql.org/docs/current/sql-createextension.html

## 30. JSONB and text search

**Talk focus:** Structured columns, JSONB, full-text search and trigram search answer different retrieval questions.

### 30.1 Relational columns, JSONB and text search

**What it means.** Use typed columns for stable keys and constraints; JSONB for flexible document fields; full-text search for language-aware word matching.

**How it works.** GIN can index JSONB containment and tsvector search. pg_trgm supports some substring and similarity patterns. B-tree suits exact/range access, not every LIKE pattern.

**Example**

```sql
CREATE INDEX docs_json_idx ON documents USING gin(metadata);
CREATE INDEX docs_text_idx ON documents USING gin(to_tsvector('english',body));
```

**Production decision.** Choose the operator and index together. Keep important join keys as columns even if a JSONB payload also exists.

**Common mistake.** JSONB is not “schema-free correctness”; validation and query contracts still exist.

**Primary source:** https://www.postgresql.org/docs/current/datatype-json.html

### 30.2 JSONB indexing and field ownership

**What it means.** JSONB is useful for variable metadata, but important join keys and invariants should usually be typed columns.

**How it works.** GIN can support containment and key-existence operators. Different operator classes trade index size against supported operations; expression indexes can target one frequently queried path.

**Example**

```sql
CREATE INDEX documents_metadata_idx ON documents USING gin(metadata);
SELECT id FROM documents WHERE metadata @> '{"topic":"mvcc"}'::jsonb;
```

**Production decision.** Define which fields are stable contract fields and which are flexible payload. Validate payload shape when it matters.

**Common mistake.** Storing every field in JSONB makes some constraints, joins and migrations harder rather than eliminating schema.

**Primary source:** https://www.postgresql.org/docs/current/datatype-json.html

### 30.3 Full-text and trigram search solve different questions

**What it means.** Full-text search tokenizes text and can rank terms; trigram similarity helps substring or typo-tolerant matching.

**How it works.** A leading wildcard is not a normal B-tree prefix lookup. A GIN index on tsvector or pg_trgm uses different operators and storage.

**Example**

```sql
CREATE INDEX docs_fts ON documents USING gin(to_tsvector('english',body));
SELECT id FROM documents WHERE to_tsvector('english',body) @@ plainto_tsquery('english','postgresql');
```

**Production decision.** Choose lexical, trigram or vector retrieval by user intent and measure quality as well as latency.

**Common mistake.** A keyword match is not proof of semantic relevance, and a vector match may miss an exact identifier.

**Primary source:** https://www.postgresql.org/docs/current/textsearch.html

## 31. What is an embedding?

**Talk focus:** An embedding model maps text to a numeric vector. Nearby vectors can represent related meaning.

### 31.1 What an embedding is

**What it means.** An embedding model maps input text to a numeric vector. A distance metric ranks vectors; it does not prove factual truth.

**How it works.** The query and stored chunks must use the same model and compatible dimensions. Chunk boundaries and metadata filtering affect retrieval. A 2D diagram is an analogy for a high-dimensional space.

**Example**

```sql
-- Example only; real values come from an embedding model.
SELECT '[0.1,0.2,0.3]'::vector;
```

**Production decision.** Evaluate recall on real questions. Version model and chunking strategy so re-embedding is possible.

**Common mistake.** A visually nearby point in a toy 2D chart is not a measured semantic match.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

## 32. pgvector adds vector search

**Talk focus:** Store vectors beside metadata and use SQL to rank nearest neighbors.

### 32.1 Exact vector search and approximate indexes

**What it means.** pgvector adds vector types, distance operators and index methods to PostgreSQL. Exact ranking searches eligible candidates; ANN indexes trade some recall for speed.

**How it works.** HNSW uses a navigable graph; IVFFlat partitions vector space and searches selected lists. Metadata filters, dimensions and distance operators affect plan and recall.

**Walk through it.** What do you give up to make a large nearest-neighbor search faster?

1. Store vectors from one embedding model with one distance metric.
2. Run an exact ORDER BY distance LIMIT K query as the quality baseline.
3. Add an ANN index and compare latency and overlap with exact top K on real queries.

**Observe.** HNSW or IVFFlat can reduce search work while possibly changing which neighbors are returned. Metadata filters can change recall.

**Decision.** Choose index settings against a labeled query set and measured latency target.

**Example**

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT id,content FROM chunks ORDER BY embedding <=> $1::vector LIMIT 5;
```

**Production decision.** Benchmark exact versus indexed recall, p95 latency, build time and memory for your data. Combine structured filters with similarity where needed.

**Common mistake.** Creating an ANN index does not guarantee the filtered top K or latency you expect.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

### 32.2 Hybrid retrieval

**What it means.** Keyword search finds literal terminology; vectors can find semantically related phrasing. Combining them can improve coverage.

**How it works.** Rank candidates from text and vector search, then combine or rerank. Keep tenant and access filters enforced before context reaches the model.

**Example**

```sql
-- Conceptual: combine FTS-ranked and vector-ranked candidate ids, then rerank.
```

**Production decision.** Evaluate against a labeled question set; choose the simplest retrieval path meeting quality and latency targets.

**Common mistake.** Vector search does not replace exact SQL predicates, and lexical search does not understand every paraphrase.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

### 32.3 HNSW versus IVFFlat as an operational choice

**What it means.** Both are approximate-nearest-neighbor indexes, but their build and query behavior differ.

**How it works.** HNSW builds a graph and often offers a strong speed/recall balance with more memory and build cost. IVFFlat uses trained lists and benefits from enough representative data before index creation. Filters and iterative scans affect results.

**Example**

```sql
CREATE INDEX chunks_embedding_hnsw ON chunks USING hnsw (embedding vector_cosine_ops);
```

**Production decision.** Measure recall against exact search, build time, memory, index size and filtered-query latency.

**Common mistake.** An ANN index returning top K quickly does not guarantee those are the exact top K.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

## 33. RAG retrieves evidence before answering

**Talk focus:** Question → embedding → vector search → visible chunks → context → model answer.

### 33.1 RAG as visible evidence flow

**What it means.** RAG retrieves context at question time and gives it to a generation model. It does not change model weights.

**How it works.** Ingest and chunk documents, embed chunks, store vectors and metadata, embed the user query, retrieve top K, show chunks, then send selected context with the question to an LLM.

**Walk through it.** What did the model actually receive before it answered?

1. Chunk and embed source documents.
2. Embed a question and retrieve top K from pgvector.
3. Show chunk IDs and text before calling the LLM.
4. Pass only authorized chunks as context and inspect citations in the answer.

**Observe.** Retrieval and generation are separate steps. A fluent answer can still be unsupported if the retrieved evidence is wrong.

**Decision.** Evaluate retrieval separately and preserve document provenance.

**Example**

```sql
SELECT content,embedding <=> $1::vector AS distance
FROM chunks ORDER BY embedding <=> $1::vector LIMIT 3;
```

**Production decision.** Measure retrieval quality separately from answer quality. Cite retrieved chunks and reject answers unsupported by context.

**Common mistake.** Retrieved text is untrusted input and may contain malicious instructions.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

### 33.2 Failure modes of AI retrieval

**What it means.** A fluent answer can be unsupported even when retrieval returns plausible chunks.

**How it works.** Chunking, stale content, metadata filters, model changes, approximate recall and prompt limits can all remove needed evidence. Permissions must hold across the entire pipeline.

**Example**

```sql
-- Inspect chunk ids, source, score and tenant for every answer.
```

**Production decision.** Log retrieval provenance, test no-answer cases and compare with a labeled evaluation set.

**Common mistake.** Do not hide retrieved chunks behind the answer in a teaching or debugging demo.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

### 33.3 RAG evaluation and tenant safety

**What it means.** An answer can be fluent while using wrong or stale chunks. Retrieval quality and answer quality need separate tests.

**How it works.** A labeled set of questions can measure whether the right chunk appears in top K. Tenant filters and document access must be enforced before retrieval results reach the prompt. Log cited chunk IDs and model/version.

**Example**

```sql
-- For each question, record expected chunk ids, retrieved ids and answer support.
```

**Production decision.** Test no-answer cases, prompt-injection attempts and document updates. Show retrieved evidence to users where appropriate.

**Common mistake.** Filtering a final answer after a forbidden chunk has reached the LLM is too late.

**Primary source:** https://github.com/pgvector/pgvector/blob/master/README.md

## 34. Scale the bottleneck you measure

**Talk focus:** Load balancing, stateless APIs, pools, cache, replicas, queues and observability each have a job.

### 34.1 Operate by SLO and bottleneck

**What it means.** Capacity planning starts with workload and a latency/reliability target, not a universal “PostgreSQL can handle N requests” number.

**How it works.** Observe API p95 latency, query p95, CPU, buffer/cache behavior, disk I/O, locks, pool queue wait, replica lag, WAL growth and autovacuum. Change one bottleneck at a time.

**Example**

```sql
SELECT state,wait_event_type,count(*) FROM pg_stat_activity GROUP BY 1,2;
```

**Production decision.** Document backups, restore drills, failover, schema migrations and incident response before adding shards.

**Common mistake.** Request count alone says little about database work per request.

**Primary source:** https://www.postgresql.org/docs/current/monitoring-stats.html

### 34.2 Application query patterns

**What it means.** A fast single query can still make an endpoint slow when called once per result row. N+1 reads, unbounded OFFSET and unsafe SQL construction are common application bottlenecks.

**How it works.** Use parameterized statements, batch related reads, paginate with stable ordering and consider keyset pagination for deep pages. Hold a transaction only while its DB work is active.

**Example**

```sql
SELECT id,created_at FROM events
WHERE (created_at,id) < ($1::timestamptz,$2::bigint)
ORDER BY created_at DESC,id DESC LIMIT 50;
```

**Production decision.** Measure end-to-end p95 and query counts per request. Compare application logs with pg_stat_statements where enabled.

**Common mistake.** An index cannot repair an endpoint that makes thousands of avoidable round trips or uses unsafe string-built SQL.

**Primary source:** https://www.postgresql.org/docs/current/queries-limit.html

### 34.3 Safe schema evolution

**What it means.** Schema changes can block work or force backfills. Production migrations should be designed for concurrent application versions.

**How it works.** Add compatible columns, deploy code that can handle old/new shape, backfill in batches, then enforce constraints and remove old fields. Some DDL takes strong locks; CONCURRENTLY index creation has special rules.

**Example**

```sql
CREATE INDEX CONCURRENTLY users_tenant_joined_idx ON users(tenant_id,joined_at);
```

**Production decision.** Test migrations on representative size and set a suitable lock_timeout for operations that must fail rather than queue indefinitely.

**Common mistake.** A quick migration on an empty development table may be dangerous on a busy production table.

**Primary source:** https://www.postgresql.org/docs/current/sql-createindex.html

### 34.4 Observe the database, not just CPU

**What it means.** Slow service can be caused by locks, pool queues, bad estimates, disk reads, replica lag or autovacuum even when CPU is modest.

**How it works.** pg_stat_activity exposes sessions and waits. pg_stat_statements can aggregate normalized query statistics when installed and configured. Progress views show some maintenance work.

**Example**

```sql
SELECT state,wait_event_type,count(*) FROM pg_stat_activity GROUP BY 1,2;
```

**Production decision.** Connect API traces to database query IDs and compare p50/p95 latency during representative load.

**Common mistake.** A single dashboard number cannot tell you which query or tenant caused the pressure.

**Primary source:** https://www.postgresql.org/docs/current/monitoring-stats.html

## 35. One request. One database. Many guarantees.

**Talk focus:** SQL, transactions, plans, pages, WAL, maintenance, pooling and retrieval now form one picture.

### 35.1 Capstone: explain one request end to end

**What it means.** Trace the same request through HTTP, pool, parse/plan, index or scan, row visibility, WAL for writes, page storage and possibly a replica or retrieval pipeline.

**How it works.** For every layer name its input, output, guarantee, resource cost and observable metric. That is a stronger mental model than memorizing feature names.

**Example**

```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE id=42;
```

**Production decision.** Build a small app, seed realistic data, measure a slow query, add a justified index, test concurrent writes and rehearse recovery.

**Common mistake.** A zero-to-hero course ends when you can explain and measure behavior, not when you recognize terms.

**Primary source:** https://www.postgresql.org/docs/current/tutorial.html

