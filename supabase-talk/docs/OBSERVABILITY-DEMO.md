# Live Observability demo runbook

Use a **disposable Supabase Cloud project**. This demonstration deliberately holds a row lock. Never run it on the project shown in the supplied production screenshots. Keep the connection string in a shell environment variable, outside Git and screen sharing.

## Prepare

1. In the Supabase dashboard, open **Connect** and copy a direct PostgreSQL connection string. A session pooler connection can also work; avoid transaction pooling for this demonstration because the open transaction must stay on one session. Use `psql` and three separate terminals.
2. In your shell, set `DEMO_DATABASE_URL` to that string using your preferred secret manager or local environment. Do not commit it or put it in slide content.
3. In terminal **setup**, create a dedicated demo object:

```bash
PGAPPNAME=obs-demo-setup psql "$DEMO_DATABASE_URL"
```

```sql
create schema if not exists observability_demo;
create table if not exists observability_demo.lock_target (
  id integer primary key,
  value integer not null
);
insert into observability_demo.lock_target(id, value)
values (1, 0) on conflict (id) do nothing;
```

Keep the Supabase dashboard on **Observability → Database Connections**. It is a live snapshot; refresh it after each action. The SQL observer below is a reliable fallback if dashboard sampling misses a brief state.

## Scene 1: an active query

In a new terminal, open a PostgreSQL session:

```bash
PGAPPNAME=obs-demo-active psql "$DEMO_DATABASE_URL"
```

Run:

```sql
select pg_backend_pid() as my_pid, pg_sleep(20);
```

Refresh Database Connections while the query sleeps. Explain that **Active Queries** means a statement is in progress. The dashboard may sample or refresh too slowly to catch a 20-second query. The `pg_sleep` call is intentional demo work; it is not a production query or a performance benchmark.

## Scene 2: idle transaction and blocking

Open terminal **A** using a direct or session-pooled connection:

```bash
PGAPPNAME=obs-demo-holder psql "$DEMO_DATABASE_URL"
```

In A, run these statements and **leave the terminal open at the prompt**:

```sql
set idle_in_transaction_session_timeout = '180s';
begin;
update observability_demo.lock_target set value = value + 1 where id = 1;
select pg_backend_pid() as holder_pid;
```

The UPDATE has finished. The transaction has not. A can appear as **idle in transaction** and still hold the row lock.

Open terminal **B**:

```bash
PGAPPNAME=obs-demo-waiter psql "$DEMO_DATABASE_URL"
```

In B, run:

```sql
set lock_timeout = '90s';
begin;
update observability_demo.lock_target set value = value + 1 where id = 1;
```

The UPDATE in B waits. Refresh **Database Connections**. Point to **Blocked Queries**, **Top Blocker**, session **State**, **Duration**, and **Blocked By**. A short wait is ordinary concurrency; a persistent user-facing wait is worth investigating. Do not leave the demo paused longer than needed.

If the dashboard has not refreshed, use a third SQL observer terminal:

```bash
PGAPPNAME=obs-demo-observer psql "$DEMO_DATABASE_URL"
```

```sql
select pid, application_name, state,
       now() - coalesce(xact_start, query_start) as duration,
       pg_blocking_pids(pid) as blocked_by
from pg_stat_activity
where datname = current_database()
  and application_name like 'obs-demo-%'
order by application_name;
```

Return to **A** and run `ROLLBACK;`. The lock is released and B's UPDATE can finish. In **B**, also run `ROLLBACK;` so the demo does not leave a changed row or another open transaction. If B reached its 90-second timeout, run `ROLLBACK;` to clear its failed transaction state. Closing A's session also rolls back its open transaction; the idle-transaction timeout is a backstop.

## Clean up

After A and B are rolled back or closed, in the setup terminal run:

```sql
drop schema if exists observability_demo cascade;
```

Only do this in the disposable demo project and only after confirming the schema contains the demo table. Do not run cleanup on a shared or production database.

## Explain the browser-tab question

Opening another browser tab creates another **web client**, but it does not promise another **PostgreSQL connection**. A request can go through the gateway, Data API, Auth or a pooler, and a database session may be reused. For a predictable connection demonstration, use separate `psql` sessions and show their `application_name` or PID. A second browser tab is useful for showing another dashboard page while the SQL terminals remain open.

## If the live demo is unavailable

Use the deck's **Connections** visual. It is labeled illustrative. Narrate A: `BEGIN` → `UPDATE` → idle; B: `UPDATE` → blocked; A: `ROLLBACK` → B continues. Do not present the illustration as a live measurement. Query Performance may not immediately show a one-off demo statement because its statistics and report refresh are different from a live session snapshot.
