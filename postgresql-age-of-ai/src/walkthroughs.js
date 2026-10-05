// Guided experiments add an observable result to the conceptual lessons.
export const walkthroughs={
'Create your own database':{
 question:'What changes when you create a database? The server remains the same process; its cluster gains another named database.',
 steps:['Connect to the running PostgreSQL server with psql.','Run CREATE DATABASE learning while connected to a different database.','Reconnect with psql -d learning; create schema app and a table.','Insert one row, then query it and inspect the schema with \\dt.'],
 observe:'current_database() returns learning only after reconnecting. app is a schema inside learning; it is not another server.',
 decision:'Keep schema creation in migrations after the first experiment.'},
'Table, row, column and physical tuple':{
 question:'What is the difference between a logical row and a stored tuple version?',
 steps:['SELECT id,name FROM users WHERE id=1.','UPDATE users SET name=\'Atif Updated\' WHERE id=1.','Query the same row again and inspect xmin with SELECT xmin,id,name FROM users WHERE id=1.'],
 observe:'The logical user is still id 1. PostgreSQL can store a newer physical version and make it visible after commit.',
 decision:'Use a primary key for logical identity; do not use xmin as an application ID.'},
'Mathematical relation versus relationship':{
 question:'Does a foreign key create a shortcut to related rows?',
 steps:['Inspect donors.agency_id and agencies.id.','Try INSERT INTO donors(id,agency_id,name) VALUES (99,999,\'No Agency\').','See the foreign-key violation; then run a JOIN to retrieve names.','EXPLAIN the JOIN and inspect whether an index participates.'],
 observe:'The constraint rejects invalid references. The JOIN is a separate read operation and planner choice.',
 decision:'Keep FKs for integrity and add indexes for measured access patterns.'},
'JOINs and missing matches':{
 question:'Which agencies survive when they have no donor?',
 steps:['Run the LEFT JOIN in the lesson against the study schema.','Find East, which has no donor, in the result.','Move a donor filter from ON to WHERE and compare results.'],
 observe:'East remains with NULL donor fields in a LEFT JOIN. A WHERE filter on the right table can remove that NULL-extended row.',
 decision:'Write and test outer-join filters deliberately.'},
'Read SELECT in logical order':{
 question:'Why can HAVING use count(*) while WHERE cannot?',
 steps:['Filter active donor rows with WHERE.','Group the remaining rows by agency_id.','Filter grouped counts with HAVING and order the output.'],
 observe:'WHERE acts on individual input rows; HAVING sees completed groups. SELECT then shapes the displayed columns.',
 decision:'Check intermediate row counts when a long query surprises you.'},
'Types, NULL and time':{
 question:'What does SQL do with unknown?',
 steps:['Run SELECT NULL = NULL and observe NULL, not true.','Run SELECT NULL IS NULL and observe true.','Compare now() with now() AT TIME ZONE \'UTC\'.'],
 observe:'NULL participates in three-valued logic. timestamptz represents an instant and is displayed in a session time zone.',
 decision:'Use IS NULL for missing values and store real instants with timestamptz.'},
'ACID is four different guarantees':{
 question:'Can one side of a transfer commit alone?',
 steps:['BEGIN; update account 1 and account 2.','SELECT both balances before COMMIT in the same session.','ROLLBACK; query again in a new statement.','Repeat and COMMIT; query from a second session.'],
 observe:'ROLLBACK abandons both changes. COMMIT makes both updates visible to a later suitable snapshot. Isolation still needs thought for concurrent transfers.',
 decision:'Keep the whole business invariant inside one transaction and test concurrent execution.'},
'Two writers and one reader':{
 question:'Who waits when three sessions touch the same row?',
 steps:['Session A: BEGIN; UPDATE accounts SET balance=9000 WHERE id=1; leave it open.','Session B: UPDATE accounts SET balance=8000 WHERE id=1; it waits.','Session C: SELECT balance FROM accounts WHERE id=1; it sees the committed version.','Session A: COMMIT; observe B complete, then read again.'],
 observe:'B waits for A’s row lock. A plain snapshot read in C normally uses a committed row version. Waiting time depends on when A ends.',
 decision:'Inspect wait_event_type and transaction age before changing pool size or query syntax.'},
'Read an execution plan':{
 question:'Did an index change work or just the label of the plan?',
 steps:['Seed the real performance lab before presenting.','Run EXPLAIN (ANALYZE, BUFFERS) on the email query.','Read Plan Rows, Actual Rows, loops, Rows Removed by Filter and block activity.','Create the matching index and rerun the exact SQL.'],
 observe:'A selective index often reduces scanned work, but actual timing and plan choice depend on the machine and dataset. Prepared mode shows structure without invented timings.',
 decision:'Compare real measurements and query correctness, not an assumed speedup.'},
'Dead tuples and normal VACUUM':{
 question:'Why did the table file not shrink after DELETE?',
 steps:['Inspect pg_total_relation_size before changes.','Update or delete a group of rows and inspect table statistics.','Run VACUUM (ANALYZE), then inspect reusable space and estimates.'],
 observe:'Normal VACUUM makes eligible space reusable inside PostgreSQL. It usually does not return the table file’s space to the OS.',
 decision:'Look for long transactions and autovacuum activity before considering a rewrite.'},
'View versus materialized view':{
 question:'Why does one named query change immediately while the other stays stale?',
 steps:['Create a view and materialized view over orders.','Insert one new order, then query both objects.','Run REFRESH MATERIALIZED VIEW and query again.'],
 observe:'A normal view runs against current base rows. A materialized view serves its stored result until refresh.',
 decision:'State a freshness target before choosing materialization.'},
'Pool sizing is a queueing problem':{
 question:'What happens to 100 concurrent DB jobs with a 20-connection pool?',
 steps:['Set requests to 100 and pool size to 20 in the visual.','Observe up to 20 busy connections and the rest waiting initially.','Increase pool size, then ask whether DB CPU or locks can sustain the added active work.'],
 observe:'A pool bounds DB concurrency; it does not multiply CPU. Waiting and timeouts are application-level outcomes.',
 decision:'Tune pool size using queue wait, query time and DB saturation together.'},
'Serverless versus managed instance versus self-host':{
 question:'What changes when the same app is idle overnight and busy at noon?',
 steps:['Select prototype/bursty in the hosting visual and list wake latency, connection and working-set risks.','Select steady/critical and list instance sizing, backup and availability needs.','Select self-host and list patching, restore and failover responsibilities.'],
 observe:'The same PostgreSQL SQL can run in each option; compute behavior and operational responsibility differ.',
 decision:'Load-test realistic p95 latency and estimate both active and idle periods before choosing.'},
'Roles, grants and RLS':{
 question:'Can a tenant read rows simply because the browser sent a tenant_id?',
 steps:['Create a restricted role and grant only needed table operations.','Enable RLS and define a policy using trusted session identity.','Test as tenant A, tenant B, anonymous and a privileged role.'],
 observe:'The policy filters by the trusted identity context. Ownership or BYPASSRLS can change behavior.',
 decision:'Treat browser-supplied tenant IDs as untrusted and test policies through the real API role.'},
'What Supabase builds on PostgreSQL':{
 question:'Which Supabase component answers a sign-in, a table read and a file request?',
 steps:['Trace sign-in through Auth and its database-backed identity data.','Trace a table request through API role, grants and RLS.','Trace a file request through Storage metadata/policy and object bytes.','Trace Realtime as a separate change-delivery service.'],
 observe:'PostgreSQL is the transactional data core; Auth, API, Storage, Realtime and Functions are distinct services with their own boundaries.',
 decision:'Design policies and secrets at each service boundary, not only at the table.'},
'Exact vector search and approximate indexes':{
 question:'What do you give up to make a large nearest-neighbor search faster?',
 steps:['Store vectors from one embedding model with one distance metric.','Run an exact ORDER BY distance LIMIT K query as the quality baseline.','Add an ANN index and compare latency and overlap with exact top K on real queries.'],
 observe:'HNSW or IVFFlat can reduce search work while possibly changing which neighbors are returned. Metadata filters can change recall.',
 decision:'Choose index settings against a labeled query set and measured latency target.'},
'RAG as visible evidence flow':{
 question:'What did the model actually receive before it answered?',
 steps:['Chunk and embed source documents.','Embed a question and retrieve top K from pgvector.','Show chunk IDs and text before calling the LLM.','Pass only authorized chunks as context and inspect citations in the answer.'],
 observe:'Retrieval and generation are separate steps. A fluent answer can still be unsupported if the retrieved evidence is wrong.',
 decision:'Evaluate retrieval separately and preserve document provenance.'}
};
