/* Extracted from supplied PostgreSQL Question Bank; question and concise answer. */
export const sourceQuestions = [
 [
  "Foundations",
  "A 3-developer tiffin startup wants to run 4 separate databases from day 1. What would you advise, and why?",
  "Start with a single Postgres on day 1: at this scale it will handle orders (with `jsonb`), sessions, menu search (full-text / `pg_trgm`) and payments, and order + payment stay in one ACID transaction. Add a new datastore when Postgres shows a measured pain, not before."
 ],
 [
  "Foundations",
  "During a sale: `FATAL: sorry, too many clients already`. A junior says: 'Just set `max_connections = 2000`.' How would you handle it, and why?",
  "First check `pg_stat_activity` to see who is holding connections and in which state — here 20 pods × 10 = 200 pool connections already exceed the limit of 100 on their own. Going to 2000 is the wrong cure because every connection is a separate OS process: more active backends fight over the CPU, and `work_mem` is granted separately to every sort/hash in every backend, so there's an OOM risk; the right fix is a pool budget + a pooler (PgBouncer)."
 ],
 [
  "Foundations",
  "The ORM created this table. For each of the three `SELECT` queries, what is the output or the error?",
  "(1) error `relation \"orderitems\" does not exist`, (2) runs and returns `250.00`, (3) error `column \"unitprice\" does not exist` (with a HINT). Unquoted names are folded to lowercase, quoted names match their exact case — and this applies separately to the table and to the column."
 ],
 [
  "Foundations",
  "This migration ran via `psql -f`. What will psql print for each statement, and will the `phone` column survive at the end?",
  "`BEGIN`, `ALTER TABLE` and `CREATE INDEX` will succeed; the `ALTER` with the `CHECK` will fail (the Mumbai row violates it), the `UPDATE` will get a `current transaction is aborted` error, and in response to `COMMIT` psql will print `ROLLBACK`. At the end neither the `phone` column nor the index survives."
 ],
 [
  "Foundations",
  "What will this single `SELECT` output? Give the reason for each column as well.",
  "`a = 3`, `b = t`, `c = f`, `d = 1`. Integer / integer truncates, a decimal literal in Postgres is `numeric` (exact), `float8` is approximate, and `sum(int) / count(...)` is also integer division."
 ],
 [
  "Foundations",
  "The same value was inserted into columns of two different types, then the session's `TimeZone` was changed. What will the `SELECT` show?",
  "`local_ts` will show the same `2026-09-21 10:00:00`, but `real_ts` will show `2026-09-21 04:30:00+00`. At insert time the `timestamptz` value was turned from IST into an absolute instant (UTC) and is now displayed in a UTC session; `timestamp` is just a wall-clock value with no timezone."
 ],
 [
  "Foundations",
  "In an events table with a random UUID primary key, inserts have gradually slowed down. Explain the mechanism. What would you change?",
  "UUID v4 is random, so each insert lands on some random leaf page of the B-tree: the whole index becomes the hot working set, cache misses mean disk reads, there are more page splits (pages ~70% full), and after a checkpoint full-page images of many pages go into WAL. With a `bigint` identity or a time-ordered UUIDv7, inserts go to the right edge of the index and all of this drops considerably."
 ],
 [
  "Foundations",
  "The rule: only one active account per email. Does this schema enforce that rule? What's the bug, and what's the fix?",
  "Both `INSERT` statements go through: in `UNIQUE`, `NULL` values are not considered equal to each other, so you can insert `(email, NULL)` as many times as you like — active duplicates are never stopped. Fix: a partial unique index `ON accounts (lower(email)) WHERE deleted_at IS NULL` (or `UNIQUE NULLS NOT DISTINCT` in PG 15+)."
 ],
 [
  "Foundations",
  "An identity column was chosen for GST invoice numbers. After this script, what will the last `SELECT` show?",
  "Two rows: `1 | Kirana` and `4 | Tiffin`. Id 2 was taken by the insert undone by `ROLLBACK`, and id 3 by the `NULL` insert that failed with a `NOT NULL` error (the error's DETAIL even shows `(3, null)`); sequence numbers never come back."
 ],
 [
  "Foundations",
  "Deleting one customer by PK — `DELETE FROM customers WHERE id = $1` — takes ~120 ms. Why, and how will you pin it down?",
  "There is no index on `orders.customer_id`. Every time a parent row is deleted, the FK's internal check looks for `customer_id = <id>` in `orders` — without an index that's a seq scan of 2 million rows, for every deleted customer (even if they have no orders at all). Fix: `CREATE INDEX CONCURRENTLY ON orders (customer_id)`."
 ],
 [
  "Foundations",
  "On `orders` with 2 million rows, which of these `ALTER` statements will rewrite the whole table (holding a long `ACCESS EXCLUSIVE` lock)?",
  "`ADD COLUMN token uuid DEFAULT gen_random_uuid()` — because of the volatile default every existing row has to be given a different value, so the whole table (and its indexes) is rewritten."
 ],
 [
  "Foundations",
  "Write the query: on a product page view, create or increment today's counter row, and return the new `views` count — in a single statement.",
  "`INSERT ... VALUES ($1, $2, 1) ON CONFLICT (product_id, day) DO UPDATE SET views = v.views + 1 RETURNING views` — the conflict target matches the composite PK, the increment is applied to the existing row's value, and `RETURNING` gives back the new count."
 ],
 [
  "Foundations",
  "This 'get-or-create customer' code crashes on some checkouts. What's the bug, and what's the fix?",
  "If the email already exists, `ON CONFLICT DO NOTHING` inserts nothing and `RETURNING` also returns 0 rows — the existing row's `id` doesn't come back, so `r.rows[0]` is undefined. Fix: keep `DO NOTHING` with a fallback `SELECT` of the existing row (CTE + `UNION ALL`), or 'touch' the row with `DO UPDATE` and use `RETURNING`."
 ],
 [
  "Foundations",
  "The supplier's price file accidentally lists one product twice. What happens when you run this `UPDATE ... FROM`?",
  "It runs silently (`UPDATE 2`): product 7 is updated only once and gets either `120.00` or `135.00` — which one is not predictable. No error or warning is raised."
 ],
 [
  "SQL",
  "With `ORDER BY price DESC LIMIT 3`, the 3rd and 4th products have the same `price`. Which statement is correct?",
  "The relative order of the two tied products (500) is undefined, so which one lands in 3rd place can change when the plan or physical layout changes. Fix: a unique tie-breaker, e.g. `ORDER BY price DESC, id`."
 ],
 [
  "SQL",
  "The September revenue report is built from this query. Where is the bug, and how does it affect the report's number?",
  "When compared with a `timestamptz`, `'2026-09-30'` becomes `2026-09-30 00:00:00` (in the session timezone), so every order placed after 00:00 on 30 September — almost the entire last day — silently disappears from the report. Fix: a half-open range `placed_at >= '2026-09-01' AND placed_at < '2026-10-01'`."
 ],
 [
  "SQL",
  "These three numbers on the marketing dashboard don't add up. What would you check, and how would you fix the query?",
  "For the 6,500 customers whose `city` is `NULL`, `city <> 'Surat'` (and `city = 'Surat'` too) yields UNKNOWN, and `WHERE` keeps only TRUE rows, so they are left out of both queries. Check: the count for `WHERE city IS NULL`; fix: `WHERE city IS DISTINCT FROM 'Surat'` (or `city <> 'Surat' OR city IS NULL`)."
 ],
 [
  "SQL",
  "What is the output of this blocked-shops query? Give all three columns `a`, `b`, `c`.",
  "`a = 1` (only Textile), `b = 0` (the list contains `NULL`, so `NOT IN` returns nothing), `c = 3` (Kirana, Tiffin, Dairy)."
 ],
 [
  "SQL",
  "What output does this query give on the tiffin service's ratings? And should the dashboard show `avg_a` or `avg_b`?",
  "`6 | 4 | 3 | 16 | 4.00 | 2.67`. `count(*)` counts all rows; the other aggregates skip `NULL`: `avg_a` = 16/4, `avg_b` = 16/6. The dashboard should show `avg_a` (alongside the 'rated' count)."
 ],
 [
  "SQL",
  "You run this `INSERT` and `SELECT` on the coupons table. What happens?",
  "The `INSERT` succeeds and the `SELECT` returns 0. `NULL BETWEEN 1 AND 50` is UNKNOWN: `CHECK` rejects only FALSE (UNKNOWN passes), while `WHERE` keeps only TRUE (UNKNOWN is dropped)."
 ],
 [
  "SQL",
  "Write a query: products (`id`, `name`) that received no non-cancelled order at all in September 2026.",
  "Anti-join: from `products`, a `NOT EXISTS` subquery that joins `order_items` to `orders`, with all three conditions — product match, `status <> 'cancelled'` and September's half-open date range — inside the subquery."
 ],
 [
  "SQL",
  "What is the output of this `LEFT JOIN` query? Does it meet the goal below?",
  "2 rows: Asha 101 and Chirag (id `NULL`). Bhavin is missing, so the goal is not met. Correct query: put the condition in the `ON`, `LEFT JOIN ord o ON o.customer_id = c.id AND o.status = 'paid'`, which returns all three customers."
 ],
 [
  "SQL",
  "In a per-order 'billed vs received' report, both amounts for some orders come out several times the real value. What's the bug, and what's the fix?",
  "Two separate one-to-many tables (`order_items` and `payments`) are joined together, so each order's rows become items × payments: 3 items and 2 payments = 6 rows, `billed` 2x and `received` 3x. Fix: aggregate each child table separately by `order_id` first, then join to the order."
 ],
 [
  "SQL",
  "An admin page (20 customers + each one's last 3 orders) gets slow on later pages. What would you change, and how would you prove it?",
  "The window version reads `orders` from the start on every page, because the join condition isn't pushed into the window subquery: without the index it's a Seq Scan of the whole table + a disk sort, and with the index a Merge Join reads every entry from the start of the index up to the page's last customer (page 1 is cheap, the last page is almost the whole table). Fix: `LEFT JOIN LATERAL (... WHERE customer_id = c.id ORDER BY placed_at DESC, id DESC LIMIT 3) ON true`, which seeks into the same index for each customer and reads only 3 entries: 20 small probes, independent of the page number."
 ],
 [
  "SQL",
  "Write a query: each customer's latest order (`customer_id`, order `id`, `placed_at`, `status`), exactly one row per customer.",
  "`SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id, placed_at DESC, id DESC`: the `ORDER BY` starts with the `DISTINCT ON` column, then latest first, and `id DESC` as a tie-breaker so the result is deterministic."
 ],
 [
  "SQL",
  "Write a query: the count of `'paid'` orders per city, with a grand total row at the bottom, in a single query, using the labels shown below.",
  "`GROUP BY ROLLUP (c.city)` gives the city groups + the grand total in a single pass. The total row also has `city` as `NULL`, so set the label using `GROUPING(c.city) = 1` and apply `coalesce(city, 'Unknown')` only to the remaining rows."
 ],
 [
  "SQL",
  "Mumbai has no sales. What will each query (Q1 and Q2) return?",
  "Q1: one row, `n = 0` and `total` `NULL`. Q2: no rows (0 rows). An aggregate without `GROUP BY` always returns one row; with `GROUP BY` you get one row per group, and zero input rows = zero groups."
 ],
 [
  "SQL",
  "Query 1 runs, but Query 2 errors, even though `email` is also `NOT NULL UNIQUE`. Why? How would you fix Query 2?",
  "An ungrouped column is allowed only when it is functionally dependent on the grouped columns, and Postgres recognises this dependency only through the **`PRIMARY KEY`**: after `GROUP BY c.id`, every `customers` column has a single value. A `UNIQUE` constraint (even with `NOT NULL`) or a unique index does not get this exemption, so Query 2 fails. Fix: `GROUP BY c.id`, or add `c.name` to the `GROUP BY` as well, or use an aggregate (`any_value`/`min`)."
 ],
 [
  "SQL",
  "This query shows each customer alongside their order amount. What will it return?",
  "No rows at all: the whole statement fails with `ERROR: more than one row returned by a subquery used as an expression`, because the scalar subquery returns two rows (300, 700) for Meena."
 ],
 [
  "SQL",
  "In PG 17, how will the planner handle CTE `o` in this query?",
  "The CTE is referenced twice, so PG 17 materializes it by default: one full Seq Scan of `orders`, then the `id = 42` filter on the `CTE Scan`. The PK index is not used."
 ],
 [
  "SQL",
  "Write a query: all subcategories under category `'Kapda'`, at every depth, with the depth and the full path.",
  "`WITH RECURSIVE`: `id = 1` in the anchor; in the recursive part go one level down via `c.parent_id = t.id`, adding `depth + 1` and extending the path, and keep an array of visited ids (`c.id <> ALL (t.seen)`) so you stop at a cycle."
 ],
 [
  "SQL",
  "What will this statement return? Give both `table_qty` and `returned_qty` for each item.",
  "atta 0 / `NULL`, chawal 5 / `NULL`, dal **10** / 15. The main `SELECT` sees dal's old qty (10) in `stock`, while `RETURNING` gives the new value (15). After the statement, dal = 15 in the table."
 ],
 [
  "SQL",
  "What will this ranking query return? Give `rnk`, `drnk` and `rn` for all five students.",
  "Bhavin and Esha: rank 1, dense_rank 1. Asha and Chirag: rank **3** (gap), dense_rank **2**. Dhruv: rank 5, dense_rank 3. `row_number` runs 1 to 5 with no repeats (ties broken by `name`)."
 ],
 [
  "SQL",
  "The dashboard's 'change since yesterday' column always comes out empty (`NULL`). Where is the bug, and how would you fix it?",
  "`WHERE` runs **before** the window function, so the window gets only the single 20 Sep row and `lag()` has no previous row at all, so it returns `NULL`. Fix: compute `lag()` in a subquery/CTE (over yesterday's and today's rows), then filter for 20 Sep outside."
 ],
 [
  "SQL",
  "Write a query: the top 2 products by revenue in each category. If there is a tie for 2nd place, both must appear.",
  "First aggregate revenue per product (excluding cancelled), then `rank() OVER (PARTITION BY category ORDER BY revenue DESC)`, and apply the `rnk <= 2` filter outside the subquery/CTE."
 ],
 [
  "SQL",
  "This query was run on a kirana store's bills. What will the `running` and `total` columns contain?",
  "`running` = 100, **180, 180**, 200 and `total` is 200 on every row. Bill 2's running total is 180, not 150, because bills 2 and 3 have the same date (peers)."
 ],
 [
  "Performance",
  "Code review: a junior's PR drops `order_items.unit_price` and `orders.shipping_address`. Would you approve it?",
  "No. The price charged at order time and the address the parcel went to are **historical facts** of the order. `products.price` and the customer's current address are different facts that keep changing. Drop them and old invoices, revenue reports and refunds will silently change."
 ],
 [
  "Performance",
  "Write the DDL: a many-to-many relation between products and tags, satisfying all five rules below.",
  "A junction table `product_tags` with a composite `PRIMARY KEY (product_id, tag_id)`, the product FK `ON DELETE CASCADE`, the tag FK `RESTRICT` (or the default `NO ACTION`), the relationship data (`tagged_by`, `tagged_at`) in this same table, and a separate index on `tag_id`."
 ],
 [
  "Performance",
  "Each category in a textile catalog has its own attributes. A dev has proposed this EAV design. What would you design instead, and why?",
  "Hybrid: fields that every product has and that get filters/constraints (`name`, `category`, `price`, `stock`) become real typed columns; the changing, category-specific attributes go in one `attrs jsonb` column, with `CHECK` constraints and an index where needed. Not EAV."
 ],
 [
  "Performance",
  "A SaaS billing app for 3000 kirana stores, all in one set of tables. What rules would you put in the schema so that data never gets mixed up?",
  "`store_id NOT NULL` in every tenant table; uniqueness and indexes start with `store_id` (`UNIQUE (store_id, email)`, `(store_id, placed_at)`); FKs are composite (`(store_id, customer_id) REFERENCES customers (store_id, id)`) so the DB itself rejects cross-store references; RLS on top as a safety net, and the app's role is not the table owner."
 ],
 [
  "Performance",
  "Which single index would you create for this customer-dashboard query?",
  "`(customer_id, placed_at)`: equality column first, range/sort column after. One seek finds that customer's recent orders already sorted, and the scan stops at `LIMIT 20`."
 ],
 [
  "Performance",
  "Login is slow, and one customer ended up with two accounts. Where is the bug in this code, and how would you fix it?",
  "The `UNIQUE(email)` index is on the raw `email`, so the `lower(email)` condition can't use it: a full table scan on every login. And that same unique check is case-sensitive, so both `Rohit@X.com` and `rohit@x.com` get created. Fix: clean up the duplicates, then a **unique expression index** on `lower(email)`."
 ],
 [
  "Performance",
  "Same index, same query, only the value differs, and so does the plan. A junior says the planner has a bug. What would you tell them, and what would you do?",
  "The planner is right: `shipped` is ~95% of rows, so even the index route would have to read almost every heap page, plus the index pages and random access on top; reading the whole table once sequentially is cheaper. Improvement: a partial index for the value that is actually searched for (`pending`), and no `enable_seqscan` in production."
 ],
 [
  "Performance",
  "A BRIN index is hundreds of times smaller than a B-tree. So why not just put BRIN on every column?",
  "BRIN only keeps a summary per block range (default 128 pages), which is min/max with the default `minmax` opclass, not row pointers. It only works when the value follows the table's physical order (time-ordered inserts); on a random column every range's min/max covers everything, so nothing gets skipped. And it's lossy: it doesn't give B-tree-style precise point lookups, `UNIQUE`, or sorted `ORDER BY`."
 ],
 [
  "Performance",
  "`customers.name` has a normal B-tree index. What will this query's plan be, and why?",
  "`Seq Scan`. A B-tree with the default (non-C) collation can't turn `LIKE 'Ros%'` into an index range; for that you need an index with `text_pattern_ops` (or `COLLATE \"C\"`)."
 ],
 [
  "Performance",
  "After adding a covering index, the plan shows `Index Only Scan`, but the query didn't get faster. What is this plan telling you, and what would you do?",
  "`Heap Fetches: 48210` = it had to go to the heap for every row, because the all-visible bit wasn't set in the visibility map for those pages; so in practice it ran just like a normal index scan. Fix: `VACUUM` (which sets that bit) and more aggressive autovacuum for this table."
 ],
 [
  "Performance",
  "An index migration failed, the retry said 'success', but the query is still slow. What probably happened, and how would you fix it?",
  "Attempt 2's cancel left an **INVALID** index behind; `IF NOT EXISTS` only checks the name, so attempt 3 didn't build anything. The planner never uses an invalid index. Fix: confirm via `pg_index.indisvalid` (or `\\d orders`), `DROP INDEX CONCURRENTLY`, then run CIC again outside a transaction and with the timeout handled (or `REINDEX INDEX CONCURRENTLY`)."
 ],
 [
  "Performance",
  "In this plan, how much total time did the inner `Index Scan` take, and how many rows did it return?",
  "~1,360 ms and ~60,000 rows: `0.068 × 20000` and `3 × 20000`. Per-loop numbers are multiplied by `loops`, and this node is the query's biggest cost."
 ],
 [
  "Performance",
  "You ran this script in psql (default autocommit). What will the last `SELECT` output?",
  "`count` = 1. `EXPLAIN ANALYZE` actually ran the `DELETE`, and autocommit committed it: the rows with 250 and 400 are gone. The `Delete` node's `actual rows=0` only says that it returned no rows upward (there's no `RETURNING`)."
 ],
 [
  "Performance",
  "After the nightly import, the city-wise report got slow. Read the plan and tell me: what is the problem, what is the root cause, and what would you do?",
  "On the `orders` scan the estimate is `rows=1` and the actual is `300000`: the statistics are stale (the last `ANALYZE` ran before the import, and the value `'imported'` isn't in the stats at all). The planner built the whole plan for 1 row: Nested Loop (300,000 lookups), an on-disk Sort, GroupAggregate. Fix: `ANALYZE orders;` right now, and always an `ANALYZE` at the end of the import job."
 ],
 [
  "Performance",
  "What is the `Sort Method` line in the nightly export's plan telling you? What do you think of the dev's suggested fix?",
  "The sort didn't fit in `work_mem` (4MB), so an external merge sort ran on temp files (~58 MB). The dev's fix is wrong in two ways: even 64MB isn't enough (an in-memory sort needs a lot more than the disk size, ~120 MB in the test), and a global `work_mem` applies to every sort/hash node on every connection, which risks OOM. The right way: `SET LOCAL work_mem` just for this export, and first measure whether the spill is even the bottleneck."
 ],
 [
  "Performance",
  "You ran `ANALYZE`, yet the estimate is still 10x too low. What is the right way to fix it?",
  "Extended statistics: `CREATE STATISTICS addresses_city_pin (dependencies) ON city, pincode FROM addresses;` then `ANALYZE addresses;`. This moves the estimate from 20 to 200 (the actual count)."
 ],
 [
  "Performance",
  "DB CPU is at 90%. Looking at this `pg_stat_statements` data, which query will you work on first?",
  "`q1`. The real cost of each query is `calls × mean`, i.e. `total_exec_time`: q1 = 10,000 s, q4 = 6,000 s, q3 = 450 s, q2 = 6 s. Priority is set by total time, not mean."
 ],
 [
  "Performance",
  "`SELECT count(*)` on `orders` takes ~1 s on every page load. Why doesn't Postgres store this count, and what will you do?",
  "Because of MVCC, different transactions see different rows at the same moment, so a single 'correct count for the table' simply cannot be stored — `count(*)` has to check the visibility of every row (or index entry). Remedies: an approximate count (`pg_class.reltuples` / `EXPLAIN` estimate), a capped count ('1000+'), or, if it must be exact, a trigger-maintained counter table — and first ask product whether an exact total is even needed."
 ],
 [
  "Performance",
  "This is keyset pagination, not `OFFSET`. Yet some orders never show up in the feed. Where is the bug, and what is the fix?",
  "`placed_at` is not unique. If other rows share the page's last row's `placed_at` but did not fit on that page, `placed_at < $2` skips them forever. Fix: put the unique tie-breaker `id` in both the `ORDER BY` and the cursor — `(placed_at, id) < ($2, $3)` — with index `(customer_id, placed_at DESC, id DESC)`."
 ],
 [
  "Internals",
  "Under the default isolation, what `stock` value will Session A see at T4 in this timeline?",
  "`4`. In the default Read Committed, the snapshot is taken at the start of each statement, not at `BEGIN` — so the `SELECT` at T4 sees B's committed `UPDATE` (a non-repeatable read)."
 ],
 [
  "Internals",
  "This checkout code is wrapped in `BEGIN`/`COMMIT`, yet stock goes wrong under load. What is breaking, and how will you fix it?",
  "A lost-update race: two requests read `stock = 5` at the same time, both compute `5 - 1 = 4` in the app and write the absolute value `4` — two items sold, stock dropped by only 1 (and the last piece can be sold to two people). In Read Committed, `BEGIN` alone does not prevent this. Fix: an atomic conditional `UPDATE ... SET stock = stock - $qty WHERE id = $pid AND stock >= $qty` (check the row count), or `SELECT ... FOR UPDATE`, or an optimistic `version` column."
 ],
 [
  "Internals",
  "This wallet-transfer code sometimes fails in a load test. When and why? How does Postgres respond, and what is the fix?",
  "When two transfers run at the same time in opposite directions (wallet 1 → 2 and 2 → 1), the two transactions lock the rows in opposite order: T1 locks row 1 and waits for row 2, T2 locks row 2 and waits for row 1 — a cycle. After `deadlock_timeout` (1s) Postgres detects the cycle and aborts one transaction with `40P01`; the other goes through. Fix: always lock rows in the same order (e.g. `id` ascending), and retry on `40P01` in the app."
 ],
 [
  "Internals",
  "This statement ran on a ~1 GB `orders` table and committed. How big will the table file be after one round of autovacuum?",
  "About 2 GB. `UPDATE` does not overwrite the row: it writes a new version of every matched row (even when the value is unchanged), and autovacuum only frees the old dead versions' space for reuse; it does not shrink the file."
 ],
 [
  "Internals",
  "Session A is in `REPEATABLE READ`. What output does A get from T1 to T6, and how much `stock` is left at the end?",
  "T1 = 10, T3 = 10 (the RR snapshot is fixed at T1), T4 = `ERROR: could not serialize access due to concurrent update` (SQLSTATE `40001`), the `COMMIT` at T5 actually performs a `ROLLBACK`, T6 = 9 — only B's decrement survives; A must retry the whole transaction."
 ],
 [
  "Internals",
  "10 workers run this job-picking code concurrently (without `SKIP LOCKED`). Duplicate jobs, errors, or something else? Explain.",
  "No duplicates, and no errors either — the first worker takes a row lock on the oldest job and the other 9 wait on the lock of **that same row**. After it commits, they re-check the row (no longer `pending`), move on to the next row and then queue up behind one another again — 10 workers do roughly the work of 1. `SKIP LOCKED` skips locked rows and returns the next free job immediately, so they all run in parallel."
 ],
 [
  "Internals",
  "Rule: 'at least one delivery boy is always on duty'. This code runs in `REPEATABLE READ`. What can go wrong, and how will you prevent it?",
  "Write skew: both transactions' snapshots show `count = 2`, they update different rows (no same-row conflict), both commit — and the on-duty count is 0. Repeatable Read does not prevent this. Fix: `SERIALIZABLE` + retry on `40001` (Postgres SSI will fail one of them), or lock the rows the decision was based on with `FOR UPDATE`."
 ],
 [
  "Internals",
  "You `DELETE` orders older than 2 years (~60% of rows) from a ~20 GB `orders` table, then run a plain `VACUUM orders`. What happens on disk now?",
  "The file stays ~20 GB. Plain `VACUUM` marks the dead tuples' space as 'reusable' in the free space map — subsequent `INSERT`/`UPDATE` operations will fill that space — but it does not shrink the file. To give disk back to the OS, use `VACUUM FULL` (`ACCESS EXCLUSIVE` lock) or, in production, `pg_repack`."
 ],
 [
  "Internals",
  "Autovacuum has not run on the 50-million-row `orders` table for 9 days, even though it has 6 million dead rows. Is it broken? What will you do?",
  "Autovacuum is not broken; it simply is not 'due' yet: it runs when dead rows exceed `50 + 0.2 × reltuples` (~10 million here), and there are 6 million now. The default 20% is far too loose for big tables; set a per-table `autovacuum_vacuum_scale_factor` (e.g. 0.01) and threshold on `orders`, and run a manual `VACUUM (ANALYZE) orders` now."
 ],
 [
  "Internals",
  "After a deploy, HOT updates on `sessions` dropped from ~95% to ~0% and the indexes started bloating fast. What is the most likely cause?",
  "Someone created a B-tree index on `last_seen_at`. HOT only happens when the `UPDATE` changes no indexed column (and the new version fits on the same page); now every `UPDATE` is non-HOT — each new row version needs a new entry in **every** index, hence index bloat and write amplification."
 ],
 [
  "Internals",
  "Autovacuum keeps running on `orders`, yet `n_dead_tup` keeps growing. What will you check, and in what order?",
  "Autovacuum is running, but the dead rows are 'not yet removable' — some old snapshot or XID is holding the xmin horizon back, so `VACUUM` simply cannot remove them. Order: (1) the oldest transactions in `pg_stat_activity` (`idle in transaction`, long queries, `backend_xmin`/`backend_xid`), (2) `pg_replication_slots` and replicas with `hot_standby_feedback`, (3) `pg_prepared_xacts`. Remove the blocker, then `VACUUM` will clean up."
 ],
 [
  "Internals",
  "At peak, a `(to prevent wraparound)` autovacuum has been running for hours. A teammate says: 'Cancel it and turn autovacuum off.' Is that right?",
  "Wrong plan. This vacuum is running because the table's `age(relfrozenxid)` has crossed `autovacuum_freeze_max_age` (default 200 million) — the freezing has to happen, otherwise near wraparound Postgres will stop handing out new XIDs (i.e. writes). `autovacuum_enabled = false` does not stop it, and if you cancel it the launcher will start it again, while `relfrozenxid` has not advanced. Let it run, adjust only the I/O throttle if needed, and from now on: monitoring + off-peak `VACUUM (FREEZE)`."
 ],
 [
  "Production",
  "After a profile update, the response sometimes shows the old city, with no error. Where is the bug, and what is the fix?",
  "The write committed on the primary, but the read goes straight to the async replica; the replica can be a few ms to seconds behind in WAL replay, so the user sees their own old data. Fix: read what you just wrote from the primary — simplest is `UPDATE ... RETURNING`, plus sending that user's reads for the next few seconds to the primary."
 ],
 [
  "Production",
  "The primary's disk died, the replica was promoted, the app is running again, but the `paid` orders from the last few seconds are missing. How?",
  "Default replication is async: when `synchronous_standby_names` is empty, `COMMIT` waits only for the WAL flush on the primary, not for the replica. Transactions that had committed but whose WAL hadn't reached the replica were lost for good with the promotion (RPO is not zero). Now: reconcile from the gateway records; going forward, synchronous replication for payments (`ANY 1` with 2+ standbys), at the cost of round-trip latency on every commit."
 ],
 [
  "Production",
  "A junior's idea: 'We want faster crash recovery, so set `checkpoint_timeout = 30s`.' What is right about it, and what does it cost?",
  "The junior is half right: recovery only replays the WAL written after the last checkpoint, so more frequent checkpoints mean a shorter recovery. But every checkpoint flushes all dirty pages, and after a checkpoint the first change to each page writes a full page image into the WAL (`full_page_writes`) — so both write I/O and WAL volume go up a lot."
 ],
 [
  "Production",
  "At 6 pm, `DELETE FROM orders;` was run on prod by mistake. What will you do now, and what will you change in the backup setup?",
  "The dump can only bring back orders up to 2 am — the deleted orders placed between 2 am and 6 pm (and their `order_items`, via the cascade) are not in any backup, and the replica is no use either because the `DELETE` has already been applied there too. Restore the dump on a separate server and put only the missing rows back into prod; going forward, set up a base backup + continuous WAL archiving (PITR) so you can restore to just before the delete."
 ],
 [
  "Production",
  "You started logical replication for an upgrade. What will the last two statements of this script output on the primary?",
  "The `INSERT` succeeds (`INSERT 0 1`), but the `UPDATE` throws an ERROR right on the primary: the table has no replica identity (PK) and the publication publishes updates. In other words, as soon as the publication is created, the app's `UPDATE`/`DELETE` statements start failing in production — it is not just a case of 'it won't replicate'."
 ],
 [
  "Production",
  "The primary's disk is 94% full. The tables are a normal size, but `pg_wal` has grown to 380 GB. What will you check, and in what order?",
  "`pg_wal` only grows this far beyond `max_wal_size` when something is preventing WAL from being recycled — most commonly an inactive or lagging replication slot (a removed replica, a stopped CDC connector) or a failing `archive_command`. Check `pg_replication_slots` and `pg_stat_archiver`, confirm the slot is dead and run `pg_drop_replication_slot()` (never delete the files by hand), and set up `max_slot_wal_keep_size` + alerts."
 ],
 [
  "Production",
  "Every hour, `REFRESH MATERIALIZED VIEW monthly_sales;` runs for 40 seconds. What happens to the dashboard's `SELECT` during that time?",
  "A plain `REFRESH MATERIALIZED VIEW` holds an `ACCESS EXCLUSIVE` lock on the matview, so every `SELECT` from the dashboard waits (hangs) for 40 seconds."
 ],
 [
  "Production",
  "This trigger raises no error, but a week later the data team complains. What is the bug, and what will its impact be?",
  "An `AFTER` row trigger runs after the row has already been written, so both the change to `NEW` and the return value are ignored — `updated_at` stays stuck at its old value (from insert or column-add time) without any error, and the nightly sync never picks up the changed orders. Fix: `BEFORE UPDATE ... FOR EACH ROW`."
 ],
 [
  "Production",
  "This procedure runs fine from psql but fails every time from the job runner. Why, and what is the right fix?",
  "A `COMMIT` inside a procedure only works when the `CALL` itself is top-level (autocommit); inside the job runner's `BEGIN`, the very first `COMMIT` raises an 'invalid transaction termination' error and all the work is rolled back. Fix: `CALL` this job without a transaction wrap — removing the `COMMIT` is the wrong fix."
 ],
 [
  "Production",
  "On this monthly partitioned `orders` table, which query can skip the other partitions through partition pruning?",
  "`placed_at >= now() - interval '7 days'`. Here the bare partition key is compared to a value. `now()` isn't fixed at plan time, so pruning happens at executor startup (today, 21 Sep 2026, `EXPLAIN` shows `Subplans Removed: 32`)."
 ],
 [
  "Production",
  "These constraints were added to stop duplicate orders on the partitioned `orders` table. What will happen, and how would you prevent duplicates?",
  "The first `ALTER` errors, because on a partitioned table every UNIQUE/PRIMARY KEY must include the partition key (`placed_at`). The developer's 'fix' runs but is useless: the retry has a different `placed_at`, so a duplicate order still gets created. The right way: a separate non-partitioned `idempotency_keys` table (PRIMARY KEY on the key), inserted in the same transaction as the order."
 ],
 [
  "Production",
  "Since midnight on 1 October, every `INSERT` into `events` has been failing. What happened, what's your fix right now, and what about your teammate's advice?",
  "The October partition was never created (the cron failed) and there was no DEFAULT partition either, so no partition exists for any row from 1 Oct onward and every `INSERT` errors. Right now, create `events_2026_10` (and the coming months) immediately; DEFAULT is a safety net, not a cure: if rows land in it, creating the October partition later will itself fail until you move those rows out."
 ],
 [
  "Production",
  "What's wrong with this customers list endpoint? What can an attacker achieve, and how would you fix it?",
  "Both inputs are concatenated straight into the SQL string, so there is SQL injection: `city` = `x' OR '1'='1` leaks every customer's name and email, and through `sort` any SQL fragment can be injected. Fix: a parameter for `city` (`WHERE city = $1`), and an allowlist for `sort`, because column names can't be parameters."
 ],
 [
  "Production",
  "In this multi-tenant setup, what will the final `SELECT count(*)` return?",
  "It returns 5. `shop_app` owns the table, and the table owner bypasses RLS policies by default unless you apply `ALTER TABLE orders FORCE ROW LEVEL SECURITY` (superusers and `BYPASSRLS` roles bypass them even after FORCE)."
 ],
 [
  "Production",
  "The DBA also ran `ALTER DEFAULT PRIVILEGES`, so why is there still a `permission denied` on the new table? What's the fix?",
  "`ALTER DEFAULT PRIVILEGES` without `FOR ROLE` applies only to objects created by **the same role** that ran the command (here `postgres`). `invoices` was created by `migrator`, which had no default privileges at all, and `GRANT ... ON ALL TABLES` applied only to the tables that existed at that moment. Fix: `ALTER DEFAULT PRIVILEGES FOR ROLE migrator ...` and a one-time `GRANT` on `invoices`."
 ],
 [
  "Production",
  "An 'instant' migration was deployed and the site was down for 4 minutes. What happened, what's your fix right now, and how will you prevent it in future?",
  "The `ALTER` needs an `ACCESS EXCLUSIVE` lock, which conflicts with the 20-minute `SELECT`'s `ACCESS SHARE`, so the ALTER is waiting. And because of the lock queue, every new `SELECT`/`UPDATE` behind the ALTER is stuck too. Now: cancel the ALTER (pid 5120), and the queue clears immediately. Going forward: a short `lock_timeout` + retry in every migration, and move long analytics queries off the primary or give them a `statement_timeout`."
 ],
 [
  "Production",
  "After adding a `NOT VALID` constraint, what will each of these four statements return?",
  "1 fails (the new row is checked). 2 also fails: only `item` changed, but the UPDATE writes a new row version in which `qty = -5`. 3 succeeds (`UPDATE 1`). 4 fails, because the old `atta` row is still `-5`."
 ],
 [
  "Production",
  "A junior's migration: prices from rupees to paise. What will happen in production, and how would you make it zero-downtime?",
  "The type change rewrites the whole 80-million-row table under an `ACCESS EXCLUSIVE` lock: reads/writes blocked for minutes to hours, extra disk, a mountain of WAL and replica lag. After the rename, during the rolling deploy, old pods will look for `unit_price` and fail. The right way: expand (new column) → dual write → batched backfill → safe NOT NULL → switch reads → contract (drop the old column)."
 ],
 [
  "Production",
  "The orders list API is slow. The top entry from `pg_stat_statements` is below. What is the best fix?",
  "This is N+1: ~50 customer queries for every call of the orders query. The fix is in the app code: fetch the customers in a single query, `JOIN` or `WHERE id = ANY($1)` (the ORM's eager load / `include`)."
 ],
 [
  "Production",
  "During the Diwali sale, checkout exhausted the DB pool and every order for one product got stuck. What is wrong with this flow?",
  "The external HTTP call is inside the transaction, so the `products` row lock and the DB connection are held for 2-30 seconds. Other checkouts for the same product queue on that row lock, connections sit tied up in `idle in transaction` (pool exhausted), and if the charge goes through but `COMMIT` fails, the money is taken and the order is gone. Fix: DB work in short transactions, the gateway call outside, a `status` state machine + idempotency key."
 ],
 [
  "Production",
  "As soon as PgBouncer transaction mode went in, three strange bugs appeared. What is the root cause of each, and what's the fix?",
  "In transaction mode a client gets a server connection for only one transaction, so session-level state (session `SET`/`set_config(..., false)`, server-side prepared statements, `LISTEN`, session advisory locks, temp tables) gets left on the wrong connection or lost. (1) Fix: `BEGIN` + `set_config(..., true)` (i.e. `SET LOCAL`) in the same transaction. (2) Turn on `max_prepared_statements` in PgBouncer 1.21+ or disable server-side prepared statements in the driver. (3) A separate direct connection for `LISTEN`."
 ],
 [
  "Modern Postgres",
  "What will this query output? Give the value of all four columns.",
  "`j` shows the input exactly as is (both `city` keys and the double space); in `jb` only the last `city` (`Vapi`) survives and the extra space is removed; `arrow` is jsonb, so it has quotes: `\"Vapi\"`, and `arrow2` is text: `Vapi`."
 ],
 [
  "Modern Postgres",
  "What will this textile shop query output? Which products will appear in the list?",
  "Only `Dupatta` and `Saree` — `->>` returns text and `'500'` is text too, so the comparison is character by character: `'90' > '500'` is true, `'1200' > '500'` is false. Correct query: `(attrs ->> 'price')::numeric > 500` (then `Chaniya choli`, `Saree`)."
 ],
 [
  "Modern Postgres",
  "`events.payload` has a GIN index, yet this query does a Seq Scan. Why, and how would you fix it?",
  "The default GIN (`jsonb_ops`) only serves the jsonb operators — `@>`, `?`, `?|`, `?&`, `@?`, `@@`; `payload ->> 'user_id' = '42'` is `=` on a text expression, which a GIN index cannot handle. Fix: rewrite the query as `payload @> '{\"user_id\": 42}'` (a number, not a string), or create a B-tree expression index on that field and use exactly the same expression in the query."
 ],
 [
  "Modern Postgres",
  "A user typed `shirts` into the search box. What will `like_hit` and `fts_hit` be for each product?",
  "LIKE only catches names that contain the exact substring `shirts` (`Formal Shirts`, `Sweatshirts`, `T-shirts pack`). FTS catches `Cotton Shirt`, `Formal Shirts`, `Shirting fabric`, `T-shirts pack`, but misses `Sweatshirts`."
 ],
 [
  "Modern Postgres",
  "The admin panel's product search also matches text in the middle of names and takes ~2 s on 2 million rows. Write the index + query.",
  "`pg_trgm` extension + a GIN trigram index on `name` (`gin_trgm_ops`); the query's `ILIKE '%...%'` stays exactly the same, and for a selective term it now runs via a Bitmap Index Scan. A B-tree cannot use the index at all for a pattern with a leading `%`."
 ],
 [
  "Modern Postgres",
  "The `documents` table for a new RAG feature is empty today; thousands of chunks will be added every day. What is the right vector index decision?",
  "Build HNSW now. The HNSW graph is updated with every insert and needs no training data; IVFFlat's cluster centers (`lists`) are computed from the data present at build time, so an IVFFlat built on an empty table is stuck with useless centers."
 ],
 [
  "Modern Postgres",
  "Three vectors and pgvector's three distance operators — what will this query output?",
  "id 1 → `0, 0, -1`; id 2 → `2, 2, 1`; id 3 → `0, 3, -4`. Cosine distance only looks at direction (so `[4,0]` is also 0), L2 is straight-line distance, and `<#>` returns the negative of the dot product."
 ],
 [
  "Modern Postgres",
  "A support dashboard has an LLM generate SQL and runs it directly. What are the risks, and which layers would you add on the DB side?",
  "The prompt and the regex are not a security boundary — the LLM will make mistakes or a user will try prompt injection, and the query runs as the table owner role, which can do DDL/DELETE and also bypasses RLS. The real wall has to be in the DB: a separate role with only the necessary `SELECT`, `statement_timeout` + auto `LIMIT`, DB-level tenant isolation, and an audit log + showing the SQL to the user."
 ],
 [
  "Modern Postgres",
  "Tenant 42 has 100 chunks, yet this query returns sometimes 2, sometimes 0 rows instead of 10. What is the most accurate reason?",
  "The HNSW index scan returns only the ~`ef_search` (default 40) nearest candidates from the whole table, and `WHERE tenant_id = 42` is applied after that. Tenant 42 is tiny (0.001%), so its rows rarely appear among those 40 — once the candidates run out the scan ends, and `LIMIT 10` is left unfilled."
 ],
 [
  "Modern Postgres",
  "Team: 'The new embedding model also outputs 1536 dims, just change the model name in the config.' What do you say, and how would you do the switch?",
  "Just changing the config throws no error (the dims match), but the new model's query vector gets compared against the old model's document vectors — two models have different vector spaces, so the distances are meaningless and search silently returns garbage. All chunks have to be re-embedded with the new model, done the expand → backfill → switch → contract way, with no downtime."
 ],
 [
  "Modern Postgres",
  "Loading dock bookings are getting double-booked. Compare four fixes — which one would you pick for production, and why?",
  "This is a check-then-insert race: two requests saw `count = 0` at the same time and both inserted — in READ COMMITTED nobody can lock a row that doesn't exist yet. The most robust fix: `EXCLUDE USING gist (dock_id WITH =, tstzrange(starts_at, ends_at) WITH &&)` (with `btree_gist`) — the database itself prevents overlaps, for every code path; the app just turns the `23P01` error into 'this slot was just booked'."
 ],
 [
  "Modern Postgres",
  "A 3-year-old events table with 100 million rows: slow dashboard, growing disk, painful DELETE. What is the plan, and in what order?",
  "Measure first, then solve the two separate problems separately: for the dashboard, an index on `created_at` (B-tree right away; BRIN when the physical order is time-sorted) or a rollup table; for retention, monthly RANGE partitioning so old data goes away instantly via DETACH + DROP, with no bloat and no WAL flood. Migration without downtime: a new partitioned table + a batched backfill of only 12 months + a short rename swap (or attaching the old table as a legacy partition), and finally DROP the old table."
 ]
];
