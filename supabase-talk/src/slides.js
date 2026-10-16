export const sources = {
  architecture: 'https://supabase.com/docs/guides/getting-started/architecture',
  database: 'https://supabase.com/docs/guides/database/overview',
  api: 'https://supabase.com/docs/guides/api',
  rpc: 'https://supabase.com/docs/guides/database/functions',
  openapi: 'https://supabase.com/docs/reference/javascript/getopenapispec',
  autoDocs: 'https://supabase.com/docs/guides/api/rest/auto-generated-docs',
  auth: 'https://supabase.com/docs/guides/auth/architecture',
  rls: 'https://supabase.com/docs/guides/database/postgres/row-level-security',
  keys: 'https://supabase.com/docs/guides/getting-started/api-keys',
  storage: 'https://supabase.com/docs/guides/storage/schema/design',
  realtime: 'https://supabase.com/docs/guides/realtime/architecture',
  functions: 'https://supabase.com/docs/guides/functions/architecture',
  queues: 'https://supabase.com/docs/guides/queues',
  cron: 'https://supabase.com/docs/guides/cron',
  local: 'https://supabase.com/docs/guides/local-development/cli-workflows',
  connect: 'https://supabase.com/docs/guides/database/connecting-to-postgres',
  compute: 'https://supabase.com/docs/guides/platform/compute-and-disk',
  reports: 'https://supabase.com/docs/guides/observability/reports',
  queryStats: 'https://supabase.com/docs/guides/database/extensions/pg_stat_statements',
  connectionManagement: 'https://supabase.com/docs/guides/database/connection-management',
  realtimeReports: 'https://supabase.com/docs/guides/realtime/reports',
  timeouts: 'https://supabase.com/docs/guides/database/postgres/timeouts',
  funding: 'https://www.prnewswire.com/news-releases/supabase-raises-500m-at-10-5b-to-accelerate-lead-in-agentic-infrastructure-302791787.html',
  adoption: 'https://supabase.com/blog/series-f',
  billing: 'https://supabase.com/docs/guides/platform/billing-on-supabase',
  pricing: 'https://supabase.com/pricing',
  pausing: 'https://supabase.com/docs/guides/platform/free-project-pausing',
  backups: 'https://supabase.com/docs/guides/platform/backups'
};

export const slides = [
  {
    id:'opening', chapter:'THE IDEA', tag:'01 / THE IDEA', title:'Supabase, from idea to production',
    lead:'We will build one private taskboard and name the job of every Supabase service it uses.',
    takeaway:'A Supabase project is Postgres plus services for identity, requests, files, live events and server-side work.', duration:60,
    definitions:[['Supabase','A hosted backend centered on PostgreSQL, with connected services for common app needs.']],
    example:'Atif signs in, saves a task, attaches a PDF and sees the update on another screen.',
    visual:'opening', steps:['Save data','Sign in','Read tasks','Attach file','See update'],
    notes:'Begin with the taskboard, not company size. Ask where each action runs. The next screen gives one-line definitions before tracing the request path. The product is a platform around PostgreSQL, not a replacement database engine.',
    deep:'A Supabase project has a dedicated Postgres database and several services around it. The platform handles common backend infrastructure, while the app team still designs the schema, policies and request behavior.',
    source:['architecture','database']
  },
  {
    id:'stack', chapter:'THE IDEA', tag:'02 / THE IDEA', title:'What is Supabase?',
    lead:'PostgreSQL at the core, with Data API, Auth, Storage, Realtime, Edge Functions, Queues and Cron around it.',
    takeaway:'Each service has a distinct job; Postgres remains the shared data core.', duration:145,
    definitions:[['Postgres','The database that stores application rows, policies and transactions.']],
    example:'A task row lives in Postgres; its PDF lives in object storage; the other services control how users reach them.',
    visual:'stack', steps:['Identity + rows','Files + events','Code','Background jobs'],
    notes:'Read the one-line service definitions first. Then trace a task request: browser → gateway → Data API → Postgres with RLS. Auth provides identity. Storage handles file bytes. Realtime delivers events. Edge Functions run trusted code. Queues hold messages for a consumer; Cron starts recurring jobs. Queues and Cron are Postgres-backed and are not inbound gateway routes.',
    deep:'The gateway routes requests to dedicated services including Auth, PostgREST for the Data API, Realtime, Storage and Edge Functions. Supabase Queues builds on the pgmq Postgres extension; Cron uses pg_cron. Storage file bytes live in object storage while metadata lives in Postgres. Studio is a management UI, not the request path.',
    source:['architecture','storage','queues','cron']
  },
  {
    id:'fit', chapter:'THE IDEA', tag:'03 / THE IDEA', title:'When is it a good fit?',
    lead:'Choose by workload and team needs, not by the number of features on a pricing page.',
    takeaway:'It shines when one product needs relational data, user identity and fast delivery.', duration:125,
    definitions:[['Good fit','A product whose main data is related records and whose team needs auth, files or live updates.']],
    example:'A taskboard needs users, tasks, attachments and notifications in one project.',
    visual:'fit', steps:['Product MVP','Collaborative app','Specialized workload'],
    notes:'Use the three scenarios. A product MVP benefits from integrated services; a collaborative app benefits from Auth, RLS and Realtime. A specialized workload may need extra services or a different primary store.',
    deep:'Evaluate data model, query patterns, residency, operations, cost, team skills and migration options. Supabase gives direct Postgres access and standard SQL, but managed services still have platform-specific configuration and operational limits.',
    source:['architecture','compute']
  },
  {
    id:'app', chapter:'BUILD THE APP', tag:'04 / BUILD THE APP', title:'Our example: a private taskboard',
    lead:'A user signs in, creates a task, attaches a file and sees changes appear on another screen.',
    takeaway:'Each requirement maps to a Supabase service and a clear boundary.', duration:105,
    definitions:[['Project','One database plus its connected APIs and services.']],
    example:'One saved task touches Auth, Data API, RLS and Postgres; an attachment also uses Storage.',
    visual:'app', steps:['Sign in','Save task','Attach file','See update'],
    notes:'Keep returning to this same app. It prevents the deck from becoming a list of disconnected product names.',
    deep:'The client can use the Supabase SDK for Auth, Data API, Storage and Realtime. Edge Functions are useful for trusted server-side work, but a custom API server remains a valid choice for complex domain logic.',
    source:['architecture','auth','storage','realtime']
  },
  {
    id:'data', chapter:'BUILD THE APP', tag:'05 / BUILD THE APP', title:'First, design the data',
    lead:'A table has named columns; each row is one task. PostgreSQL enforces types, keys and relationships.',
    takeaway:'Supabase starts with a real relational database, so schema quality still matters.', duration:145,
    definitions:[['Table','A collection of records with named, typed columns.'],['Row','One record in that table.']],
    example:'Task 101 is one row; owner_id links it to the user who may see it.',
    visual:'data', steps:['Table','Column','Row','Key'],
    sql:`create table public.tasks (\n  id bigint generated always as identity primary key,\n  owner_id uuid not null references auth.users(id),\n  title text not null,\n  done boolean not null default false\n);`,
    notes:'Explain table, column and row briefly. The primary key identifies a task; owner_id points to the signed-in user. The CREATE TABLE statement is DDL, and an INSERT or UPDATE changes rows.',
    deep:'A foreign key checks that the referenced user exists; it does not copy the user row into the task. The table resides in Postgres, including indexes and WAL, on the project database compute and storage. Use migrations to version the schema.',
    source:['database','auth','local']
  },
  {
    id:'api', chapter:'BUILD THE APP', tag:'06 / BUILD THE APP', title:'Data API + OpenAPI: request vs description',
    lead:'The Data API serves task requests. OpenAPI describes the exposed REST endpoints for people and tools.',
    takeaway:'Data API runs requests; OpenAPI documents the API surface. Neither replaces access policies.', duration:150,
    definitions:[['Data API','Generated REST endpoints for exposed Postgres tables, views and functions.'],['RPC','A remote call to a PostgreSQL function that executes inside the project database.'],['OpenAPI','A machine-readable description of those endpoints.']],
    example:'GET /rest/v1/tasks asks for rows; the OpenAPI document describes that route.',
    visual:'api', steps:['Client call','JWT + key','Data API','RLS + rows'],
    code:`const { data, error } = await supabase\n  .from('tasks')\n  .select('id, title, done')\n  .order('id', { ascending: false });`,
    notes:'Show the exact client call and REST route. The frontend sends a publishable key plus a signed-in user token. PostgREST serves the Data API request; the generated OpenAPI document describes the routes, rather than processing a second request. Supabase rpc() follows the API route to a PostgreSQL function, and that function executes inside the project database. It is not a separately deployed EC2 service or an Edge Function. In the dashboard, Data API Docs shows the generated endpoints. The next slide explains row access.',
    deep:'PostgREST exposes tables, views and functions from configured schemas as REST endpoints, subject to grants and RLS. An RPC function consumes the project Postgres instance’s CPU, memory, connections and query capacity. Supabase provides a dedicated Postgres instance per project; smaller compute tiers can still use shared CPU. The infrastructure is managed by Supabase, but database functions are not independently autoscaled serverless workers. Edge Functions are a separate server-side runtime. Function execution privileges depend on SECURITY INVOKER or SECURITY DEFINER, so review grants and RLS carefully. Its OpenAPI specification describes the endpoints visible to the requesting role. For a backend with long-lived connections, a direct or session connection may fit; browser code should not contain a raw database password.',
    source:['api','openapi','autoDocs','connect','keys','rpc','compute']
  },
  {
    id:'security', chapter:'TRUST', tag:'07 / TRUST', title:'Auth says who. RLS says which rows.',
    lead:'Sign-in creates identity; a database policy decides what that identity may read or change.',
    takeaway:'The publishable key is safe for clients only when grants and RLS protect the data.', duration:175,
    definitions:[['Auth','Signs users in and provides identity tokens to the app.'],['RLS','Postgres rules that decide which rows a user may access.']],
    example:'Atif and Asha make the same tasks request but receive only their own rows.',
    visual:'security', steps:['Atif','Asha'],
    sql:`alter table public.tasks enable row level security;\n\ncreate policy "read own tasks" on public.tasks\nfor select to authenticated\nusing ((select auth.uid()) = owner_id);`,
    notes:'Switch between Atif and Asha. The same query returns different task rows because the policy is checked inside Postgres. Explain that a secret or service-role key must never be shipped to the browser.',
    deep:'RLS is PostgreSQL row-level security. Supabase Auth supplies JWT identity, and auth.uid() exposes the current user ID inside policy expressions. A SELECT policy alone does not grant INSERT/UPDATE/DELETE; add operation-specific policies. Grants are checked before RLS. Views can bypass underlying table RLS unless configured carefully, such as security_invoker on supported Postgres versions.',
    source:['auth','rls','keys']
  },
  {
    id:'storage', chapter:'CAPABILITIES', tag:'08 / CAPABILITIES', title:'Files live beside your rows',
    lead:'Storage handles file bytes; Postgres keeps bucket and object metadata. Policies govern access.',
    takeaway:'Use Storage APIs for file operations and RLS for private bucket access.', duration:110,
    definitions:[['Storage','A file service that stores object bytes and tracks their metadata in Postgres.']],
    example:'brief.pdf goes into a private bucket; the task row stores its path.',
    visual:'storage', steps:['Upload','Policy','Metadata','Object'],
    code:`await supabase.storage\n  .from('task-files')\n  .upload('users/atif/brief.pdf', file);`,
    notes:'A PDF is not stored as a giant cell in our tasks table. A Storage request checks authorization, writes metadata and places the file bytes in object storage.',
    deep:'Storage metadata lives in the storage schema. Actual object bytes live in an object storage provider. Use the Storage API for upload, move and delete: direct SQL edits to storage metadata do not manage the underlying object. Private buckets use policies on storage.objects.',
    source:['storage']
  },
  {
    id:'realtime', chapter:'CAPABILITIES', tag:'09 / CAPABILITIES', title:'One change, many screens',
    lead:'Realtime connects clients through WebSockets for database changes, Broadcast and Presence.',
    takeaway:'Use the right event path; do not turn every database write into a global notification.', duration:115,
    definitions:[['Realtime','WebSocket channels that deliver database changes, app messages or online presence.']],
    example:'When Atif updates a task, another subscribed screen can show the change.',
    visual:'realtime', steps:['Database Changes','Broadcast','Presence'],
    notes:'Click through the three modes. Database Changes delivers selected row changes; Broadcast is app messages; Presence shows who is online. The two browser cards update in the demo.',
    deep:'Database Changes relies on Postgres logical replication and a publication; it has different scaling and authorization costs from Broadcast. Presence tracks shared state. Design channels and filters around the audience that actually needs the event.',
    source:['realtime']
  },
  {
    id:'functions', chapter:'CAPABILITIES', tag:'10 / CAPABILITIES', title:'Where trusted code runs',
    lead:'An Edge Function can verify a request, use server-only secrets, call an external API and return a result.',
    takeaway:'Keep privileged keys and external service secrets on the server side.', duration:110,
    definitions:[['Edge Function','Server-side code invoked by an HTTP request or another event.']],
    example:'A function checks permission, then calls a mail provider with a secret key.',
    visual:'functions', steps:['Request','Verify','Secret/API','Response'],
    notes:'Use task summary emails as an example. A browser calls the function; the function checks authorization and calls a mail provider with a secret. Never send a service-role key to the browser.',
    deep:'Edge Functions use a Deno-based runtime. Design for retries, timeouts and idempotency when handling webhooks or external side effects. Complex long-running jobs may need a queue and worker instead of a request path.',
    source:['functions','keys']
  },
  {
    id:'async', chapter:'CAPABILITIES', tag:'11 / CAPABILITIES', title:'Queues + Cron: work later or on a schedule',
    lead:'A queue holds background tasks until a consumer processes them. Cron starts recurring work at a chosen time.',
    takeaway:'Queued work needs a consumer; a schedule can trigger SQL or a function. These solve different timing needs.', duration:180,
    definitions:[['Queues','Postgres-backed messages that wait for a worker to process them.'],['Cron','A scheduler that runs SQL or invokes a function at set times.']],
    example:'Queue an email after a task is created; run a daily task count at 09:00.',
    visual:'async', steps:['Request','Queue','Consumer','Schedule'],
    sql:`-- Enable pgmq and pg_cron in the project first.\nselect pgmq.create('task_notifications');\nselect pgmq.send('task_notifications', '{"task_id":101}'::jsonb);\n\ncreate table if not exists public.daily_task_counts (\n  day date primary key, total bigint not null\n);\nselect cron.schedule('daily-task-count', '0 9 * * *',\n  $$ insert into public.daily_task_counts(day, total)\n     select current_date, count(*) from public.tasks\n     on conflict (day) do update set total = excluded.total $$);`,
    notes:'Use a taskboard example: after a task is created, add an email job to the queue, return to the user immediately, then let a worker fetch and acknowledge the job after success. Cron is separate: each morning it runs a scheduled database job. A queue does not send email by itself, and Cron does not automatically consume queue messages.',
    deep:'Supabase Queues uses the pgmq extension in Postgres. Its consumer must read messages, perform work, and archive or delete successfully processed messages. Plan for retries and idempotent side effects. Supabase Cron uses pg_cron and can schedule SQL, database functions, or HTTP/Edge Function calls; schedules use the database cron timezone. The SQL example creates the queue and count table but assumes pgmq and pg_cron are enabled and public.tasks exists. It illustrates commands rather than a connected live project.',
    source:['queues','cron','functions']
  },
  {
    id:'workflow', chapter:'SHIP IT', tag:'12 / SHIP IT', title:'From laptop to production',
    lead:'Keep schema changes in migrations, test locally, review changes and deploy deliberately.',
    takeaway:'A Supabase project is easiest to maintain when the database is versioned like code.', duration:135,
    definitions:[['Migration','A versioned SQL change that can be reviewed and applied to a project.']],
    example:'The tasks table starts in a migration committed with the application code.',
    visual:'workflow', steps:['Local stack','Migration','Review','Deploy'],
    code:`npx supabase init\nnpx supabase start\nnpx supabase migration new create_tasks\nnpx supabase db reset\n# review before applying to a linked project\nnpx supabase db push --dry-run`,
    notes:'The CLI starts a local development stack with Docker. Show the migration file in Git. For a remote project, preview the pending migrations before applying them. Never run a destructive reset against production.',
    deep:'Local development is for testing, not public traffic. A reproducible project contains migrations and seed data. Generate client types if useful; keep project secrets out of Git. Production deployment should include review and a rollback or forward-fix plan.',
    source:['local']
  },
  {
    id:'plans', chapter:'SHIP IT', tag:'13 / SHIP IT', title:'Free or paid: what changes the decision?',
    lead:'Both plans include the core services. Choose the plan by reliability, recovery and measured usage.',
    takeaway:'Free is for learning and low-stakes demos. Use Pro when real users depend on the app staying available and recoverable.', duration:135,
    definitions:[['Free','A $0 organization plan for learning and small projects that can tolerate pausing.'],['Pro','A paid organization plan with no inactivity pause, daily backups and larger included quotas.']],
    example:'The taskboard can start on Free. Move to Pro before customers rely on it or when backup and capacity needs exceed Free.',
    visual:'plans', steps:['Free fits','Pro fits','Check the bill'],
    notes:'Ask whether users can tolerate the project being paused and whether the team has a recovery plan. Free includes the database, Auth, Data API, Storage, Realtime and Edge Functions; it is not a different feature stack. Free projects can pause after low activity, have no automatic backups and have smaller limits. Pro prevents inactivity pausing, adds daily backups and larger included quotas. As checked on 15 October 2026, Free is $0 with up to two active projects; Pro starts at $25 per organization per month. Each additional project, larger compute, add-ons and overages can raise the bill. Monitor usage before and after upgrading.',
    deep:'Plan choice belongs to the organization, so projects in one organization cannot mix Free and Pro. Free currently includes 500 MB database size, 1 GB file storage, 5 GB egress, 50,000 monthly active users, 500,000 Edge Function invocations and 2 million Realtime messages; Free projects can pause after low activity. Pro includes no inactivity pause, daily database backups retained for seven days, larger quotas and a subscription starting at $25 per month. Paid compute, extra projects, add-ons and usage beyond included quotas can add cost. These are current published terms, not a guarantee of future pricing. Verify the pricing and billing pages before a purchase or a production estimate.',
    source:['pricing','billing','pausing','backups']
  },
  {
    id:'obs-intro', chapter:'OBSERVABILITY', tag:'14 / OBSERVABILITY', title:'What is observability?',
    lead:'It means seeing how the running backend behaves: what is busy, what is slow, and what is failing.',
    takeaway:'Metrics show patterns; logs show events; database activity shows what is happening right now.', duration:100,
    definitions:[['Metrics','Measurements recorded over time, such as request count or CPU use.'],['Logs','Records of individual requests, errors and system events.'],['Sessions','Open database connections and what they are doing now.']],
    example:'If saving a task slows down, compare request logs with database activity and query reports.',
    visual:'obs-intro', steps:['Question','Build it yourself','Supabase reports'],
    notes:'Use a car dashboard analogy: a speedometer tells you what is happening, but not automatically why. On a custom backend, the team wires up metrics collection, logs, charts and alerts for the API and database. Supabase Cloud provides built-in Reports, Query Performance and a live Connections view. Custom application code still needs its own logs and monitoring. Tell the audience that the next screens reconstruct the dashboard views they supplied; displayed examples are teaching illustrations, not live project metrics.',
    deep:'Observability is the practice of using system outputs to understand behavior. Metrics aggregate measurements over time; logs record discrete events; database statistics and live session snapshots answer different questions. Supabase Cloud Reports are available in hosted projects, with time-range and plan limits. A report is a starting point for diagnosis, not a guaranteed explanation or automatic fix.',
    source:['reports','connectionManagement']
  },
  {
    id:'obs-overview', chapter:'OBSERVABILITY', tag:'15 / OBSERVABILITY', title:'Overview: where should we look?',
    lead:'Start with the summary: slow queries, connections, disk, CPU, memory and service health.',
    takeaway:'A red flag tells you where to investigate; the detailed page tells you what happened.', duration:85,
    definitions:[['Overview','A summary of database and service signals for a selected time range.'],['Service health','Traffic and warning patterns for the services handling requests.']],
    example:'A slow-query warning sends us to Query Performance to identify the statement.',
    visual:'obs-overview', steps:['Database cards','Service health','Drill down'],
    notes:'In the supplied Overview screenshot, point at Slow Queries, Peak Connections, Disk Usage, Disk I/O, Memory and CPU, then the service health charts. Explain that 73% disk or 5% CPU are point-in-time project readings, not recommended targets. Select a time range, then open Query Performance, Database Connections or a product report. The screenshot itself does not list individual slow statements.',
    deep:'Overview cards combine signals with different time windows and refresh characteristics. CPU is work on compute, memory is RAM use, disk usage is capacity, and disk I/O is read/write activity. A count of slow queries is a prompt to inspect the Query Performance page. Service health panels summarize API Gateway, Database, PostgREST, Auth, Edge Functions, Storage and Realtime, but low or missing chart data can reflect low traffic or reporting delay.',
    source:['reports','compute']
  },
  {
    id:'obs-query', chapter:'OBSERVABILITY', tag:'16 / OBSERVABILITY', title:'Query Performance: slow or frequent?',
    lead:'One query may be slow per call. Another may be fast but run so often that its total cost is larger.',
    takeaway:'Read calls, time per call and total time together before deciding what to optimize.', duration:150,
    definitions:[['Calls','How many times a statement ran.'],['Mean time','Average duration of one execution.'],['Total time','Cumulative time across those executions.']],
    example:'A 5 ms query called 100,000 times can consume more time than one 1-second query.',
    visual:'obs-query', steps:['Calls','Mean / max / min','Total time','Context'],
    notes:'Use the supplied Query Performance screenshot. Read a row left to right: SQL text; Time consumed; Calls; Max, Mean and Min time; Rows processed; Cache hit rate; Role; Application. Calls means executions. Mean is average duration of one execution. Time consumed is cumulative time and share of tracked statement time, so a frequently used query may dominate even if one call is quick. A high cache hit is not proof that a query is fast. Do not read project-specific function names or measurements as universal benchmarks. Ask which query should be investigated first, then show the answer depends on user impact and total cost.',
    deep:'The underlying pg_stat_statements statistics are cumulative since the last reset and group normalized statements, rather than representing one individual request or necessarily matching the Reports time filter. Rows processed counts rows returned or affected; Role is a PostgreSQL role, not the signed-in app user; Application depends on the client application_name. Query Performance lists successful slow-running statements, not timed-out statements, which require logs. For a candidate statement, inspect its plan and measure before and after a change. See docs/OBSERVABILITY-GUIDE.md for every column.',
    source:['queryStats','reports','timeouts']
  },
  {
    id:'obs-connections', chapter:'OBSERVABILITY', tag:'17 / OBSERVABILITY', title:'Connections: who is waiting for whom?',
    lead:'A connection is a PostgreSQL session. It may be running SQL, waiting for work, or holding a transaction open.',
    takeaway:'An idle transaction can hold a lock while another query waits. Trace the blocker, then close the demo transaction.', duration:220,
    definitions:[['Connection','A client session open to PostgreSQL.'],['Idle in transaction','An open transaction with no statement currently running.'],['Blocked query','A statement waiting for another session to release a lock.']],
    example:'One update keeps a transaction open; the second update waits on the same task row.',
    visual:'obs-connections', steps:['Connection','Active query','Idle transaction','Blocked query','Resolve'],
    sql:`select pid, usename, application_name, state,\n       now() - coalesce(xact_start, query_start) as duration,\n       pg_blocking_pids(pid) as blocked_by, query\nfrom pg_stat_activity\nwhere datname = current_database()\n  and backend_type = 'client backend'\norder by xact_start nulls last;`,
    notes:'Use the supplied Database Connections screenshot. Define all six cards: Connections is currently open database sessions versus the limit; Active Queries is SQL executing now; Idle in Transaction is an open transaction with no current statement; Blocked Queries are sessions waiting on a conflicting lock; Top Blocker points to a session causing waits; Longest Running highlights the oldest running work. In Sessions, explain State, Query/Session, Duration, Blocked By, plus PID, role and application. Demonstrate with separate SQL sessions in a disposable project using docs/OBSERVABILITY-DEMO.md. Opening another browser tab does not reliably add one database connection because the browser, API service and pooler are different layers.',
    deep:'Postgres pg_stat_activity exposes session state. An idle connection is normal for a pool; idle in transaction can retain locks and delay cleanup. pg_blocking_pids(pid) finds direct blockers and chains may have a root blocker further upstream. One brief blocked query can be normal; a sustained wait, growing queue or user-facing latency deserves investigation. Never infer a blocker solely from long duration. The live dashboard is a snapshot and may include its own monitoring session. The runbook uses a demo table, timeout limits and ROLLBACK for cleanup.',
    source:['connectionManagement','connect']
  },
  {
    id:'obs-database', chapter:'OBSERVABILITY', tag:'18 / OBSERVABILITY', title:'Database: CPU, RAM, disk and I/O',
    lead:'Postgres needs compute to execute queries, memory to work and cache pages, and disk to store durable data.',
    takeaway:'A busy resource is a clue. Compare the chart with query load and user-visible latency.', duration:120,
    definitions:[['CPU','Processing time spent running or waiting on work.'],['Memory','RAM used for active work and useful cache.'],['Disk usage','How much storage capacity is occupied.'],['Disk I/O','How much data is being read or written.']],
    example:'A nearly full disk is a capacity problem; high I/O with slow requests is a performance clue.',
    visual:'obs-database', steps:['Memory','CPU','Disk capacity','Disk I/O'],
    notes:'Use the supplied Database screenshot. Explain memory Used versus Cache + Buffers versus Free and Swap. Cache is useful memory, not automatically waste. Memory Commitment is memory promised to processes, compared with the commit limit; it is not the same as actual RAM used. CPU User is query/process work, System is kernel work, IOWait is time waiting on I/O, and Idle is spare time. Disk Usage means capacity occupied; Disk I/O means the rate of reads and writes. A chart spike alone is not enough to choose a bigger compute tier.',
    deep:'The resource report contains time-series samples. Sustained swap or memory commitment near its limit can signal memory pressure; sustained CPU saturation with rising latency calls for workload diagnosis. Disk IOPS is operation rate rather than space used. Correlate with Query Performance, connections and application traffic before changing indexes, workload or compute. Some advanced telemetry and historical windows depend on plan.',
    source:['reports','compute']
  },
  {
    id:'obs-apis', chapter:'OBSERVABILITY', tag:'19 / OBSERVABILITY', title:'Requests, Data API and Auth',
    lead:'A request passes through an API layer; sign-in is a separate Auth flow. Each has its own traffic and errors.',
    takeaway:'Count, response speed and status codes tell you different things. Follow the route that owns the request.', duration:115,
    definitions:[['Gateway','The entry point for HTTP requests to Supabase services.'],['Data API report','Traffic and outcomes for generated REST routes.'],['Auth report','Sign-in, sign-up and identity request activity.']],
    example:'If sign-in fails, inspect Auth; if task reads are slow, inspect Data API and queries.',
    visual:'obs-apis', steps:['API Gateway','Data API','Auth'],
    notes:'Show the supplied API Gateway, Data API and Auth screenshots in sequence. Gateway: Requests by Geography, Total Requests, Response Errors, Response Speed and Network Traffic. Data API: PostgREST /rest/v1 requests, endpoint counts, errors, latency and bytes. Auth: sign-in attempts by type, sign-ups, password reset requests, errors by code and processing time. A 403 is a refusal, not proof the database is down; inspect its route and context. No data to show can mean no events in the selected period or reporting delay; it is not automatically a zero.',
    deep:'An HTTP request is not one PostgreSQL connection, and API request latency includes more than SQL execution. Gateway, PostgREST and Auth reports describe different service boundaries. Status 4xx generally indicates a client/auth/permission outcome; 5xx indicates server-side failure, but investigate the actual log. Ingress is bytes received, egress is bytes sent; time range and filters affect charts.',
    source:['reports','api','auth']
  },
  {
    id:'obs-services', chapter:'OBSERVABILITY', tag:'20 / OBSERVABILITY', title:'Functions, Storage and Realtime',
    lead:'The other product reports answer three simple questions: did code run, were files served, and were live events delivered?',
    takeaway:'Watch the metric for the service that actually handles the feature.', duration:115,
    definitions:[['Function invocation','One request that runs an Edge Function.'],['Storage request','One operation to upload, download or manage a file.'],['Realtime client','A connected WebSocket client, not a Postgres session.']],
    example:'Missing live updates lead to Realtime events and connections, not the Storage report.',
    visual:'obs-services', steps:['Edge Functions','Storage','Realtime'],
    notes:'Show the supplied screenshots. Edge Functions: invocation count, status codes, execution time and region. Storage: request count, response speed, ingress/egress network traffic and request caching. Realtime: Connected Clients means WebSocket clients, not Postgres sessions; Broadcast Events are messages, Presence Events are online-state updates, Postgres Changes Events are delivered row changes. Also point to channel joins, payload size, database-to-broadcast lag and private-channel RLS execution time. A blank Realtime chart can mean no recent usage or delayed reporting, not necessarily a broken feature.',
    deep:'Edge Function 403 responses are authorization outcomes and need endpoint/log context. Storage metrics describe the file service, not table bytes. One Realtime WebSocket may subscribe to multiple channels. Broadcast, Presence and Postgres Changes have distinct event semantics. Broadcast from Database Replication Lag measures median time from database commit to broadcast; private channel RLS execution times measure policy-check latency. See docs/OBSERVABILITY-GUIDE.md for the full glossary.',
    source:['reports','realtimeReports','functions','storage']
  },
  {
    id:'finale', chapter:'SHIP IT', tag:'21 / SHIP IT', title:'One connected system',
    lead:'The entire request path now fits in one picture.',
    takeaway:'Start with data and access rules, then add the services the product actually needs.', duration:80,
    visual:'finale', steps:['User','Auth','API + RLS','Postgres','Optional services'],
    notes:'Recap the five ideas: Postgres at the core; Data API runs requests and OpenAPI describes them; Auth is identity; RLS is row permission; Storage, Realtime, Functions, Queues and Cron extend the app. Observability helps identify which part needs attention. Invite questions about a real application the audience is building.',
    deep:'The architecture is composable. Apps may connect through the generated API, custom services or direct SQL. Production quality comes from explicit authorization, versioned schema, tested queries and recovery planning.',
    source:['architecture','rls']
  }
];

export const totalMinutes = Math.round(slides.reduce((sum, slide)=>sum+slide.duration,0)/60);

// Definitions for the presenter's Observability screenshots. Rendered in the
// Technical details panel, with longer teaching notes in OBSERVABILITY-GUIDE.md.
export const metricGlossary = {
  'obs-intro': [
    ['Metrics','Numbers tracked over time, such as requests or CPU.'],
    ['Logs','Records of individual events and errors.'],
    ['Live sessions','Database connections and their current activity.']
  ],
  'obs-overview': [
    ['Slow queries','A count that points to statements worth investigating.'],
    ['Peak connections','Highest number of simultaneous database sessions in the selected period.'],
    ['Disk usage','Share of storage capacity occupied.'],
    ['Disk I/O','Read and write activity, separate from storage capacity.'],
    ['Memory','RAM used by the database machine.'],
    ['CPU','Compute activity on the database machine.'],
    ['Service health','Traffic and warnings for Gateway, Database, PostgREST, Auth, Functions, Storage and Realtime.']
  ],
  'obs-query': [
    ['Query','SQL statement or normalized statement group.'],
    ['Time consumed','Total time spent running the statement and its share of tracked time.'],
    ['Calls','Number of executions.'],
    ['Max time','Slowest recorded call.'],
    ['Mean time','Average duration per call.'],
    ['Min time','Fastest recorded call.'],
    ['Rows processed','Rows returned or affected; this is not the number of rows scanned.'],
    ['Cache hit rate','Share of block accesses served from cache; a high rate does not prove the query is fast.'],
    ['Role','PostgreSQL role running the query, usually not an individual app user.'],
    ['Application','Client-reported application name when available.']
  ],
  'obs-connections': [
    ['Connections','Open PostgreSQL sessions compared with the connection limit.'],
    ['Active queries','Sessions currently executing SQL; an active query may be waiting.'],
    ['Idle in transaction','Transaction remains open after its last statement; it may retain locks.'],
    ['Blocked queries','Queries waiting for a conflicting lock.'],
    ['Top blocker','Session identified as causing the most waits; inspect the full chain.'],
    ['Longest running','Oldest running work in the current snapshot.'],
    ['State','Current session state, such as active or idle.'],
    ['Query · Session','Current or most recent SQL and identifying details.'],
    ['Duration','How long the shown statement, state or transaction has lasted.'],
    ['Blocked by','PID of a session this query waits for.'],
    ['PID / Role / Application','Session ID, database role and client-reported name.'],
    ['Root blockers','Filter for sessions at the start of blocking chains.']
  ],
  'obs-database': [
    ['Memory used','RAM currently in use.'],
    ['Cache + buffers','RAM holding reusable cached data.'],
    ['Free / swap','Unused RAM / disk used as memory overflow.'],
    ['Memory commitment / limit','Memory promised to processes compared with the commit limit.'],
    ['CPU user / system','Time in database code / operating-system code.'],
    ['CPU IOWait / IRQs / idle','Time waiting for I/O / handling interrupts / unused.'],
    ['Disk usage','Storage capacity occupied.'],
    ['Disk I/O / IOPS','Read-write activity / operations per second.']
  ],
  'obs-apis': [
    ['Gateway requests by geography','Approximate origin of incoming requests.'],
    ['Gateway total requests','Number of requests during the selected period.'],
    ['Response errors','Failed HTTP outcomes; inspect status, route and logs.'],
    ['Response speed','HTTP response time, including work outside SQL.'],
    ['Network ingress / egress','Bytes received / sent by the service.'],
    ['Data API endpoint / count','Generated REST route and number of calls.'],
    ['Data API status / speed','HTTP outcome and route response time.'],
    ['Auth activity / sign-in type','Authentication actions and the method or provider used.'],
    ['Sign-ups / password resets','Registration and recovery requests.'],
    ['Auth errors by code','Failures grouped by error or HTTP status.'],
    ['Sign-in processing time / percentiles','Time to complete sign-in; percentiles show slower tail requests.']
  ],
  'obs-services': [
    ['Edge Function invocations','Number of times function code ran.'],
    ['Edge Function status codes','HTTP outcomes, such as 200 or 403.'],
    ['Edge Function execution time / region','Processing duration / location of execution.'],
    ['Storage total requests / response speed','File-service request volume / response time.'],
    ['Storage traffic / billable egress','Bytes received or sent / billing-related outbound traffic.'],
    ['Storage request caching','Cache behavior for file requests.'],
    ['Realtime connected clients','WebSocket clients, not PostgreSQL sessions.'],
    ['Broadcast / Presence events','Channel messages / online-state changes.'],
    ['Postgres Changes events','Delivered database row-change messages.'],
    ['Channel joins / payload size','Subscription arrivals / event-message size.'],
    ['Broadcast from DB replication lag','Delay between database commit and broadcast.'],
    ['Private-channel RLS execution time','Time to check permission for a private channel subscription.']
  ]
};
