// Audience route. Detailed command and dashboard material lives in docs/.
export const slides = [
  {
    id:'title', section:'START', duration:60, kind:'title',
    title:'Supabase as a Backend: What Runs Where',
    lead:'One task app. One clear map of the services behind it.',
    objectives:['Understand the components Supabase provides.','Know where application operations execute.','Use a basic workflow to manage a project in production.'],
    takeaway:'A practical introduction, not a tour of every product setting.'
  },
  {
    id:'what', section:'FOUNDATION', duration:120, kind:'table',
    title:'What is Supabase, and why use it?',
    lead:'Supabase is a managed backend platform built around PostgreSQL.',
    definitions:[['Backend as a Service','Hosted building blocks for data, identity, files and server-side work.'],['Custom backend','Application servers your team designs, deploys and operates.']],
    columns:['Decision','Supabase','Custom NestJS / Node.js'],
    rows:[['Starting point','Database, Auth, APIs and Storage are available.','Build and integrate each capability yourself.'],['Best fit','A product that benefits from an integrated Postgres backend.','Unusual workflows or deep control of runtime and infrastructure.'],['Your responsibility','Data model, RLS, business rules, testing and operations.','The same concerns, plus service infrastructure.']],
    example:'Atif can build a private task app without first writing an Auth service or file API.',
    takeaway:'Supabase saves setup time; your team still owns product logic and safe access.'
  },
  {
    id:'context', section:'FOUNDATION', duration:45, kind:'context',
    title:'Why this platform is worth understanding',
    lead:'Adoption provides context. It does not decide whether the architecture fits.',
    facts:[['Nearly 10 million','developers building on Supabase, reported in June 2026'],['Lovable + Figma Make','Supabase powers many Lovable apps; Figma Make integrates with it. Mozilla and 1Password are also named customers.'],['$10.5 billion','post-money valuation implied by $500M at $10B pre-money, June 2026']],
    footnote:'Developers are not paying customers or monthly active users. These are dated, company-reported facts.',
    takeaway:'Evaluate the platform by your workload, constraints and team skills.'
  },
  {
    id:'components', section:'FOUNDATION', duration:135, kind:'services',
    title:'What does a Supabase project provide?',
    lead:'PostgreSQL is the data core. The other capabilities have separate jobs.',
    columns:['Component','One-line definition','Typical task-app use'],
    rows:[['PostgreSQL','Database that stores rows and executes SQL.','Store tasks and permissions.'],['Data API / PostgREST','HTTP API generated over exposed database objects.','Read or create task rows.'],['Authentication','Service that identifies users and issues sessions.','Sign Atif in.'],['Storage','File service backed by object storage and metadata.','Upload a PDF.'],['Realtime','Service that delivers live events over WebSockets.','Show a task update.'],['Edge Functions','Hosted server-side TypeScript request handlers.','Call a mail provider.'],['Compute (private alpha)','Long-running Linux services or jobs beside Postgres.','Evaluate a task worker; no production use yet.'],['Queues','Durable messages in Postgres, powered by pgmq.','Wait for an email worker.'],['Cron','Scheduled jobs in Postgres, powered by pg_cron.','Run a daily reminder.'],['Functions / triggers','SQL routines and event-driven database actions.','Keep a related update atomic.'],['Extensions','Installable PostgreSQL capabilities.','Add pgmq or pg_cron.']],
    takeaway:'These pieces work together; they do not all run inside one process.'
  },
  {
    id:'where', section:'ARCHITECTURE', duration:165, kind:'architecture',
    title:'The central question: what runs where?',
    lead:'Follow Atif as he signs in, creates a task, attaches a PDF and sees an update.',
    columns:['Action','Entry point','Execution / destination'],
    rows:[['Sign in','Auth API','Auth service; identity data in project database'],['Create or read task','Data API','Postgres validates, applies RLS and stores rows'],['Upload PDF','Storage API','File bytes in object storage; metadata in Postgres'],['Receive update','Realtime','Service pushes an event to subscribed clients'],['Send email','Edge Function','Hosted function calls external mail provider'],['Update related data','RPC / trigger','Postgres executes a function or trigger'],['Process queued work','Queue consumer','External worker today; Compute is private alpha']],
    takeaway:'An API request, a database function and a background worker run in different places.'
  },
  {
    id:'request', section:'ARCHITECTURE', duration:150, kind:'request',
    title:'Trace one request: create a task',
    lead:'A signed-in client sends a token and a new task through the Data API.',
    stages:[['01','Frontend','Atif submits a task from the browser.'],['02','Data API','PostgREST receives the request and user token.'],['03','Identity','The token supplies the authenticated user context.'],['04','PostgreSQL','Grants, row policies and constraints decide the write.'],['05','Response','The API returns success or an error.'],['06','Realtime','If configured, subscribers receive a change event.']],
    code:"await supabase.from('tasks').insert({ title: 'Review brief', owner_id: user.id })",
    definition:'Row Level Security: database policies that restrict which rows a role may access.',
    openapi:'OpenAPI describes the exposed REST routes; PostgREST handles the requests.',
    takeaway:'A token identifies the caller; database authorization still decides access.'
  },
  {
    id:'logic', section:'ARCHITECTURE', duration:120, kind:'table',
    title:'Where should application logic run?',
    lead:'Place work where its data, trust boundary and timing make sense.',
    columns:['Place','Use it for','Example · limitation'],
    rows:[['Database function / RPC','Logic near rows and transactions.','Create task + audit row · avoid long network calls.'],['Trigger','Automatic action invoked by a defined database event.','Stamp an audit row · hidden side effects need care.'],['Edge Function','TypeScript HTTP code in a Deno-compatible runtime.','Mail API · Express/Hono routing is optional; log failures.'],['Supabase Compute (alpha)','Long-running Linux API or worker beside Postgres.','Can host a full backend in principle; internal evaluation only today.'],['External backend','Production server you deploy and operate elsewhere.','NestJS on EC2 or Render for a long-running service today.'],['Queue worker','Reliable work after the request returns.','Send queued email · needs consumer and retry plan.']],
    example:'A task read can use the Data API. For email, keep the secret in an Edge Function; validate input and return useful errors.',
    takeaway:'RPC runs in Postgres. Edge Functions and Compute run separately; Compute is not production-ready yet.'
  },
  {
    id:'compute-focus', section:'ARCHITECTURE', duration:90, kind:'compute-focus',
    title:'Supabase Compute: a service beside Postgres',
    lead:'A managed full Linux runtime for long-running Node.js services or custom Dockerfile apps.',
    choices:[['Edge Function','Deno request handler for bounded server-side work.'],['Supabase Compute','HTTP API or private worker; may sleep when idle.'],['EC2 / VPS','A separate production server your team manages.']],
    examples:'Queue consumers · AI agents · bulk processing · long-running tasks',
    status:'Private Alpha; our project has no access. Supabase allows internal evaluation only, not production or end-customer use.',
    takeaway:'Compute could host a backend worker near Postgres later; keep production jobs on suitable external hosting for now.'
  },
  {
    id:'gateway', section:'ARCHITECTURE', duration:120, kind:'edge-gateway',
    title:'A gateway before expensive requests',
    lead:'An optional Cloudflare Worker can reject abusive traffic before it reaches selected Supabase endpoints.',
    stages:[['Client','Task app request'],['Cloudflare Worker','api.example.com · rate check'],['Supabase API / Edge Function','Receives allowed request'],['PostgreSQL','Runs permitted data work']],
    definitions:[['Cloudflare Worker','Code at Cloudflare’s edge; a separate service from Supabase.'],['Custom domain','Your hostname, such as api.example.com, routed to that Worker.'],['Rate limit','A rule that rejects requests after a chosen threshold.'],['Worker KV','Distributed key-value storage; not a strict global rate counter.']],
    cost:'As of Oct 2026: Free has 100,000 requests/day and 10 ms CPU/request. Paid starts at $5/month per account, plus possible usage charges.',
    caution:'Only routed traffic passes this gate. Secure direct Supabase endpoints, verify identity, keep secrets server-side, and enforce Auth + RLS.',
    takeaway:'Use a Worker for a branded API entry point and abuse filtering; it does not replace Supabase authorization.'
  },
  {
    id:'migrations', section:'SHIP', duration:165, kind:'workflow',
    title:'Change the schema safely',
    lead:'Make every table or column change a reviewed migration that can be replayed.',
    definitions:[['Schema','The structure of tables, views and other database objects.'],['Migration','A versioned SQL file that changes that structure.'],['Migration history','The record of changes already applied.'],['Local / staging / production','Developer machine / validation environment / live user environment.'],['Schema drift','A remote change that the migration files do not describe.']],
    steps:['Edit locally','Write migration','Commit + review','Validate in staging','Deploy to production'],
    code:'supabase init  →  supabase start  →  supabase migration new add_tasks  →  supabase db reset',
    takeaway:'Use CLI and Git together. Preview remote changes before applying them.'
  },
  {
    id:'branching', section:'SHIP', duration:105, kind:'workflow',
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
    title:'Choose the project region deliberately',
    lead:'The primary region affects latency and where core project data is hosted.',
    factors:[['Users','Measure latency near the main audience.'],['Data location','Check residency and contractual requirements.'],['Capabilities','Confirm required compute and service availability.'],['Recovery','Plan backup and disaster recovery needs.']],
    example:'For users in India, evaluate a nearby supported region such as Mumbai, then check customer and legal requirements.',
    caution:'Moving a project to another region requires a new project and migration.',
    takeaway:'The closest region is a starting point, not a universal answer.'
  },
  {
    id:'dashboard-start', section:'STUDIO', duration:80, kind:'dashboard',
    title:'Open the right project, then inspect data',
    lead:'These first three menu areas help you find the project, see rows and run a query.',
    path:'FIND THE PROJECT → INSPECT THE TASK',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Project Overview','Project identity, status and service shortcuts.','Confirm the demo project before any change.'],['Table Editor','Inspect tables, columns and rows visually.','Inspect public.tasks and task 101.'],['SQL Editor','Run or save SQL; inspect results and errors.','Check task rows with a read-only SELECT.']],
    caution:'Make deployed schema changes through tested migrations. Direct Table/SQL Editor edits bypass migration history; SQL Editor may have higher privileges than the app.',
    takeaway:'Confirm the project first; use Table Editor to inspect and SQL Editor for deliberate queries.'
  },
  {
    id:'dashboard-data', section:'STUDIO', duration:80, kind:'dashboard',
    title:'Find database rules, users and files',
    lead:'A task row, a signed-in identity and an uploaded PDF have different homes.',
    path:'ROW → IDENTITY → FILE',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Database','Schemas, RLS policies, functions, extensions, connections and backups.','Check the tasks RLS policy and database setup.'],['Authentication','Users, sign-in providers, sessions and redirect settings.','Find Atif’s user ID and login configuration.'],['Storage','Buckets, file objects, upload/download tools and access policies.','Find brief.pdf in a private bucket.']],
    caution:'Signing in does not authorize every row. Storage holds PDF bytes; the task row can hold its path.',
    takeaway:'Database decides row access, Auth supplies identity, and Storage serves files.'
  },
  {
    id:'dashboard-runtime', section:'STUDIO', duration:80, kind:'dashboard',
    title:'See server code, Compute and live events',
    lead:'Edge Functions and the new Compute service run outside PostgreSQL.',
    path:'REQUEST CODE → LONG-RUNNING SERVICE → LIVE DELIVERY',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Edge Functions','Request handlers, deployments, invocations and logs.','Trace a failed task-email call.'],['Compute (private alpha)','Linux API services and background jobs beside Postgres.','See the waitlist; this project has no access yet.'],['Realtime','Broadcast, Presence and Postgres Changes channels and reports.','Find why another task screen stayed stale.']],
    caution:'Compute is for internal evaluation only today, not production. Database CPU/RAM sizing is a separate setting; Realtime delivery needs configuration.',
    takeaway:'For a production long-running backend today, keep using suitable external hosting.'
  },
  {
    id:'dashboard-diagnose', section:'STUDIO', duration:80, kind:'dashboard',
    title:'Find why a request failed or slowed down',
    lead:'Use recommendations, trends and individual events together.',
    path:'FINDING → TREND → EVENT',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Advisors','Security and performance findings with suggested fixes.','Triage a task-policy error or index warning.'],['Observability','Slow queries, connections, resource and service-health reports.','Find slow writes or sessions waiting for a lock.'],['Logs','Searchable, timestamped API, database, Auth and function events.','Match a failed request to its error.']],
    caution:'Review Security Advisor errors and warnings. Investigate each finding before changing permissions; select the right project and time range.',
    takeaway:'Observability shows a pattern; Logs help identify the specific event behind it.'
  },
  {
    id:'dashboard-configure', section:'STUDIO', duration:80, kind:'dashboard',
    title:'Connect tools and configure the project',
    lead:'The final menu areas change how this project connects to other systems and clients.',
    path:'EXTERNAL TOOL → PROJECT CONFIGURATION',
    columns:['Dashboard section','What you get','When Atif opens it'],
    rows:[['Integrations','Partner connections, wrappers and database extensions.','Connect monitoring after checking permissions.'],['Project Settings','Project URL, API keys, database connections and service settings.','Copy the staging project URL and publishable key.']],
    caution:'A publishable key is for clients only when grants and RLS protect data; secret keys stay server-side. Check integration access and cost.',
    takeaway:'Next, use organization Usage and Billing to see what these services consume.'
  },
  {
    id:'usage', section:'OPERATE', duration:240, kind:'usage',
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
    rows:[['Protect dashboard access','Add and test a backup authenticator on another device; keep another organization owner.','Dashboard two-factor sign-in has no recovery codes. Losing every factor can lock out an account.'],['Change schema through migrations','Create, review and test a migration for each table or column change.','Direct remote edits bypass migration history.'],['Triage Security Advisor','Review errors and warnings; fix issues or document intentional exceptions.','Findings can expose unsafe access or configuration.'],['Watch Observability','Check query, connection and service trends regularly; use Logs to investigate.','A failed request or growing wait should be visible before it spreads.'],['Read official docs first','Check Supabase Developer Docs for behavior, commands and plan rules.','Dashboard and product details change.']],
    takeaway:'Keep access recoverable, schema in code and production behavior visible.'
  },
  {
    id:'demo', section:'OPERATE', duration:300, kind:'demo',
    title:'Five-minute task-app walkthrough',
    lead:'Use a disposable demo project. The prepared sequence also works offline.',
    stops:[['Table Editor','Find public.tasks and identify one task row.'],['Authentication','Show the user ID; hide email and tokens.'],['Data API','Explain how a permitted row reaches the client.'],['Migration','Open the reviewed SQL file that created the table.'],['Storage','Point to the PDF object in a private bucket.'],['Logs + Usage','Locate a function error and invocation count.']],
    takeaway:'The same feature crosses data, identity, API, files and operations.'
  },
  {
    id:'wrap', section:'FINISH', duration:100, kind:'wrap',
    title:'Ship with a clear map of responsibilities',
    lead:'Start with the smallest set of Supabase capabilities the product needs.',
    takeaways:[['01','Know where work runs','Client, managed service, Postgres or external worker.'],['02','Make access and changes explicit','Auth, RLS, migrations, staging and region.'],['03','Operate what you ship','Check Usage, Logs and real user impact.']],
    checklist:'Before release: test permissions · review migrations · validate staging · inspect usage · plan recovery.',
    takeaway:'Supabase supplies backend parts. Engineering choices make them a reliable product.'
  }
];

export const totalSeconds = slides.reduce((sum, slide) => sum + slide.duration, 0);
