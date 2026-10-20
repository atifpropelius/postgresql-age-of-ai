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
    say: 'Online store socho: ek customer ke kai orders hain, aur har order mein kai items. Ye relational PostgreSQL project hai. Aise project mein Supabase ke saath ja sakte ho. Auth, API aur Storage ready milte hain, isliye developer aur DevOps dono ka time bachta hai.',
    what: 'Example: customers, orders aur order items aapas mein linked hain.',
    why: 'PostgreSQL aur common backend services ready milne se setup time bachta hai.',
    how: 'Customer → orders → items ka relation dikhao, phir time-saving point bolo.',
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
    say: 'Supabase ki kaafi power PostgreSQL ki wajah se hai: data, SQL, RLS, functions, queues aur cron. Data API isi data ko expose karta hai, aur Realtime ka database-changes mode PG se updates leta hai. Auth, Storage, Edge Functions aur Compute alag services hain.',
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
    say: 'Linux runtime ka matlab Supabase-managed Linux OS environment hai jahan aapka app process chalega. Apni custom app Dockerfile se bhi package kar sakte ho. AI agent ka code us service mein data padhta, model API call karta aur result save karta hai. Ye Compute private alpha mein hai.',
    what: 'Compute service ko apna Linux environment, CPU aur memory milte hain. Node/Python/custom Dockerfile app chal sakti hai. Agent code execution ke liye per-task sandbox alag option hai.',
    why: 'Agent ka orchestration code aur code-execution environment alag needs hain. Service request/job handle karti hai; sandbox untrusted generated code ko isolate karta hai.',
    how: 'Example: Atif PDF ka summary maangta hai → app Compute agent service ko call karti hai → agent allowed Storage/Postgres data padhta hai → chosen external LLM API se summary leta hai → result Postgres mein save karta hai. Code chalana ho to agent Compute API/MCP se sandbox create kar sakta hai. Service idle par suspend aur under ek second resume hoti hai; active work par wall-clock limit nahi. pgmq message se sleeping worker ka automatic wake-up public docs mein specified nahi hai.',
    links: [['Supabase Compute: services, sandboxes, sleep, alpha', 'https://supabase.com/compute'], ['Supabase Select Compute announcement', 'https://supabase.com/blog/supabase-select-2026-recap']],
    deepDive: [{
      title: 'AI agent Compute par kya chalata hai?',
      badge: 'SERVICE + OPTIONAL SANDBOX',
      lines: [
        'Linux runtime: aapke app ko Supabase-managed microVM mein Linux OS environment, CPU aur memory milte hain. Ye PostgreSQL ke andar chalne wala SQL extension nahi hai.',
        'Dockerfile support: custom app aur uski dependencies Dockerfile mein define karke Compute service ke roop mein chalane ka announced support hai. Iska matlab VM ke andar Docker daemon, docker-compose ya privileged containers ka support assume nahi karna chahiye.',
        'Agent code: aapka Node/Python/other runtime program instructions, tool calls aur model API call decide karta hai. Compute us program ka Linux runtime deta hai; model apne aap Supabase se nahi milta.',
        'Example: task app ka agent PDF padhta hai, external LLM se summary mangta hai, aur Postgres mein summary/status likhta hai. Database sirf data rakhta hai; agent loop Compute service mein chalta hai.',
        'Agar agent ko code execute karna ho, per-task/session isolated sandbox create ho sakta hai. Supabase page sandbox state-preserving suspend/resume describe karti hai.',
        'Compute service idle par suspend hoti hai; active job par wall-clock limit nahi. Private alpha sirf internal evaluation ke liye hai, production agents ke liye abhi existing hosting use karo.'
      ],
      links: [['Compute product page', 'https://supabase.com/compute']]
    }]
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
    say: 'Mumbai region choose karne ka matlab har calculation Mumbai mein nahi hogi. Normal setup mein Postgres rows aur SQL/RPC Mumbai mein; Edge Function ka code default par caller ke nearest region mein chal sakta hai. London se call aaye to function London side run karke Mumbai database ko call karega. Function ko Mumbai mein invoke karna ho to region explicitly set karo.',
    what: 'Teen locations alag samjho: primary Postgres/Auth/Storage origin, Edge Function execution, aur Storage CDN cache.',
    why: 'Legal ya customer data-location requirement mein sirf database ka region dekhna kaafi nahi; function processing aur cached files bhi dekhni hain.',
    how: 'Example: London user → Edge Function near caller → Mumbai Postgres. SQL query Mumbai mein execute hoti hai; function ka TypeScript near caller execute hota hai. Database-heavy ya locality-sensitive function ke invoke par x-region: ap-south-1 (Mumbai) ya SDK region option set karo. Response ka x-sb-edge-region header ya Function Logs se actual region verify karo. Storage origin Mumbai ho sakta hai, lekin CDN file copy overseas cache kar sakta hai.',
    links: [['Project regions', 'https://supabase.com/docs/guides/platform/regions'], ['Edge Function regional invocation', 'https://supabase.com/docs/guides/functions/regional-invocation'], ['Storage CDN', 'https://supabase.com/docs/guides/storage/cdn/fundamentals'], ['Data residency FAQ', 'https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq']],
    deepDive: [{
      title: 'Mumbai project, London user: processing kahan?',
      badge: 'DATA ≠ FUNCTION ≠ CDN',
      lines: [
        'Browser ka GET /rest/v1/tasks gateway se aa sakta hai, lekin normal project mein actual PostgreSQL SQL query Mumbai database mein execute hoti hai.',
        'Agar browser Edge Function call karta hai, default par function code caller ke nearest supported region mein run hota hai. Woh Mumbai database ko network request bhej sakta hai; project region function ko automatically pin nahi karta.',
        'Function processing Mumbai mein chahiye to invocation par ap-south-1 select karo. x-sb-edge-region response header ya Function Logs se confirm karo ki execution wahi hua.',
        'Storage ke original object aur backups project region mein hain, par CDN bytes overseas cache kar sakta hai. Logs, support access aur external API providers ki locations bhi assess karo; region selection akela compliance proof nahi.'
      ],
      links: [['Regional invocation docs', 'https://supabase.com/docs/guides/functions/regional-invocation'], ['Supabase data residency FAQ', 'https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq']]
    }]
  },
  'dashboard-start': {
    say: 'Overview environment confirm karta hai; Table Editor rows dikhata hai; SQL Editor deliberate query run karta hai.',
    what: 'Studio ke starting areas aur data inspection tools.',
    why: 'Galat project mein change karna ya privileged SQL result ko client access samajhna dangerous hai.',
    how: 'Pehle project URL/environment verify karo. SQL Editor ka role browser client ke RLS behavior se alag ho sakta hai.',
    links: [['Database tables', 'https://supabase.com/docs/guides/database/tables'], ['Row Level Security', 'https://supabase.com/docs/guides/database/postgres/row-level-security']]
  },
  'dashboard-data': {
    say: 'Proxied ka matlab VPN request nahi. Client cdn.example.com par request bhejta hai, Cloudflare beech mein WAF/rate-limit laga kar Supabase Storage tak forward karta hai. Ye public aur private dono file paths par ho sakta hai. Private file ki permission JWT + Storage RLS ya pehle authorize kiye gaye signed URL se hi decide hogi.',
    what: 'Task row database mein, file bytes Storage mein. Cloudflare reverse proxy traffic filter karta hai; Supabase Storage private access check karta hai.',
    why: 'WAF abuse reduce karta hai, lekin user ko private PDF padhne ka haq hai ya nahi, ye Supabase ki authorization decide karti hai.',
    how: 'Public: client → Cloudflare hostname → public Storage path. Private: JWT/signed URL wala client → wahi Cloudflare hostname (private path par WAF/rate rule, extra cache bypass) → Supabase Storage (RLS ya signed token check). Ye extra Cloudflare route optional example hai; Supabase Storage ka apna CDN bhi hai. Direct project.supabase.co URL aapke Cloudflare hostname ko bypass karta hai; private bucket phir bhi Supabase auth se protected rehta hai.',
    links: [['Cloudflare proxied HTTP traffic', 'https://developers.cloudflare.com/dns/proxy-status/use-cases/'], ['Supabase private buckets', 'https://supabase.com/docs/guides/storage/buckets/fundamentals'], ['Cloudflare cache behavior', 'https://developers.cloudflare.com/cache/concepts/default-cache-behavior/']],
    deepDive: [{
      title: 'Proxy aur private access ka farq',
      badge: 'WAF ≠ AUTHORIZATION',
      lines: [
        'Proxy: browser/app cdn.example.com call karti hai; Cloudflare HTTP request receive karke Supabase ko forward karta hai. VPN use ho ya na ho, isse farq nahi padta.',
        'Public aur private dono paths par Cloudflare WAF/rate-limit rule lag sakta hai, agar request usi proxied hostname se guzarti ho. Rule ko hostname aur path ke hisaab se scope karo.',
        'Private bucket mein JWT ke saath Storage RLS check hota hai; ya access check (user RLS ya trusted server code) ke baad limited-time signed URL issue hota hai. Cloudflare WAF user-level permission ka replacement nahi hai.',
        'Direct Supabase project URL Cloudflare ke custom hostname ko bypass karta hai. Private responses par apni extra Cloudflare cache force mat karo; signed URL caching aur token expiry ka behavior alag verify karo.'
      ],
      links: [['Cloudflare proxied records', 'https://developers.cloudflare.com/dns/proxy-status/use-cases/'], ['Supabase bucket access', 'https://supabase.com/docs/guides/storage/buckets/fundamentals'], ['Signed URL caching', 'https://supabase.com/docs/guides/storage/cdn/smart-cdn']]
    }]
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
    say: 'Aaj humne 4 practical areas cover kiye: Postgres se Data API, Realtime aur extensions; migrations, staging aur region; connections, queries, Realtime aur files; phir Cloudflare, logs, Advisors aur Usage. Ye slide agli Supabase release ki checklist hai.',
    what: '16 short lessons from the full talk, grouped so you can recap them in about 90 seconds.',
    why: 'Audience ko yaad rahe ki feature banana, schema badalna, traffic protect karna aur incident debug karna alag decisions hain.',
    how: 'Har column ka heading aur ek concrete example bolo. SQL atomic transaction ho to RPC; external mail/API ho to Edge Function. Slow query par logs/query plan se index choose karo. Trigger error Database logs mein trace karo; Edge Function error uske Function Logs mein. Last line ko release order ki tarah read karo.',
    links: [['Supabase Developer Docs', 'https://supabase.com/docs'], ['Branching and GitHub integration', 'https://supabase.com/docs/guides/deployment/branching/github-integration'], ['Postgres extensions', 'https://supabase.com/docs/guides/database/extensions'], ['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture'], ['Storage S3 compatibility', 'https://supabase.com/docs/guides/storage/s3/compatibility']],
    deepDive: [
      {
        title: 'Postgres powers more than tables',
        badge: 'API · REALTIME · EXTENSIONS',
        lines: [
          'PostgREST ek separate HTTP server hai jo exposed Postgres tables/views/functions par Data API deta hai. Ye PostgreSQL ka built-in REST feature nahi hai.',
          'Postgres Changes ka Realtime path WAL/logical replication se events leta hai; alag Realtime WebSocket service clients tak bhejti hai. Har Realtime mode ko extension mat bolo.',
          'pgvector jaise supported extensions enable karo. Apna pure SQL ya pg_tle extension migration/package ke through doosre projects mein install kar sakte ho; arbitrary native compiled extension hosted project mein simply upload nahi hoti.'
        ],
        links: [['PostgREST', 'https://docs.postgrest.org/en/v16/'], ['Realtime architecture', 'https://supabase.com/docs/guides/realtime/architecture'], ['Extensions', 'https://supabase.com/docs/guides/database/extensions']]
      },
      {
        title: 'Schema aur environment ko control karo',
        badge: 'MIGRATIONS · BRANCHES · REGION',
        lines: [
          'Reviewed SQL migration files ko schema history rakho; local aur staging par test karke production mein apply karo.',
          'Long-lived staging/QA ke liye persistent branch. Short PR previews ephemeral ho sakte hain. Agar manual GitHub sync chahiye to automatic branching/deploy settings off rakho aur migration deploy process explicit banao.',
          'Project region users, latency aur primary data location dekh kar pehle choose karo; later move ko new project, data copy aur migrations chahiye.',
          'Related row changes ek transaction mein chahiye to RPC/SQL; external provider, secret ya HTTP integration ke liye Edge Function.'
        ],
        links: [['Migrations', 'https://supabase.com/docs/guides/deployment/database-migrations'], ['Branching', 'https://supabase.com/docs/guides/deployment/branching'], ['Regions', 'https://supabase.com/docs/guides/platform/regions']]
      },
      {
        title: 'Performance aur file access',
        badge: 'POOL · INDEX · REALTIME · STORAGE',
        lines: [
          'Persistent backend ke liye direct connection + app pool; serverless burst ke liye suitable pooler. Connection count aur wait time monitor karo.',
          'Slow query ko logs/Observability aur query plan se samjho; useful index add karo aur query rewrite test karo, blindly index mat banao.',
          'Realtime subscriptions, messages aur peak connections ko feature ki zarurat tak limit karo; usage page mein counts dekho.',
          'Supabase Storage S3-compatible API deta hai, AWS S3 ka har feature nahi. Private bucket ke liye JWT + RLS ya checked signed URL use karo.'
        ],
        links: [['Database connections', 'https://supabase.com/docs/guides/database/connecting-to-postgres'], ['Realtime usage', 'https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages'], ['S3 compatibility', 'https://supabase.com/docs/guides/storage/s3/compatibility']]
      },
      {
        title: 'Traffic, debugging aur operations',
        badge: 'CLOUDFLARE · LOGS · ADVISORS',
        lines: [
          'Apna domain lo, Cloudflare Free DNS mein add karo, DNS record ko proxied rakho, phir hostname/path par WAF aur rate rule lagao. Workers ka free workers.dev subdomain demos ke liye milta hai; registered domain free nahi milta. Supabase native custom domain paid add-on hai. Proxy rules sirf Cloudflare se guzri requests par lagte hain.',
          'Cloudflare Worker request ko Supabase tak bhejne se pehle validate, rate-limit ya early 429 de sakta hai. Ye fast gateway decision hai, instant database query ka promise nahi.',
          'Security Advisor findings ignore mat karo. Trigger/query failures Database logs mein; Edge Function failures Function Logs mein dekho. Usage, billing, error trends aur backup/recovery plan review karo.'
        ],
        links: [['Cloudflare DNS Free', 'https://developers.cloudflare.com/dns/faq/'], ['Workers subdomain', 'https://developers.cloudflare.com/workers/configuration/routing/workers-dev/'], ['Supabase custom domains', 'https://supabase.com/docs/guides/platform/custom-domains'], ['Advisors', 'https://supabase.com/docs/guides/observability/advisors'], ['Logs', 'https://supabase.com/docs/guides/observability/logs']]
      }
    ]
  }
};
