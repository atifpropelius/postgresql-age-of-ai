// Keep these IDs in step with src/slides.js. This route is for the presenter, not the audience deck.
export const presenterNotes = {
  title: {
    say: 'Aaj hum ek task app ke through dekhenge: request kahan jaati hai, data kahan rehta hai, aur code kahan run hota hai.',
    what: 'Talk ka map: Supabase services, execution boundaries, aur production workflow.',
    why: 'Jab service ki responsibility clear hoti hai, architecture aur debugging dono easy hote hain.',
    how: 'Pehle ek private task app introduce karo. Har agle slide par usi app ka ek action follow karo.',
    links: [['Supabase architecture', 'https://supabase.com/docs/guides/getting-started/architecture']]
  },
  what: {
    say: 'Atif sign in karta hai, task save karta hai aur PDF attach karta hai. Supabase common backend parts deta hai; access rules humein define karne hain.',
    what: 'Supabase managed Postgres ke saath Auth, Data API, Storage aur doosri services deta hai.',
    why: 'Basic backend setup jaldi milta hai. Team phir bhi data model, permissions, testing aur operations ki owner rehti hai.',
    how: 'Task row Postgres mein, identity Auth mein, PDF bytes Storage mein. NestJS jaisa custom server tab add hota hai jab apna runtime chahiye.',
    links: [['Supabase architecture', 'https://supabase.com/docs/guides/getting-started/architecture']]
  },
  context: {
    say: 'Ye adoption figures company ke dated statements hain. Architecture ka decision apni app ki needs se lenge.',
    what: 'Adoption aur funding context, plus Lovable aur Figma Make examples.',
    why: 'Ecosystem ki scale samajh aati hai, lekin popularity se workload fit prove nahi hota.',
    how: 'Figma Make integration ka zikr karo; Figma ke core design product ke backend ka claim mat banao. Developer count ko paying users na kaho.',
    links: [['Supabase Series F announcement', 'https://supabase.com/blog/series-f'], ['Figma Make integration', 'https://supabase.com/blog/figma-make-support-for-supabase']]
  },
  components: {
    say: 'Is table mein har row ek alag responsibility hai. Data API ke peeche PostgREST, Edge Functions ke peeche Supabase Edge Runtime, Realtime ke peeche WebSocket service, aur Queues ke peeche pgmq extension hai.',
    what: 'PostgreSQL data core hai. Data API, Auth, Storage, Realtime aur Edge Functions alag services hain; pgmq aur pg_cron extensions ke examples hain.',
    why: 'Naam dekhkar sabko PostgreSQL extension samajhna easy hai. Service aur database feature ka farq samjhana zaroori hai.',
    how: 'Data API, Edge Functions, Realtime aur Queues rows par point karo. Inke technical flows neeche diye hain; phir baaki rows ko ek line mein cover karo.',
    links: [['Supabase architecture', 'https://supabase.com/docs/guides/getting-started/architecture'], ['PostgREST architecture', 'https://docs.postgrest.org/en/v16/explanations/architecture.html'], ['Edge Functions', 'https://supabase.com/docs/guides/functions'], ['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture'], ['Supabase Queues', 'https://supabase.com/docs/guides/queues']],
    deepDive: [
      {
        title: 'Data API / PostgREST',
        badge: 'SEPARATE WEB SERVER',
        lines: [
          'PostgREST PostgreSQL ka extension ya built-in feature nahi hai. Ye independent open-source HTTP server hai, jise Supabase Data API ke liye use karta hai.',
          'Exposed table/view/function ko dekhkar ek generic route handler request samajhta hai. Har table ke liye alag GET code file nahi banti.',
          'GET /rest/v1/products?select=* → API gateway → PostgREST → PostgreSQL query → JSON response. Conceptually query SELECT * FROM products jaisi hai; exact generated SQL alag ho sakti hai.',
          'Route dikhne se data public nahi ho jaata. Grants aur RLS decide karte hain ki caller kya padh sakta hai.'
        ],
        links: [['PostgREST official docs', 'https://docs.postgrest.org/en/v16/'], ['PostgREST architecture', 'https://docs.postgrest.org/en/v16/explanations/architecture.html'], ['Supabase Data API', 'https://supabase.com/docs/guides/api']]
      },
      {
        title: 'Edge Functions / Edge Runtime',
        badge: 'SUPABASE WEB RUNTIME + YOUR CODE',
        lines: [
          'Edge Functions PostgreSQL ka extension nahi hain. Inhe chalane ke liye Supabase apna open-source Edge Runtime use karta hai, jo Deno par based web server hai.',
          'PostgREST ready-made generic CRUD logic chalata hai. Edge Function mein HTTP handler ka TypeScript code aap likhte aur deploy karte ho; function ke naam se /functions/v1/send-task-email jaisa endpoint milta hai.',
          'Client → Supabase gateway → Edge Runtime → aapka function → Supabase API, direct PostgreSQL connection, ya external mail/payment API → HTTP response.',
          'Function database ke bahar run hoti hai. Supabase client use kare to Data API/PostgREST se baat kar sakti hai; Postgres driver use kare to direct/pooler connection se bhi. Authorization function ke flow ke hisaab se check karni hoti hai.'
        ],
        links: [['Edge Functions official docs', 'https://supabase.com/docs/guides/functions'], ['Supabase Edge Runtime source', 'https://github.com/supabase/edge-runtime'], ['Function quickstart', 'https://supabase.com/docs/guides/functions/quickstart']]
      },
      {
        title: 'Realtime',
        badge: 'SEPARATE WEBSOCKET SERVICE',
        lines: [
          'Realtime bhi kisi ek PostgreSQL extension se nahi chalta. Supabase ka alag Elixir/Phoenix server clients se WebSocket connection rakhta hai.',
          'Database changes ke liye PostgreSQL ki built-in logical replication use hoti hai: WAL → publication/replication slot → Realtime server → subscribed clients.',
          'supabase_realtime ek PostgreSQL publication ka naam hai, extension ka naam nahi. Sirf selected tables ke changes stream hote hain.',
          'Broadcast aur Presence Realtime ke doosre modes hain. Client Broadcast ke liye table change zaroori nahi; database se Broadcast bhejne par realtime.messages/WAL path use hota hai.'
        ],
        links: [['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture'], ['Subscribe to Postgres changes', 'https://supabase.com/docs/guides/realtime/subscribing-to-database-changes'], ['Realtime concepts', 'https://supabase.com/docs/guides/realtime/concepts']]
      },
      {
        title: 'Queues / pgmq',
        badge: 'DATABASE EXTENSION + YOUR CONSUMER',
        lines: [
          'Is row mein pgmq sach mein PostgreSQL extension hai. Ye messages ko Postgres queue table mein durable tarike se rakhta hai; pgmq apne aap email bhejne wala worker nahi chalata.',
          'Task assigned → app queue mein {task_id, recipient_id} message daalta hai. Consumer message read karta hai, mail provider ko call karta hai, success par message delete/archive karta hai.',
          'Consumer code aapko banana hota hai. Chhote bounded jobs ke liye Supabase Edge Function hi consumer ban sakti hai; alag always-on server zaroori nahi.',
          'Bahut lamba ya continuous processing ho to separately hosted worker better fit ho sakta hai; woh bhi wahi queue read karega.',
          'Queue pull-based hai: naya message Edge Function ko apne aap invoke nahi karta. Function ko Supabase Cron (pg_cron + pg_net) se schedule karo, ya trusted app se invoke karo.',
          'Read ke baad message visibility timeout tak doosre consumers se chhipta hai. Failure par delete na karo; timeout ke baad retry ho sakta hai. Email jaisi side effect ko duplicate-safe rakho.'
        ],
        links: [['Queues overview', 'https://supabase.com/docs/guides/queues'], ['Edge Function consumer example', 'https://supabase.com/docs/guides/queues/consuming-messages-with-edge-functions'], ['Scheduling Edge Functions', 'https://supabase.com/docs/guides/functions/schedule-functions'], ['pgmq extension', 'https://supabase.com/docs/guides/queues/pgmq']]
      }
    ]
  },
  where: {
    say: 'Ek task save hone par API request ek jagah run hoti hai, row database mein store hoti hai, aur update Realtime se doosre screen tak ja sakta hai.',
    what: 'App ke har action ka entry point aur actual execution/storage location.',
    why: 'Data row, file bytes, email delivery aur background job ki ownership alag hai.',
    how: 'Sign-in → Auth; task row → Data API/Postgres; PDF → Storage; live update → Realtime WebSocket; app email → trusted server code.',
    links: [['Supabase architecture', 'https://supabase.com/docs/guides/getting-started/architecture'], ['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture']]
  },
  request: {
    say: 'supabase.from("tasks").insert(...) HTTP request banata hai. PostgREST SQL execute karwata hai; PostgreSQL grants aur RLS se decide karta hai ki row likh sakte hain ya nahi.',
    what: 'Signed-in client se task insert tak ka Data API request flow.',
    why: 'Token identity batata hai; permission database policy deti hai. Sirf login kaafi nahi.',
    how: 'Client → Supabase gateway → PostgREST → Postgres → JSON response. Realtime event tabhi aayega jab relevant flow configured ho.',
    links: [['PostgREST architecture', 'https://docs.postgrest.org/en/v16/explanations/architecture.html'], ['Data API security', 'https://supabase.com/docs/guides/api/securing-your-api'], ['Row Level Security', 'https://supabase.com/docs/guides/database/postgres/row-level-security']],
    deepDive: [{
      title: 'GET endpoint “banta” kaise hai?',
      badge: 'REQUEST-TIME ROUTING',
      lines: [
        'Database mein products table banao aur usko API ke liye expose/authorize karo. PostgREST uska schema metadata cache karta hai.',
        'GET /rest/v1/products?select=* par PostgREST path aur select parameter parse karke SQL query generate karta hai. PostgreSQL result deta hai, PostgREST JSON bhejta hai.',
        'Ye PostgreSQL ke andar likha HTTP route nahi hai. Ye Express handler ki tarah ek ready-made web server ka generic logic hai.'
      ],
      links: [['PostgREST official docs', 'https://docs.postgrest.org/en/v16/'], ['Supabase API routes', 'https://supabase.com/docs/guides/api/creating-routes']]
    }]
  },
  logic: {
    say: 'Atomic row work database function mein, external email Edge Function mein, aur retryable long work worker mein rakho. Edge Function ka HTTP handler hum khud likhte hain.',
    what: 'SQL function/RPC, trigger, Edge Function, Compute aur external backend ke roles.',
    why: 'Kaam ki duration, secrets aur transaction needs execution location decide karti hain.',
    how: 'RPC/trigger Postgres ke andar run karte hain. Edge Function separate Deno-based runtime mein aapka TypeScript HTTP code chalati hai. Email queue ka consumer bhi Edge Function ho sakta hai; Cron invoke kare, function message read/process/delete kare.',
    links: [['Database functions', 'https://supabase.com/docs/guides/database/functions'], ['Edge Functions', 'https://supabase.com/docs/guides/functions'], ['Edge Runtime source', 'https://github.com/supabase/edge-runtime'], ['Queue consumer with Edge Functions', 'https://supabase.com/docs/guides/queues/consuming-messages-with-edge-functions']],
    deepDive: [{
      title: 'PostgREST aur Edge Function ka farq',
      badge: 'AUTOMATIC ROUTE VS CUSTOM CODE',
      lines: [
        'PostgREST: products table expose karo → /rest/v1/products route par generic server SQL generate karta hai. Har table ke liye HTTP handler code nahi likhna padta.',
        'Edge Function: send-task-email function ka TypeScript handler aap likhte/deploy karte ho → /functions/v1/send-task-email route par Edge Runtime us code ko chalata hai.',
        'Function ke andar Supabase client se PostgREST Data API call ho sakti hai, ya suitable PostgreSQL driver se direct/pooler connection ho sakta hai. External API bhi call ho sakti hai.'
      ],
      links: [['Edge Functions', 'https://supabase.com/docs/guides/functions'], ['PostgREST architecture', 'https://docs.postgrest.org/en/v16/explanations/architecture.html']]
    }]
  },
  'compute-focus': {
    say: 'Yahan Compute ek alag long-running service ka idea hai, database CPU/RAM ka naam nahi. Abhi private alpha hai aur is project mein access nahi hai.',
    what: 'HTTP service aur queue worker ke conceptual Compute flows.',
    why: 'Edge request handlers aur persistent work ki runtime needs alag hoti hain.',
    how: 'Diagram ke do paths follow karo: request se service, ya queue se worker. Current preview ko production solution ki tarah promise mat karo.',
    links: [['Supabase Compute', 'https://supabase.com/compute'], ['Edge Function limits', 'https://supabase.com/docs/guides/functions/limits']]
  },
  'database-connections': {
    say: 'Ye teen choices sirf raw Postgres driver ke liye hain. Browser ka supabase-js Data API call HTTPS use karta hai.',
    what: 'Direct, transaction pooler aur session pooler database connections.',
    why: 'Short-lived requests bahut connections khol sakte hain; pooler database connection reuse karta hai.',
    how: 'Persistent NestJS server: direct + app pool. Serverless: transaction pooler. Session state/IPv4 route: session pooler. Driver support check karo.',
    links: [['Connect to Postgres', 'https://supabase.com/docs/guides/database/connecting-to-postgres'], ['Pooling and limits', 'https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits']]
  },
  'edge-limits': {
    say: 'Worker lifetime aur HTTP response deadline ek hi cheez nahi hain. Plan ke included invocations bhi runtime limits se alag hain.',
    what: 'Hosted Edge Function memory, CPU, lifetime aur invocation allowances.',
    why: 'Long work ko galat runtime mein rakhne se timeout ya resource errors milte hain.',
    how: 'Table par Free/Pro figures dikhayo; 150s idle timeout aur monthly invocation allowance ko separately explain karo. Delivery se pehle current docs check karo.',
    links: [['Edge Function limits', 'https://supabase.com/docs/guides/functions/limits'], ['Edge Function pricing', 'https://supabase.com/docs/guides/functions/pricing']]
  },
  gateway: {
    say: 'Cloudflare Worker optional gateway hai jo allowed request Supabase tak forward karta hai aur excess traffic ko pehle rok sakta hai.',
    what: 'Supabase ke aage separate Cloudflare Worker rate-check example.',
    why: 'Costly request endpoint par pahunchne se pehle unwanted bursts ko reduce kar sakte hain.',
    how: 'Client → api.example.com Worker → Supabase API/Function → Postgres. Direct Supabase URL reachable ho to Worker rule bypass ho sakta hai; Auth/RLS phir bhi chahiye.',
    links: [['Cloudflare Workers pricing', 'https://developers.cloudflare.com/workers/platform/pricing/'], ['Supabase API security', 'https://supabase.com/docs/guides/api/securing-your-api']]
  },
  migrations: {
    say: 'Schema change ko reviewed SQL migration mein rakho; local test, staging test, phir production apply karo.',
    what: 'Versioned schema workflow: local development se production tak.',
    why: 'Migration history repeatable change deti hai aur dashboard-only edits se drift kam hota hai.',
    how: 'Slide ke steps point karo. Local reset disposable data delete karta hai; production reset ka step nahi hai.',
    links: [['Database migrations', 'https://supabase.com/docs/guides/deployment/database-migrations'], ['Local development', 'https://supabase.com/docs/guides/local-development/cli-workflows']]
  },
  branching: {
    say: 'Preview branch ek isolated project environment hai. Production rows aur files default se copy nahi hote; branch usage billable hoti hai.',
    what: 'Short-lived preview aur persistent branch ka purpose.',
    why: 'Team production se alag schema aur app behavior verify kar sakti hai.',
    how: 'Feature branch par migration test karo; staging data/secrets alag plan karo. Short-lived branch cost compare karo, automatic saving assume mat karo.',
    links: [['Supabase branching', 'https://supabase.com/docs/guides/deployment/branching'], ['Branching usage', 'https://supabase.com/docs/guides/platform/manage-your-usage/branching']]
  },
  region: {
    say: 'Region users ke latency aur data location dono ko affect karta hai. Later change ke liye naya project aur migration chahiye.',
    what: 'Project region ka selection.',
    why: 'Wrong region performance aur residency requirements ko affect kar sakta hai.',
    how: 'User location, legal requirements aur connected services ki location compare karo; production se pehle decide karo.',
    links: [['Available regions', 'https://supabase.com/docs/guides/platform/regions'], ['Change project region', 'https://supabase.com/docs/guides/troubleshooting/change-project-region-eWJo5Z']]
  },
  'dashboard-start': {
    say: 'Overview environment confirm karta hai; Table Editor rows dikhata hai; SQL Editor deliberate query run karta hai.',
    what: 'Studio ke starting areas aur data inspection tools.',
    why: 'Galat project mein change karna ya privileged SQL result ko client access samajhna dangerous hai.',
    how: 'Pehle project URL/environment verify karo. SQL Editor ka role browser client ke RLS behavior se alag ho sakta hai.',
    links: [['Database tables', 'https://supabase.com/docs/guides/database/tables'], ['Row Level Security', 'https://supabase.com/docs/guides/database/postgres/row-level-security']]
  },
  'dashboard-data': {
    say: 'Task row database mein hai, user Auth mein, aur PDF Storage mein. Private PDF par access check zaroori hai.',
    what: 'Database, Authentication aur Storage dashboard areas.',
    why: 'Public asset aur confidential document ki access strategy ek jaisi nahi ho sakti.',
    how: 'Public image CDN se serve ho sakti hai; confidential PDF private bucket + Storage RLS ya checked signed URL use kare.',
    links: [['Storage bucket access', 'https://supabase.com/docs/guides/storage/buckets/fundamentals'], ['Storage access control', 'https://supabase.com/docs/guides/storage/security/access-control']]
  },
  'dashboard-runtime': {
    say: 'Edge Functions request code chalati hain; Compute private alpha mein longer work ke liye hai; Realtime subscribed clients tak update push karta hai.',
    what: 'Studio mein Edge Functions, Compute aur Realtime ke views.',
    why: 'Ye teen alag runtimes/jobs hain; failures ki jagah bhi alag hogi.',
    how: 'Realtime ke Postgres Changes path mein WAL/logical replication + separate WebSocket service hai. Compute ko database CPU setting na samjhao.',
    links: [['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture'], ['Supabase Compute', 'https://supabase.com/compute']]
  },
  'dashboard-diagnose': {
    say: 'Advisor possible issue flag karta hai, Observability trend dikhata hai, aur Logs ek request/event ka evidence dete hain.',
    what: 'Security Advisor, Observability aur Logs.',
    why: 'Release ke baad silent failure ya slow query ko locate karna hota hai.',
    how: 'Service aur time filter karke failed task save ka log kholo; warning count bhi review karo, sirf errors nahi.',
    links: [['Advisors', 'https://supabase.com/docs/guides/observability/advisors'], ['Logs', 'https://supabase.com/docs/guides/observability/logs']]
  },
  'dashboard-configure': {
    say: 'Integrations external tools jodta hai; Project Settings mein URL, keys aur service configuration milti hai.',
    what: 'Studio ke integration aur project configuration areas.',
    why: 'Keys aur third-party permissions project security aur cost dono par asar dalte hain.',
    how: 'Publishable key client mein tabhi theek hai jab permissions/RLS set hon. Secret key server par rakho.',
    links: [['API keys', 'https://supabase.com/docs/guides/getting-started/api-keys'], ['Integrations', 'https://supabase.com/docs/guides/integrations']]
  },
  usage: {
    say: 'Usage page mein used versus included allowance padho. Egress, function calls, database compute aur log usage alag counters hain.',
    what: 'Illustrative Pro snapshot aur eleven usage metrics.',
    why: 'Ek metric ka low usage total bill ka guarantee nahi hai; overage rules metric-specific hain.',
    how: 'PDF repeat downloads ka egress example do. Spend Cap ON/OFF aur exclusions explain karo; Upcoming Invoice bhi dekho.',
    links: [['Manage usage', 'https://supabase.com/docs/guides/platform/manage-your-usage'], ['Cost control', 'https://supabase.com/docs/guides/platform/cost-control']]
  },
  habits: {
    say: 'Release routine: account access backup, migrations, Advisor findings, Logs/Observability aur current docs.',
    what: 'Reliable project ke five operating habits.',
    why: 'Lockout, schema drift aur unnoticed failures se bachne ke liye routine chahiye.',
    how: 'Backup authenticator test karo; second organization owner rakho; warnings aur error logs regular review karo.',
    links: [['Account MFA', 'https://supabase.com/docs/guides/platform/multi-factor-authentication'], ['Security Advisors', 'https://supabase.com/docs/guides/observability/advisors']]
  },
  demo: {
    say: 'Ab ek task ko six stops mein follow karte hain: table, user, request, migration, file aur logs.',
    what: 'Five-minute task-app walkthrough.',
    why: 'Audience ek feature ko data, identity, API, files aur operations mein dekh paati hai.',
    how: 'Data API ko shown task-read route rakho. Screen par prepared illustration hai, live project data nahi. Real demo fail ho to isi slide sequence se continue karo.',
    links: [['Data API routes', 'https://supabase.com/docs/guides/api/creating-routes'], ['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture']]
  },
  wrap: {
    say: 'Yaad rakho: work kahan run hota hai, access kaun decide karta hai, aur release ke baad kaise observe karna hai.',
    what: 'Talk ka three-point recap.',
    why: 'Clear ownership ke bina managed services bhi unreliable product bana sakti hain.',
    how: 'Checklist repeat karo: permissions test, migration review, staging validation, usage inspection aur recovery plan.',
    links: [['Supabase Developer Docs', 'https://supabase.com/docs']]
  }
};
