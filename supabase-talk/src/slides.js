export const sources = {
  architecture: 'https://supabase.com/docs/guides/getting-started/architecture',
  database: 'https://supabase.com/docs/guides/database/overview',
  api: 'https://supabase.com/docs/guides/api',
  auth: 'https://supabase.com/docs/guides/auth/architecture',
  rls: 'https://supabase.com/docs/guides/database/postgres/row-level-security',
  keys: 'https://supabase.com/docs/guides/getting-started/api-keys',
  storage: 'https://supabase.com/docs/guides/storage/schema/design',
  realtime: 'https://supabase.com/docs/guides/realtime/architecture',
  functions: 'https://supabase.com/docs/guides/functions/architecture',
  vectors: 'https://supabase.com/docs/guides/ai/vector-columns',
  local: 'https://supabase.com/docs/guides/local-development/cli-workflows',
  connect: 'https://supabase.com/docs/guides/database/connecting-to-postgres',
  compute: 'https://supabase.com/docs/guides/platform/compute-and-disk'
};

export const slides = [
  {
    id:'opening', chapter:'THE IDEA', tag:'01 / THE IDEA', title:'Supabase, from idea to production',
    lead:'One small app. One connected backend. The engineering decisions that make it safe to ship.',
    takeaway:'Supabase packages a Postgres database with the services applications commonly need.', duration:70,
    visual:'opening', steps:['Database','Auth','API','Storage','Realtime'],
    notes:'Start with a taskboard example. It needs users, private tasks, attachments and live updates. We will build the mental model one request at a time.',
    deep:'Supabase is an open source platform built around Postgres. Its services are separate processes that share one project database; it is not a new database engine.',
    source:['architecture']
  },
  {
    id:'stack', chapter:'THE IDEA', tag:'02 / THE IDEA', title:'What is Supabase?',
    lead:'A ready-made backend around PostgreSQL: database, APIs, Auth, Storage, Realtime and functions.',
    takeaway:'Postgres is the data core; Supabase services turn it into an application platform.', duration:125,
    visual:'stack', steps:['Client','Gateway','Services','Postgres'],
    notes:'Trace a request from the browser through an API service into Postgres. Name what each surrounding service does in one sentence.',
    deep:'The gateway routes requests to dedicated services: Auth, PostgREST for the Data API, Realtime, Storage and Edge Functions. Storage file bytes live in object storage; its metadata lives in Postgres. Studio is a management UI, not the request path.',
    source:['architecture','storage']
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
    id:'api', chapter:'BUILD THE APP', tag:'06 / BUILD THE APP', title:'A table becomes an API',
    lead:'The client asks for tasks; the Data API translates the request into a Postgres query.',
    takeaway:'Fast API setup does not remove the need for permissions and query design.', duration:120,
    visual:'api', steps:['Client call','JWT + key','Data API','RLS + rows'],
    code:`const { data, error } = await supabase\n  .from('tasks')\n  .select('id, title, done')\n  .order('id', { ascending: false });`,
    notes:'Show the exact client call. The frontend sends a publishable key plus a signed-in user token. The Data API asks Postgres for rows. The next slide explains why another user cannot read them.',
    deep:'PostgREST provides the Data API over exposed schemas. Database grants and RLS policies both affect access. For a backend with long-lived connections, a direct or session connection may fit; browser code should use the Data API, not a raw database password.',
    source:['api','connect','keys']
  },
  {
    id:'security', chapter:'TRUST', tag:'07 / TRUST', title:'Auth says who. RLS says which rows.',
    lead:'Sign-in creates identity; a database policy decides what that identity may read or change.',
    takeaway:'The publishable key is safe for clients only when grants and RLS protect the data.', duration:175,
    visual:'security', steps:['Asha','Atif'],
    sql:`alter table public.tasks enable row level security;\n\ncreate policy "read own tasks" on public.tasks\nfor select to authenticated\nusing ((select auth.uid()) = owner_id);`,
    notes:'Switch between Asha and Atif. The same query returns different task rows because the policy is checked inside Postgres. Explain that a secret or service-role key must never be shipped to the browser.',
    deep:'RLS is PostgreSQL row-level security. Supabase Auth supplies JWT identity, and auth.uid() exposes the current user ID inside policy expressions. A SELECT policy alone does not grant INSERT/UPDATE/DELETE; add operation-specific policies. Grants are checked before RLS. Views can bypass underlying table RLS unless configured carefully, such as security_invoker on supported Postgres versions.',
    source:['auth','rls','keys']
  },
  {
    id:'storage', chapter:'CAPABILITIES', tag:'08 / CAPABILITIES', title:'Files live beside your rows',
    lead:'Storage handles file bytes; Postgres keeps bucket and object metadata. Policies govern access.',
    takeaway:'Use Storage APIs for file operations and RLS for private bucket access.', duration:110,
    visual:'storage', steps:['Upload','Policy','Metadata','Object'],
    code:`await supabase.storage\n  .from('task-files')\n  .upload('users/asha/brief.pdf', file);`,
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
    id:'ai', chapter:'CAPABILITIES', tag:'11 / CAPABILITIES', title:'And if the app needs AI?',
    lead:'Store embeddings with pgvector; retrieve useful records before passing context to an LLM.',
    takeaway:'Supabase can support retrieval, but an embedding model and an LLM are separate pieces.', duration:120,
    visual:'ai', steps:['Text','Embedding','Vector search','Context','Answer'],
    notes:'Make AI optional to this story. The taskboard might search notes by meaning. The picture is a conceptual retrieval flow, not measured similarity results.',
    deep:'pgvector is a Postgres extension. Embeddings must use a consistent model and dimensions. Search can be exact or indexed; metadata filters, RLS and result quality still matter. RAG retrieves context for a model; it is not the same as model fine-tuning.',
    source:['vectors']
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
    visual:'finale', steps:['User','Auth','API + RLS','Postgres','Realtime + Storage'],
    notes:'Recap the five ideas: Postgres at the core; services around it; Auth is identity; RLS is row permission; operations still matter. Invite questions about a real application the audience is building.',
    deep:'The architecture is composable. Apps may connect through the generated API, custom services or direct SQL. Production quality comes from explicit authorization, versioned schema, tested queries and recovery planning.',
    source:['architecture','rls']
  }
];

export const totalMinutes = Math.round(slides.reduce((sum, slide)=>sum+slide.duration,0)/60);
