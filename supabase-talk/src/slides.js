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
    id:'what', section:'FOUNDATION', duration:150, kind:'table',
    title:'What is Supabase, and why use it?',
    lead:'Supabase is a managed backend platform built around PostgreSQL.',
    definitions:[['Backend as a Service','Hosted building blocks for data, identity, files and server-side work.'],['Custom backend','Application servers your team designs, deploys and operates.']],
    columns:['Decision','Supabase','Custom NestJS / Node.js'],
    rows:[['Starting point','Database, Auth, APIs and Storage are available.','Build and integrate each capability yourself.'],['Best fit','A product that benefits from an integrated Postgres backend.','Unusual workflows or deep control of runtime and infrastructure.'],['Your responsibility','Data model, RLS, business rules, testing and operations.','The same concerns, plus service infrastructure.']],
    example:'Atif can build a private task app without first writing an Auth service or file API.',
    takeaway:'Supabase saves setup time; your team still owns product logic and safe access.'
  },
  {
    id:'context', section:'FOUNDATION', duration:75, kind:'context',
    title:'Why this platform is worth understanding',
    lead:'Adoption provides context. It does not decide whether the architecture fits.',
    facts:[['Nearly 10 million','developers building on Supabase, reported in June 2026'],['Udio','published a customer story describing Supabase in its backend'],['$10.5 billion','post-money valuation implied by $500M at $10B pre-money, June 2026']],
    footnote:'Developers are not paying customers or monthly active users. These are dated, company-reported facts.',
    takeaway:'Evaluate the platform by your workload, constraints and team skills.'
  },
  {
    id:'components', section:'FOUNDATION', duration:195, kind:'services',
    title:'What does a Supabase project provide?',
    lead:'PostgreSQL is the data core. The other capabilities have separate jobs.',
    columns:['Component','One-line definition','Typical task-app use'],
    rows:[['PostgreSQL','Database that stores rows and executes SQL.','Store tasks and permissions.'],['Data API / PostgREST','HTTP API generated over exposed database objects.','Read or create task rows.'],['Authentication','Service that identifies users and issues sessions.','Sign Atif in.'],['Storage','File service backed by object storage and metadata.','Upload a PDF.'],['Realtime','Service that delivers live events over WebSockets.','Show a task update.'],['Edge Functions','Hosted server-side TypeScript request handlers.','Call a mail provider.'],['Queues','Durable messages in Postgres, powered by pgmq.','Wait for an email worker.'],['Cron','Scheduled jobs in Postgres, powered by pg_cron.','Run a daily reminder.'],['Functions / triggers','SQL routines and event-driven database actions.','Keep a related update atomic.'],['Extensions','Installable PostgreSQL capabilities.','Add pgmq or pg_cron.']],
    takeaway:'These pieces work together; they do not all run inside one process.'
  },
  {
    id:'where', section:'ARCHITECTURE', duration:225, kind:'architecture',
    title:'The central question: what runs where?',
    lead:'Follow Atif as he signs in, creates a task, attaches a PDF and sees an update.',
    columns:['Action','Entry point','Execution / destination'],
    rows:[['Sign in','Auth API','Auth service; identity data in project database'],['Create or read task','Data API','Postgres validates, applies RLS and stores rows'],['Upload PDF','Storage API','File bytes in object storage; metadata in Postgres'],['Receive update','Realtime','Service pushes an event to subscribed clients'],['Send email','Edge Function','Hosted function calls external mail provider'],['Update related data','RPC / trigger','Postgres executes a function or trigger'],['Process queued work','Queue consumer','External worker reads a Postgres-backed queue']],
    takeaway:'An API request, a database function and a background worker run in different places.'
  },
  {
    id:'request', section:'ARCHITECTURE', duration:195, kind:'request',
    title:'Trace one request: create a task',
    lead:'A signed-in client sends a token and a new task through the Data API.',
    stages:[['01','Frontend','Atif submits a task from the browser.'],['02','Data API','PostgREST receives the request and user token.'],['03','Identity','The token supplies the authenticated user context.'],['04','PostgreSQL','Grants, row policies and constraints decide the write.'],['05','Response','The API returns success or an error.'],['06','Realtime','If configured, subscribers receive a change event.']],
    code:"await supabase.from('tasks').insert({ title: 'Review brief', owner_id: user.id })",
    definition:'Row Level Security: database policies that restrict which rows a role may access.',
    openapi:'OpenAPI describes the exposed REST routes; PostgREST handles the requests.',
    takeaway:'A token identifies the caller; database authorization still decides access.'
  },
  {
    id:'logic', section:'ARCHITECTURE', duration:165, kind:'table',
    title:'Where should application logic run?',
    lead:'Place work where its data, trust boundary and timing make sense.',
    columns:['Place','Use it for','Example · limitation'],
    rows:[['Database function / RPC','Logic near rows and transactions.','Create task + audit row · avoid long network calls.'],['Trigger','Automatic action invoked by a defined database event.','Stamp an audit row · hidden side effects need care.'],['Edge Function','Trusted HTTP code and external integrations.','Call mail API · execution time and secrets matter.'],['External backend','Dedicated services and custom infrastructure.','Complex workflow · you operate the service.'],['Worker','Reliable work after the request returns.','Send queued email · needs consumer and retry plan.']],
    example:'A simple task read can use the Data API directly; a mail-provider secret stays in trusted server code.',
    takeaway:'RPC executes in PostgreSQL. An Edge Function executes in a separate runtime.'
  },
  {
    id:'migrations', section:'SHIP', duration:210, kind:'workflow',
    title:'Change the schema safely',
    lead:'Treat database changes as reviewed code that can be replayed.',
    definitions:[['Schema','The structure of tables, views and other database objects.'],['Migration','A versioned SQL file that changes that structure.'],['Migration history','The record of changes already applied.'],['Local / staging / production','Developer machine / validation environment / live user environment.'],['Schema drift','A remote change that the migration files do not describe.']],
    steps:['Edit locally','Write migration','Commit + review','Validate in staging','Deploy to production'],
    code:'supabase init  →  supabase start  →  supabase migration new add_tasks  →  supabase db reset',
    takeaway:'Use CLI and Git together. Preview remote changes before applying them.'
  },
  {
    id:'branching', section:'SHIP', duration:135, kind:'workflow',
    title:'Branches are test environments',
    lead:'A feature branch can validate a migration before it reaches production.',
    definitions:[['Production branch','The main project serving live users.'],['Persistent branch','A long-lived branch for staging or QA.'],['Temporary branch','A preview branch removed after short-lived work.'],['Branch configuration','The branch-specific URLs, keys, secrets and service settings.']],
    steps:['Feature branch','Preview project','Apply migration','Run tests','Merge after review'],
    cost:'A short-lived preview branch can cost less than keeping a separate test project running all month. Branch usage is outside the Spend Cap; a persistent branch is not automatically cheaper.',
    caution:'Branches are data-less by default. Check secrets, integrations and cost; availability depends on plan and setup.',
    takeaway:'Use preview branches for temporary tests, then delete them. Compare actual branch usage with a separate project.'
  },
  {
    id:'region', section:'SHIP', duration:120, kind:'region',
    title:'Choose the project region deliberately',
    lead:'The primary region affects latency and where core project data is hosted.',
    factors:[['Users','Measure latency near the main audience.'],['Data location','Check residency and contractual requirements.'],['Capabilities','Confirm required compute and service availability.'],['Recovery','Plan backup and disaster recovery needs.']],
    example:'For users in India, evaluate a nearby supported region such as Mumbai, then check customer and legal requirements.',
    caution:'Moving a project to another region requires a new project and migration.',
    takeaway:'The closest region is a starting point, not a universal answer.'
  },
  {
    id:'usage', section:'OPERATE', duration:330, kind:'usage',
    title:'Read the Usage page before costs surprise you',
    lead:'Usage is measured activity. An allowance is the amount included in a plan; overage rules differ by metric.',
    snapshot:[['Edge invocations','199,095 / 2,000,000','function calls'],['Egress','0.79 / 250 GB','outgoing data'],['Log ingestion','3.07 / 20 GB','collected logs']],
    metrics:[['Egress','GB sent out; big downloads increase it.'],['Cached egress','GB served from CDN cache hits.'],['Storage size','GB of stored file objects.'],['Database disk','GB of database disk used or provisioned; read the chart label.'],['MAU','Distinct Auth users active in a billing period.'],['Edge invocations','Number of function executions.'],['Realtime messages','Messages delivered to subscribers.'],['Peak connections','Highest simultaneous Realtime clients.'],['Log ingestion','GB of logs collected.'],['Log query','GB of log data scanned by searches.'],['Compute hours','Hours project compute runs at its selected size.']],
    spendCap:'Pro defaults to ON. Turning it OFF permits billable overages for covered usage; keeping it ON may restrict usage at quota. Compute and branch compute remain billable.',
    example:'A PDF repeatedly downloaded without caching can raise egress while storage size barely changes.',
    takeaway:'Before changing Spend Cap, review Usage and Upcoming Invoice. It does not cap the whole bill.'
  },
  {
    id:'demo', section:'OPERATE', duration:300, kind:'demo',
    title:'Five-minute task-app walkthrough',
    lead:'Use a disposable demo project. The prepared sequence also works offline.',
    stops:[['Table Editor','Find public.tasks and identify one task row.'],['Authentication','Show the user ID; hide email and tokens.'],['Data API','Explain how a permitted row reaches the client.'],['Migration','Open the reviewed SQL file that created the table.'],['Storage','Point to the PDF object in a private bucket.'],['Logs + Usage','Locate a function error and invocation count.']],
    takeaway:'The same feature crosses data, identity, API, files and operations.'
  },
  {
    id:'wrap', section:'FINISH', duration:120, kind:'wrap',
    title:'Ship with a clear map of responsibilities',
    lead:'Start with the smallest set of Supabase capabilities the product needs.',
    takeaways:[['01','Know where work runs','Client, managed service, Postgres or external worker.'],['02','Make access and changes explicit','Auth, RLS, migrations, staging and region.'],['03','Operate what you ship','Check Usage, Logs and real user impact.']],
    checklist:'Before release: test permissions · review migrations · validate staging · inspect usage · plan recovery.',
    takeaway:'Supabase supplies backend parts. Engineering choices make them a reliable product.'
  }
];

export const totalSeconds = slides.reduce((sum, slide) => sum + slide.duration, 0);
