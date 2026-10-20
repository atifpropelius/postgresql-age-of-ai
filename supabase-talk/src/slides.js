// Audience route. Detailed command and dashboard material lives in docs/.
export const slides = [
  {
    id:'title', section:'START', duration:60, kind:'title',
    title:'Supabase as a Backend: What Runs Where',
    lead:'One task app. One clear map of the services behind it.',
    objectives:[
      'Explain Supabase capabilities and limits before making promises to clients.',
      'Understand pricing and when to enable point-in-time recovery (PITR).',
      'Work safely with Supabase and avoid serious production issues.',
      'Read logs and improve query performance.',
      'Use branches to manage staging and production.',
      'Choose the right region when creating a project.'
    ],
    takeaway:'A practical introduction, not a tour of every product setting.'
  },
  {
    id:'what', section:'FOUNDATION', duration:60, kind:'table',
    title:'Why use Supabase?',
    lead:'Supabase saves developer and DevOps time.',
    columns:['Project','Why Supabase?'],
    rows:[['Online store','Customers → orders → order items: relational data for PostgreSQL.'],['Ready to use','PostgreSQL, Auth, API and Storage.']],
    takeaway:'If your project needs PostgreSQL, you can go with Supabase.'
  },
  {
    id:'context', section:'FOUNDATION', duration:30, kind:'context',
    title:'Why this platform is worth understanding',
    lead:'Adoption provides context. It does not decide whether the architecture fits.',
    facts:[['Nearly 10 million','developers building on Supabase, reported in June 2026'],['Lovable + Figma Make','Supabase powers many Lovable apps; Figma Make integrates with it. Mozilla and 1Password are also named customers.'],['$10.5 billion','post-money valuation implied by $500M at $10B pre-money, June 2026']],
    footnote:'Developers are not paying customers or monthly active users. These are dated, company-reported facts.',
    takeaway:'Evaluate the platform by your workload, constraints and team skills.'
  },
  {
    id:'components', section:'FOUNDATION', duration:120, kind:'services',
    title:'What does a Supabase project provide?',
    lead:'PostgreSQL is the data core. The other capabilities have separate jobs.',
    columns:['Component','One-line definition','Typical task-app use'],
    rows:[['PostgreSQL','Database that stores rows and executes SQL.','Store tasks and permissions.'],['Data API / PostgREST','HTTP API generated over exposed database objects.','Read or create task rows.'],['Authentication','Service that identifies users and issues sessions.','Sign in; send Auth emails via SMTP.'],['Storage','File service backed by object storage and metadata.','Upload a PDF.'],['Realtime','Service that delivers live events over WebSockets.','Show a task update.'],['Edge Functions','Hosted server-side TypeScript request handlers.','Call a mail provider for app emails.'],['Compute (private alpha)','Long-running Linux services or jobs beside Postgres.','Evaluate a task worker; no production use yet.'],['Queues','Durable messages in Postgres, powered by pgmq.','Wait for an email worker.'],['Cron','Scheduled jobs in Postgres, powered by pg_cron.','Run a daily reminder.'],['Functions / triggers','SQL routines and event-driven database actions.','Keep a related update atomic.'],['Extensions','Installable PostgreSQL capabilities.','Add pgmq or pg_cron.']],
    takeaway:'These pieces work together; they do not all run inside one process.'
  },
  {
    id:'where', section:'ARCHITECTURE', duration:165, kind:'architecture',
    title:'The central question: what runs where?',
    lead:'Follow Atif as he signs in, creates a task, attaches a PDF and sees an update.',
    columns:['Action','Entry point','Execution / destination'],
    rows:[['Sign in','Auth API','Auth service; identity data in project database'],['Auth email (confirm/reset)','Auth + configured SMTP','Auth sends its template through the mail provider'],['Create or read task','Data API','Postgres validates, applies RLS and stores rows'],['Upload PDF','Storage API','File bytes in object storage; metadata in Postgres'],['Receive update','Realtime','Service pushes an event to subscribed clients'],['Task notification email','Edge Function','App code calls an external mail provider'],['Update related data','RPC / trigger','Postgres executes a function or trigger'],['Process queued work','Queue consumer','External worker now; Supabase Compute (Private Alpha; unavailable here)']],
    takeaway:'An API request, a database function and a background worker run in different places.'
  },
  {
    id:'request', section:'ARCHITECTURE', duration:135, kind:'request',
    title:'Trace one request: create a task',
    lead:'A signed-in client sends a token and a new task through the Data API.',
    stages:[['01','Frontend','Atif submits a task from the browser.'],['02','Data API','PostgREST receives the request and user token.'],['03','Identity','The token supplies the authenticated user context.'],['04','PostgreSQL','Grants, row policies and constraints decide the write.'],['05','Response','The API returns success or an error.'],['06','Realtime','If configured, subscribers receive a change event.']],
    code:"await supabase.from('tasks').insert({ title: 'Review brief', owner_id: user.id })",
    definition:'Row Level Security: database policies that restrict which rows a role may access.',
    openapi:'OpenAPI describes the exposed REST routes; PostgREST handles the requests.',
    takeaway:'A token identifies the caller; database authorization still decides access.'
  },
  {
    id:'logic', section:'ARCHITECTURE', duration:105, kind:'table',
    title:'Where should application logic run?',
    lead:'Choose the place based on the work, its duration and whether it needs a database transaction.',
    columns:['Place','When to use','Task-app example'],
    rows:[['Database function / RPC','SQL work across rows that must succeed or fail together.','Create a task and audit row atomically.'],['Trigger','Run automatically on INSERT, UPDATE or DELETE.','Write an audit record when a task changes.'],['Edge Function','Server-side TypeScript for webhooks, external APIs and email with protected secrets.','Call a mail provider when a task is assigned.'],['Supabase Compute (private alpha)','Long-running Linux apps or workers near Postgres; not production-ready.','Evaluate a task queue consumer internally.'],['External backend','Persistent NestJS/Node.js service for complex or long-running logic.','Run a production task API on EC2 or Render.'],['Queue worker','Process background jobs with retries after the request returns.','Retry PDF processing from a queued job.']],
    example:'One task app can use an RPC for an atomic save, an Edge Function for email and a worker for PDF processing.',
    takeaway:'Keep atomic SQL in Postgres, integrations in server code and retryable jobs in a worker.'
  },
  {
    id:'database-connections', section:'ARCHITECTURE', duration:60, kind:'connections',
    title:'Supabase Database Connections: Direct vs Transaction Pooler vs Session Pooler',
    lead:'For server code using a Postgres driver. A PostgreSQL connection is an open database session; the Data API uses HTTPS instead.',
    paths:[
      ['Direct','Persistent NestJS / EC2','Application','App pool · pg.Pool','PostgreSQL','Reuse app connections; check network access and the database limit.'],
      ['Transaction','Lambda / Edge Function','Many serverless functions','Transaction pooler','PostgreSQL','Pooler borrows a connection per transaction and reuses it across invocations.'],
      ['Session','Session state / IPv4-only app','Application','Session pooler','PostgreSQL','Pooler pins one database connection until disconnect, then reuses it.']
    ],
    takeaway:'Direct: persistent backends · Transaction: short-lived serverless requests · Session: session state or connectivity alternative.'
  },
  {
    id:'edge-limits', section:'ARCHITECTURE', duration:60, kind:'edge-limits',
    title:'Edge Functions: know the limits',
    lead:'Resource limits help decide whether a task belongs in a request handler or a worker.',
    columns:['Limit','Free','Pro'],
    rows:[['Memory per worker','256 MB','256 MB'],['Active CPU per request','2 seconds','2 seconds'],['Maximum worker lifetime','150 seconds','400 seconds'],['Included invocations per month','500,000','2,000,000']],
    timeout:'A worker is a running function instance. CPU time excludes async waiting; 150/400 seconds is its lifetime. An idle request times out after 150 seconds.',
    price:'An invocation is one function execution. Free is $0/month; Pro starts at $25/month. Extra usage and projects can cost more.',
    takeaway:'Use Edge Functions for bounded work. Check current plan limits before designing a long-running job.'
  },
  {
    id:'gateway', section:'ARCHITECTURE', duration:90, kind:'edge-gateway',
    title:'A gateway before expensive requests',
    lead:'An optional Cloudflare Worker can reject abusive traffic before it reaches selected Supabase endpoints.',
    stages:[['Client','Task app request'],['Cloudflare Worker','api.example.com · rate check'],['Supabase API / Edge Function','Receives allowed request'],['PostgreSQL','Runs permitted data work']],
    definitions:[['Cloudflare Worker','Code at Cloudflare’s edge; a separate service from Supabase.'],['Custom domain','Your hostname, such as api.example.com, routed to that Worker.'],['Rate limit','A rule that rejects requests after a chosen threshold.'],['Worker KV','Distributed key-value storage; not a strict global rate counter.']],
    cost:'As of Oct 2026: Free has 100,000 requests/day and 10 ms CPU/request. Paid starts at $5/month per account, plus possible usage charges.',
    caution:'Only routed traffic passes this gate. Secure direct Supabase endpoints, verify identity, keep secrets server-side, and enforce Auth + RLS.',
    takeaway:'Use a Worker for a branded API entry point and abuse filtering; it does not replace Supabase authorization.'
  },
  {
    id:'migrations', section:'SHIP', duration:150, kind:'workflow',
    title:'Change the schema safely',
    lead:'Make every table or column change a reviewed migration that can be replayed.',
    definitions:[['Schema','The structure of tables, views and other database objects.'],['Migration','A versioned SQL file that changes that structure.'],['Migration history','The record of changes already applied.'],['Local / staging / production','Developer machine / validation environment / live user environment.'],['Schema drift','A remote change that the migration files do not describe.']],
    steps:['Edit locally','Write migration','Commit + review','Validate in staging','Deploy to production'],
    code:'supabase init (once)  →  supabase start  →  supabase migration new add_tasks  →  supabase migration up --local',
    caution:'After writing the SQL, apply pending migrations locally. db reset rebuilds the local database and deletes its data; never reset a production project.',
    takeaway:'Use CLI and Git together. Preview remote changes before applying them.'
  },
  {
    id:'branching', section:'SHIP', duration:90, kind:'workflow',
    title:'Branches are test environments',
    lead:'A feature branch can validate a migration before it reaches production.',
    definitions:[['Production branch','The main project serving live users.'],['Persistent branch','A long-lived branch for staging or QA.'],['Temporary branch','A preview branch removed after short-lived work.'],['Branch configuration','The branch-specific URLs, keys, secrets and service settings.']],
    steps:['Feature branch','Preview project','Apply migration','Run tests','Merge after review'],
    cost:'A short-lived preview branch can cost less than keeping a separate test project running all month. Branch usage is outside the Spend Cap; a persistent branch is not automatically cheaper.',
    caution:'Branches are data-less by default. Check secrets, integrations and cost; availability depends on plan and setup.',
    takeaway:'Use preview branches for temporary tests, then delete them. Compare actual branch usage with a separate project.'
  },
  {
    id:'region', section:'SHIP', duration:75, kind:'region',
    title:'Project region and edge execution are different',
    lead:'Core data stays in the project region; Edge Function code may execute in another region.',
    factors:[['Postgres + SQL','Rows and SQL/RPC run in the project region by default.'],['Edge Function','Code runs near the caller by default; choose a region when needed.'],['Storage CDN','Original files stay in the project region; cached copies may be elsewhere.'],['Residency','Review logs, support access and external services too.']],
    example:'Mumbai project + London caller: SQL runs in Mumbai; an Edge Function may run near London and call that database.',
    caution:'Set the Function invocation to Mumbai if needed; verify its region. Moving the project itself requires migration.',
    takeaway:'Choosing Mumbai does not automatically keep Edge Function processing or CDN copies there.'
  },
  {
    id:'dashboard-start', section:'STUDIO', duration:70, kind:'dashboard',
    title:'Open the right project, then inspect data',
    lead:'These first three menu areas help you find the project, see rows and run a query.',
    path:'FIND THE PROJECT → INSPECT THE TASK',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Project Overview','Project identity, status and service shortcuts.','Confirm the demo project before any change.'],['Table Editor','Inspect tables, columns and rows visually.','Inspect public.tasks and task 101.'],['SQL Editor','Run or save SQL; inspect results and errors.','Check task rows with a read-only SELECT.']],
    caution:'Make deployed schema changes through tested migrations. Direct Table/SQL Editor edits bypass migration history; SQL Editor may have higher privileges than the app.',
    takeaway:'Confirm the project first; use Table Editor to inspect and SQL Editor for deliberate queries.'
  },
  {
    id:'dashboard-data', section:'STUDIO', duration:70, kind:'dashboard',
    title:'Find database rules, users and files',
    lead:'A task row, a signed-in identity and a file have different homes and access rules.',
    path:'ROW → IDENTITY → FILE',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Database','Schemas, RLS policies, functions, extensions, connections and backups.','Check the tasks RLS policy and database setup.'],['Authentication','Users, providers, sessions, email templates, SMTP and redirects.','Find Atif’s user ID; check login and Auth email setup.'],['Storage','Buckets, file objects, upload/download tools and access policies.','Find brief.pdf in a private bucket.']],
    storagePaths:[
      {kind:'PUBLIC BUCKET', examples:'Product images · logos · banners · public documents', access:'Cloudflare can filter this path; the public Supabase URL remains reachable directly.', nodes:[['Client',''],['cdn.example.com','Cloudflare WAF · rate limit · optional cache\n/public/'],['Supabase Storage','Public bucket']]},
      {kind:'PRIVATE BUCKET', examples:'Invoices · lab reports · identity documents · confidential PDFs', access:'Cloudflare can filter this path too; Storage RLS or a signed URL decides access.', nodes:[['Client with JWT / signed URL',''],['cdn.example.com','Cloudflare WAF · rate limit · bypass extra cache\n/authenticated/ or /sign/'],['Supabase Storage','Private bucket · JWT + RLS / signed URL']]}
    ],
    caution:'Direct project.supabase.co Storage URLs bypass your Cloudflare rules. Keep Supabase access checks for private files; avoid caching private responses in the extra proxy.',
    takeaway:'Proxied means the request passes through Cloudflare, not VPN. Its WAF can filter both paths; Storage decides private access.'
  },
  {
    id:'dashboard-runtime', section:'STUDIO', duration:70, kind:'dashboard',
    title:'See server code, Compute and live events',
    lead:'Edge Functions and the new Compute service run outside PostgreSQL.',
    path:'REQUEST CODE → LONG-RUNNING SERVICE → LIVE DELIVERY',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Edge Functions','Request handlers, deployments, invocations and logs.','Trace a failed task-email call.'],['Compute (private alpha)','Linux API services and background jobs beside Postgres.','See the waitlist; this project has no access yet.'],['Realtime','Broadcast, Presence and Postgres Changes channels and reports.','Find why another task screen stayed stale.']],
    caution:'Compute is for internal evaluation only today, not production. Database CPU/RAM sizing is a separate setting; Realtime delivery needs configuration.',
    takeaway:'For a production long-running backend today, keep using suitable external hosting.'
  },
  {
    id:'dashboard-diagnose', section:'STUDIO', duration:70, kind:'dashboard',
    title:'Find why a request failed or slowed down',
    lead:'Use recommendations, trends and individual events together.',
    path:'FINDING → TREND → EVENT',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Advisors','Security and performance findings with suggested fixes.','Open errors and warnings; inspect affected objects.'],['Observability','Slow queries, connections, resource and service-health reports.','Find slow writes or sessions waiting for a lock.'],['Logs','Searchable, timestamped API, database, Auth and function events.','Filter by service and time to investigate an error.']],
    caution:'0 Security Advisor errors can still leave warnings. Triage findings and check service error logs after releases and regularly.',
    takeaway:'Follow up on Advisor findings and recurring errors in Logs.'
  },
  {
    id:'dashboard-configure', section:'STUDIO', duration:70, kind:'dashboard',
    title:'Connect tools and configure the project',
    lead:'The final menu areas change how this project connects to other systems and clients.',
    path:'EXTERNAL TOOL → PROJECT CONFIGURATION',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Integrations','Partner connections, wrappers and database extensions.','Connect monitoring after checking permissions.'],['Project Settings','Project URL, API keys, database connections and service settings.','Copy the staging project URL and publishable key.']],
    caution:'A publishable key is for clients only when grants and RLS protect data; secret keys stay server-side. Check integration access and cost.',
    takeaway:'Next, use organization Usage and Billing to see what these services consume.'
  },
  {
    id:'usage', section:'OPERATE', duration:210, kind:'usage',
    title:'Read the Usage page before costs surprise you',
    lead:'Usage is measured activity. An allowance is the amount included in a plan; overage rules differ by metric.',
    snapshot:[['Edge invocations','199,095 / 2,000,000','function calls'],['Egress','0.79 / 250 GB','outgoing data'],['Log ingestion','3.07 / 20 GB','collected logs']],
    metrics:[['Egress','GB sent out; big downloads increase it.'],['Cached egress','GB served from CDN cache hits.'],['Storage size','GB of stored file objects.'],['Database disk','GB of database disk used or provisioned; read the chart label.'],['MAU','Distinct Auth users active in a billing period.'],['Edge invocations','Number of function executions.'],['Realtime messages','Messages delivered to subscribers.'],['Peak connections','Highest simultaneous Realtime clients.'],['Log ingestion','GB of logs collected.'],['Log query','GB of log data scanned by searches.'],['Database compute hours','Hours the Postgres instance runs at its selected size.']],
    spendCap:'Pro defaults to ON. Turning it OFF permits billable overages for covered usage; keeping it ON may restrict usage at quota. Compute and branch compute remain billable.',
    example:'A PDF repeatedly downloaded without caching can raise egress while storage size barely changes.',
    takeaway:'Before changing Spend Cap, review Usage and Upcoming Invoice. It does not cap the whole bill.'
  },
  {
    id:'habits', section:'OPERATE', duration:100, kind:'table',
    title:'Five habits for a reliable Supabase project',
    lead:'A small release routine prevents lockouts, schema drift and unseen failures.',
    columns:['Habit','What to do','Why it matters'],
    rows:[['Protect dashboard access','Add and test a backup authenticator on another device; keep another organization owner.','Dashboard two-factor sign-in has no recovery codes. Losing every factor can lock out an account.'],['Change schema through migrations','Create, review and test a migration for each table or column change.','Direct remote edits bypass migration history.'],['Triage Security Advisor','Investigate errors and warnings; fix or document each finding.','Zero errors can still leave security warnings.'],['Watch Logs + Observability','Check error logs after releases and routinely; watch query and connection trends.','Recurring failures and waits affect users.'],['Read official docs first','Check Supabase Developer Docs for behavior, commands and plan rules.','Dashboard and product details change.']],
    takeaway:'Keep access recoverable, schema in code and production behavior visible.'
  },
  {
    id:'demo', section:'OPERATE', duration:300, kind:'demo',
    title:'Five-minute task-app walkthrough',
    lead:'Use a disposable demo project. The prepared sequence also works offline.',
    stops:[['Table Editor','Find public.tasks and identify one task row.'],['Authentication','Show the user ID; hide email and tokens.'],['Task request','Data API, Edge Function or Compute (alpha).'],['Migration','Open the reviewed SQL file that created the table.'],['Storage','Point to the PDF object in a private bucket.'],['Logs + Usage','Locate a function error and invocation count.']],
    takeaway:'The same feature crosses data, identity, API, files and operations.'
  },
  {
    id:'wrap', section:'FINISH', duration:90, kind:'wrap',
    title:'What we learned: the Supabase checklist',
    lead:'The practical choices to build, ship and operate a project.',
    groups:[
      ['01','Postgres powers it',['PostgREST turns exposed tables into the Data API.','Postgres Changes uses WAL + a Realtime service.','pgvector and supported extensions add features.']],
      ['02','Ship changes safely',['Keep schema changes in migration files.','Use persistent staging; control GitHub sync.','Choose region early for users and residency.','RPC for atomic SQL; Edge Functions for integrations.']],
      ['03','Keep it efficient',['Choose direct or pooled DB connections.','Index and tune slow queries using logs and plans.','Watch Realtime messages and connections.','Use S3-compatible Storage; protect private files.']],
      ['04','Protect and operate',['Cloudflare Free on your domain; rate-limit paths.','Workers give fast pre-API checks or early 429s.','Fix Advisor findings; check DB and Edge logs.','Monitor errors, Usage, billing and recovery.']]
    ],
    checklist:'Release loop: migration → staging → Auth/RLS test → query check → deploy → logs and Usage.',
    takeaway:'Revisit this checklist whenever you change or release a Supabase project.'
  }
];

export const totalSeconds = slides.reduce((sum, slide) => sum + slide.duration, 0);
