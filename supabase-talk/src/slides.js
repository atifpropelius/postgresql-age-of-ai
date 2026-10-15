export const sources = {
  architecture: 'https://supabase.com/docs/guides/getting-started/architecture',
  database: 'https://supabase.com/docs/guides/database/overview',
  api: 'https://supabase.com/docs/guides/api',
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
  funding: 'https://www.prnewswire.com/news-releases/supabase-raises-500m-at-10-5b-to-accelerate-lead-in-agentic-infrastructure-302791787.html',
  adoption: 'https://supabase.com/blog/series-f',
  billing: 'https://supabase.com/docs/guides/platform/billing-on-supabase'
};

export const slides = [
  {
    id:'opening', chapter:'THE IDEA', tag:'01 / THE IDEA', title:'Supabase, from idea to production',
    lead:'One small app. One connected backend. The engineering decisions that make it safe to ship.',
    takeaway:'Supabase packages a Postgres database with the services applications commonly need.', duration:70,
    visual:'opening', steps:['Database','Auth','API','Storage','Realtime'],
    notes:'Open with scale, then move to the taskboard. In June 2026, Supabase reported nearly 10 million developers building on it and a $10.5 billion post-money valuation after its Series F. The developer figure does not mean 10 million paying customers. Supabase also reported more than 250,000 customers, without breaking out how many pay. Its plans include Free, Pro, Team and Enterprise. The example app needs users, private tasks, attachments and live updates.',
    deep:'Supabase is an open source platform built around Postgres. Its services are separate processes that share one project database; it is not a new database engine. The June 2026 $500 million round had a $10 billion pre-money and $10.5 billion post-money valuation. The valuation is an investor pricing of the company, not annual revenue. The reported developer and customer counts are company figures; the cited sources do not disclose a paying-customer count. Paid plans charge a subscription plus applicable usage and compute costs.',
    source:['architecture','adoption','funding','billing']
  },
  {
    id:'stack', chapter:'THE IDEA', tag:'02 / THE IDEA', title:'What is Supabase?',
    lead:'PostgreSQL at the core, with Data API, Auth, Storage, Realtime, Edge Functions, Queues and Cron around it.',
    takeaway:'Each service has a distinct job; Postgres remains the shared data core.', duration:145,
    visual:'stack', steps:['Client','Gateway','Services','Postgres'],
    notes:'Trace a browser request through the gateway and a request service into Postgres. Explain the seven capabilities in one sentence each. Queues and Cron are Postgres-backed jobs, not gateway routes: a queue holds work for a consumer; Cron schedules recurring work.',
    deep:'The gateway routes requests to dedicated services including Auth, PostgREST for the Data API, Realtime, Storage and Edge Functions. Supabase Queues builds on the pgmq Postgres extension; Cron uses pg_cron. Storage file bytes live in object storage while metadata lives in Postgres. Studio is a management UI, not the request path.',
    source:['architecture','storage','queues','cron']
  },
  {
    id:'fit', chapter:'THE IDEA', tag:'03 / THE IDEA', title:'When is it a good fit?',
    lead:'Choose by workload and team needs, not by the number of features on a pricing page.',
    takeaway:'It shines when one product needs relational data, user identity and fast delivery.', duration:125,
    visual:'fit', steps:['Product MVP','Collaborative app','Specialized workload'],
    notes:'Use the three scenarios. A product MVP benefits from integrated services; a collaborative app benefits from Auth, RLS and Realtime. A specialized workload may need extra services or a different primary store.',
    deep:'Evaluate data model, query patterns, residency, operations, cost, team skills and migration options. Supabase gives direct Postgres access and standard SQL, but managed services still have platform-specific configuration and operational limits.',
    source:['architecture','compute']
  },
  {
    id:'app', chapter:'BUILD THE APP', tag:'04 / BUILD THE APP', title:'Our example: a private taskboard',
    lead:'A user signs in, creates a task, attaches a file and sees changes appear on another screen.',
    takeaway:'Each requirement maps to a Supabase service and a clear boundary.', duration:105,
    visual:'app', steps:['Sign in','Save task','Attach file','See update'],
    notes:'Keep returning to this same app. It prevents the deck from becoming a list of disconnected product names.',
    deep:'The client can use the Supabase SDK for Auth, Data API, Storage and Realtime. Edge Functions are useful for trusted server-side work, but a custom API server remains a valid choice for complex domain logic.',
    source:['architecture','auth','storage','realtime']
  },
  {
    id:'data', chapter:'BUILD THE APP', tag:'05 / BUILD THE APP', title:'First, design the data',
    lead:'A table has named columns; each row is one task. PostgreSQL enforces types, keys and relationships.',
    takeaway:'Supabase starts with a real relational database, so schema quality still matters.', duration:145,
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
    visual:'api', steps:['Client call','JWT + key','Data API','RLS + rows'],
    code:`const { data, error } = await supabase\n  .from('tasks')\n  .select('id, title, done')\n  .order('id', { ascending: false });`,
    notes:'Show the exact client call and REST route. The frontend sends a publishable key plus a signed-in user token. PostgREST serves the Data API request; the generated OpenAPI document describes the routes, rather than processing a second request. In the dashboard, Data API Docs shows the generated endpoints. The next slide explains row access.',
    deep:'PostgREST exposes tables, views and functions from configured schemas as REST endpoints, subject to grants and RLS. Its OpenAPI specification describes the endpoints visible to the requesting role, so an OpenAPI document is not an alternate database or an authorization layer. For a backend with long-lived connections, a direct or session connection may fit; browser code should not contain a raw database password.',
    source:['api','openapi','autoDocs','connect','keys']
  },
  {
    id:'security', chapter:'TRUST', tag:'07 / TRUST', title:'Auth says who. RLS says which rows.',
    lead:'Sign-in creates identity; a database policy decides what that identity may read or change.',
    takeaway:'The publishable key is safe for clients only when grants and RLS protect the data.', duration:175,
    visual:'security', steps:['Muskan','Atif'],
    sql:`alter table public.tasks enable row level security;\n\ncreate policy "read own tasks" on public.tasks\nfor select to authenticated\nusing ((select auth.uid()) = owner_id);`,
    notes:'Switch between Muskan and Atif. The same query returns different task rows because the policy is checked inside Postgres. Explain that a secret or service-role key must never be shipped to the browser.',
    deep:'RLS is PostgreSQL row-level security. Supabase Auth supplies JWT identity, and auth.uid() exposes the current user ID inside policy expressions. A SELECT policy alone does not grant INSERT/UPDATE/DELETE; add operation-specific policies. Grants are checked before RLS. Views can bypass underlying table RLS unless configured carefully, such as security_invoker on supported Postgres versions.',
    source:['auth','rls','keys']
  },
  {
    id:'storage', chapter:'CAPABILITIES', tag:'08 / CAPABILITIES', title:'Files live beside your rows',
    lead:'Storage handles file bytes; Postgres keeps bucket and object metadata. Policies govern access.',
    takeaway:'Use Storage APIs for file operations and RLS for private bucket access.', duration:110,
    visual:'storage', steps:['Upload','Policy','Metadata','Object'],
    code:`await supabase.storage\n  .from('task-files')\n  .upload('users/muskan/brief.pdf', file);`,
    notes:'A PDF is not stored as a giant cell in our tasks table. A Storage request checks authorization, writes metadata and places the file bytes in object storage.',
    deep:'Storage metadata lives in the storage schema. Actual object bytes live in an object storage provider. Use the Storage API for upload, move and delete: direct SQL edits to storage metadata do not manage the underlying object. Private buckets use policies on storage.objects.',
    source:['storage']
  },
  {
    id:'realtime', chapter:'CAPABILITIES', tag:'09 / CAPABILITIES', title:'One change, many screens',
    lead:'Realtime connects clients through WebSockets for database changes, Broadcast and Presence.',
    takeaway:'Use the right event path; do not turn every database write into a global notification.', duration:115,
    visual:'realtime', steps:['Database Changes','Broadcast','Presence'],
    notes:'Click through the three modes. Database Changes delivers selected row changes; Broadcast is app messages; Presence shows who is online. The two browser cards update in the demo.',
    deep:'Database Changes relies on Postgres logical replication and a publication; it has different scaling and authorization costs from Broadcast. Presence tracks shared state. Design channels and filters around the audience that actually needs the event.',
    source:['realtime']
  },
  {
    id:'functions', chapter:'CAPABILITIES', tag:'10 / CAPABILITIES', title:'Where trusted code runs',
    lead:'An Edge Function can verify a request, use server-only secrets, call an external API and return a result.',
    takeaway:'Keep privileged keys and external service secrets on the server side.', duration:110,
    visual:'functions', steps:['Request','Verify','Secret/API','Response'],
    notes:'Use task summary emails as an example. A browser calls the function; the function checks authorization and calls a mail provider with a secret. Never send a service-role key to the browser.',
    deep:'Edge Functions use a Deno-based runtime. Design for retries, timeouts and idempotency when handling webhooks or external side effects. Complex long-running jobs may need a queue and worker instead of a request path.',
    source:['functions','keys']
  },
  {
    id:'async', chapter:'CAPABILITIES', tag:'11 / CAPABILITIES', title:'Queues + Cron: work later or on a schedule',
    lead:'A queue holds background tasks until a consumer processes them. Cron starts recurring work at a chosen time.',
    takeaway:'Queued work needs a consumer; a schedule can trigger SQL or a function. These solve different timing needs.', duration:180,
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
    visual:'workflow', steps:['Local stack','Migration','Review','Deploy'],
    code:`npx supabase init\nnpx supabase start\nnpx supabase migration new create_tasks\nnpx supabase db reset\n# review before applying to a linked project\nnpx supabase db push --dry-run`,
    notes:'The CLI starts a local development stack with Docker. Show the migration file in Git. For a remote project, preview the pending migrations before applying them. Never run a destructive reset against production.',
    deep:'Local development is for testing, not public traffic. A reproducible project contains migrations and seed data. Generate client types if useful; keep project secrets out of Git. Production deployment should include review and a rollback or forward-fix plan.',
    source:['local']
  },
  {
    id:'production', chapter:'SHIP IT', tag:'13 / SHIP IT', title:'Production is still engineering',
    lead:'Observe queries, protect access, manage connections, plan backups and choose compute from measurements.',
    takeaway:'Supabase removes setup work; it does not remove capacity or security decisions.', duration:155,
    visual:'production', steps:['Security','Queries','Connections','Recovery'],
    notes:'Walk through four production checks. RLS and secret placement; EXPLAIN for slow queries; pooling for short-lived serverless connections; backup and restore preparation. Start with measurements, not a universal instance size.',
    deep:'For browser apps, use the Data API. For direct Postgres access from serverless functions, transaction pooling helps control short-lived connections but has session-state and prepared-statement limitations. Measure CPU, memory, disk I/O, connection counts and latency before resizing. Read replicas and other scaling tools are workload-specific; test recovery, not only backups.',
    source:['connect','compute','rls']
  },
  {
    id:'finale', chapter:'SHIP IT', tag:'14 / SHIP IT', title:'One connected system',
    lead:'The entire request path now fits in one picture.',
    takeaway:'Start with data and access rules, then add the services the product actually needs.', duration:80,
    visual:'finale', steps:['User','Auth','API + RLS','Postgres','Optional services'],
    notes:'Recap the five ideas: Postgres at the core; Data API runs requests and OpenAPI describes them; Auth is identity; RLS is row permission; Storage, Realtime, Functions, Queues and Cron extend the app. Invite questions about a real application the audience is building.',
    deep:'The architecture is composable. Apps may connect through the generated API, custom services or direct SQL. Production quality comes from explicit authorization, versioned schema, tested queries and recovery planning.',
    source:['architecture','rls']
  }
];

export const totalMinutes = Math.round(slides.reduce((sum, slide)=>sum+slide.duration,0)/60);
