import {slides, sources, totalMinutes, metricGlossary} from './slides.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const params = new URLSearchParams(location.search);
const state = {
  index: Math.max(0, Math.min(slides.length - 1, Number(params.get('slide') || 1) - 1 || 0)),
  step: 0,
  overlay: null,
  theme: localStorage.getItem('supabase-talk-theme') || 'light'
};
document.documentElement.dataset.theme = state.theme;

const current = () => slides[state.index];
const highlight = (index) => index === state.step ? 'active' : '';
const flow = (labels, caption, modifier = '') => `<div class="flow ${modifier}">${labels.map((label,index) => `<div class="flow-node ${highlight(index)}"><span class="node-number">${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(label)}</strong></div>${index < labels.length-1 ? '<div class="flow-arrow"><span>→</span></div>' : ''}`).join('')}</div><p class="viz-caption">${escapeHtml(caption)}</p>`;
const captions = {
  opening:['The task itself is a row in Postgres.','Auth identifies the signed-in user.','The Data API reads and writes task rows.','Storage keeps the PDF bytes.','Realtime can notify another screen.'],
  stack:['Auth identifies users; the Data API serves rows.','Storage handles files; Realtime delivers events.','Edge Functions run trusted server-side code.','Queues hold work; Cron starts scheduled work.'],
  fit:['Integrated backend for a small product.','Auth, RLS and live events for teamwork.','Measure whether a specialist system fits better.'],
  app:['A user proves who they are.','The task is written into a Postgres table.','An attachment goes through Storage.','Other connected screens receive an event.'],
  data:['The table defines a record shape.','A column is a named, typed field.','A row is one task record.','Keys identify and relate records.'],
  api:['The SDK sends a request.','The request carries the publishable key and user token.','PostgREST serves the Data API route.','Postgres applies grants and RLS before returning rows.'],
  security:['Atif sees only rows owned by Atif.','Asha sees only rows owned by Asha.'],
  storage:['A client submits a file.','Access rules decide whether it is allowed.','Postgres stores bucket and object metadata.','Object storage holds the actual bytes.'],
  realtime:['Stream selected database row changes.','Send a message to channel subscribers.','Track who is online in a shared channel.'],
  functions:['The client calls a function.','The function checks the caller.','Trusted code uses a server-side secret.','The function returns a result to the client.'],
  async:['The request creates a task without waiting for email delivery.','A durable queue holds the message for a consumer.','A worker reads, performs the work, then acknowledges it.','Cron separately triggers recurring work on a schedule.'],
  workflow:['Run the local development stack.','Record schema changes as SQL migrations.','Review the diff and test the result.','Apply reviewed changes to the remote project.'],
  plans:['Free is useful when a pause and manual recovery are acceptable.','Pro fits when users need availability and automatic backups.','Subscription, project compute, add-ons and overages can all affect cost.'],
  'obs-intro':['Ask: what changed for users?','On a custom stack, collect metrics and logs from each service.','Supabase Cloud groups product reports and live database sessions.'],
  'obs-overview':['These cards point to database pressure.','Service health shows where requests are flowing.','Choose a time window, then open the detailed report.'],
  'obs-query':['Calls count how often a statement ran.','Mean, max and min describe one execution.','Total time reveals cumulative cost.','Role, app, rows and cache add context.'],
  'obs-connections':['A session is connected to Postgres.','An active session is running SQL.','A transaction can stay open after its last statement.','The second update waits for the first transaction.','ROLLBACK releases the lock and the waiter proceeds.'],
  'obs-database':['Memory shows used, cache, free and swap.','CPU separates process, system and waiting time.','Disk usage is occupied capacity.','Disk I/O is reads and writes over time.'],
  'obs-apis':['Gateway shows all inbound API traffic.','Data API shows generated REST routes.','Auth shows sign-ins, errors and processing time.'],
  'obs-services':['Edge Functions show runs, codes, time and region.','Storage shows file requests, bytes and caching.','Realtime shows clients, messages and delivery health.'],
  finale:['A person signs in.','Auth supplies identity.','The Data API and RLS gate records.','Postgres stores application data.','Storage, Realtime, Functions, Queues and Cron extend the app.']
};

function visual(slide) {
  const s = state.step;
  const caption = captions[slide.id][s];
  switch (slide.visual) {
    case 'opening': {
      const actions = [
        ['01', 'Save data', 'Postgres stores each task as a row.'],
        ['02', 'Sign in', 'Auth supplies the user identity.'],
        ['03', 'Read tasks', 'Data API returns allowed rows.'],
        ['04', 'Attach file', 'Storage keeps the PDF bytes.'],
        ['05', 'See update', 'Realtime delivers an event.']
      ];
      return `<div class="lesson-visual"><h3>Where does each taskboard action run?</h3><div class="lesson-actions">${actions.map(([number,name,job],i)=>`<div class="lesson-action ${highlight(i)}"><small>${number}</small><strong>${name}</strong><span>${job}</span></div>`).join('')}</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'stack': {
      const services = [
        ['Auth', 'Signs users in and issues identity tokens.', 'Service', 0],
        ['Data API', 'Exposes Postgres rows through generated REST routes.', 'PostgREST', 0],
        ['Storage', 'Stores file bytes and tracks object metadata.', 'Service + object store', 1],
        ['Realtime', 'Delivers changes, messages and presence over WebSockets.', 'Service', 1],
        ['Edge Functions', 'Runs trusted code outside the browser.', 'Function runtime', 2],
        ['Queues', 'Holds messages until a worker processes them.', 'Postgres extension', 3],
        ['Cron', 'Runs jobs on a recurring schedule.', 'Postgres extension', 3]
      ];
      return `<div class="service-guide"><div class="service-guide-head"><span>SERVICE</span><span>ONE-LINE DEFINITION</span><span>WHERE IT RUNS</span></div>${services.map(([name,definition,where,group])=>`<div class="service-guide-row ${s===group?'active':''}"><strong>${name}</strong><span>${definition}</span><small>${where}</small></div>`).join('')}<div class="service-guide-core"><strong>POSTGRES</strong><span>Stores rows, policies and transactions for the project.</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'fit': {
      const cases = [
        ['Product MVP', 'Users, related records and files', 'Good fit: one backend for the first release'],
        ['Collaborative app', 'Private rows and live updates', 'Good fit: Auth, RLS and Realtime cooperate'],
        ['Specialized workload', 'Large analytics scans or niche search', 'Evaluate a warehouse or search engine too']
      ];
      return `<div class="service-guide"><div class="teaching-table-head"><span>WORKLOAD</span><span>WHAT IT NEEDS</span><span>DECISION</span></div>${cases.map(([name,need,decision],i)=>`<div class="teaching-table-row ${highlight(i)}"><strong>${name}</strong><span>${need}</span><span>${decision}</span></div>`).join('')}<div class="service-guide-core"><strong>RULE</strong><span>Start with the dominant data and access pattern. Add a specialist only for a measured need.</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'app': {
      const requirements = [
        ['Sign in', 'Auth', 'Identify Atif'],
        ['Save task', 'Data API + Postgres', 'Write one allowed row'],
        ['Attach PDF', 'Storage', 'Keep the file bytes'],
        ['See update', 'Realtime', 'Notify a subscribed screen']
      ];
      return `<div class="service-guide"><div class="teaching-table-head"><span>USER ACTION</span><span>SUPABASE PART</span><span>JOB</span></div>${requirements.map(([action,service,job],i)=>`<div class="teaching-table-row ${highlight(i)}"><strong>${action}</strong><span>${service}</span><span>${job}</span></div>`).join('')}<div class="service-guide-core"><strong>DATA RULE</strong><span>RLS checks which task rows this user may access.</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'data': return `<div class="data-visual"><div class="data-path"><span>project database</span><b>›</b><span>public schema</span><b>›</b><strong>tasks table</strong></div><div class="table-wrap ${s===0?'active':''}"><table><thead><tr>${['id','owner_id','title','done'].map((name,i)=>`<th class="${s===1&&i===2?'selected':''}">${name}<small>${['bigint','uuid','text','boolean'][i]}</small></th>`).join('')}</tr></thead><tbody><tr class="${s===2?'selected':''}"><td class="${s===3?'selected':''}">101</td><td>atif-id</td><td>Review launch copy</td><td>false</td></tr><tr><td>102</td><td>asha-id</td><td>Send brief</td><td>true</td></tr><tr><td>103</td><td>atif-id</td><td>Call team</td><td>false</td></tr></tbody></table></div><div class="data-legend"><span><b>TABLE</b> record collection</span><span><b>COLUMN</b> named field</span><span><b>ROW</b> one task</span><span><b>KEY</b> identity / link</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'api': return `<div class="api-visual">${flow(['Client SDK','User token','Data API','Postgres + RLS'],caption,'api-flow')}<div class="api-response"><span>REQUEST</span><code>GET /rest/v1/tasks?select=id,title,done</code><span>RESPONSE</span><code>[ { id: 101, title: "Review launch copy" } ]</code></div><div class="openapi-note"><b>OpenAPI spec</b><span>describes the exposed REST routes and schemas · it does not execute requests</span></div></div>`;
    case 'security': {
      const person = s===0?'Atif':'Asha'; const id = s===0?'atif-id':'asha-id';
      return `<div class="security-visual"><div class="identity-switch"><button data-step="0" class="${highlight(0)}"><span>AT</span>Atif</button><button data-step="1" class="${highlight(1)}"><span>AS</span>Asha</button></div><div class="security-flow"><span>signed-in user<br><b>${person}</b></span><span class="security-arrow">→</span><span>policy checks<br><b>auth.uid() = owner_id</b></span><span class="security-arrow">→</span><span>visible rows<br><b>${s===0?'101 · 103':'102'}</b></span></div><div class="security-table"><div class="security-head"><b>task</b><b>owner</b><b>result</b></div>${[['101','atif-id'],['102','asha-id'],['103','atif-id']].map(([task,owner])=>`<div class="security-row ${owner===id?'visible':'blocked'}"><span>${task}</span><span>${owner}</span><span>${owner===id?'VISIBLE':'HIDDEN'}</span></div>`).join('')}</div><div class="security-label">SIMULATED POLICY RESULT · SAME QUERY, DIFFERENT USER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'storage': return `<div class="storage-visual"><div class="storage-flow">${['Client upload','RLS policy','Postgres metadata','Object bytes'].map((label,i)=>`<div class="storage-unit ${highlight(i)}"><span>${['↑','♙','▤','▥'][i]}</span><b>${label}</b><small>${['brief.pdf','is user allowed?','path + bucket','object provider'][i]}</small></div>${i<3?'<span class="storage-arrow">→</span>':''}`).join('')}</div><div class="storage-note"><strong>tasks table</strong><span>attachment path ↔ task ID</span><strong>task-files bucket</strong></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'realtime': return `<div class="realtime-visual"><div class="realtime-modes">${['DATABASE CHANGES','BROADCAST','PRESENCE'].map((mode,i)=>`<button data-step="${i}" class="${highlight(i)}">${mode}</button>`).join('')}</div><div class="realtime-scene"><div class="client-screen"><b>SCREEN A</b><span>${s===2?'Atif is online':'Task updated'}</span><i>● connected</i></div><div class="realtime-channel ${s===1?'broadcast':''}"><span>◉</span><strong>${['POSTGRES CHANGE','CHANNEL MESSAGE','SHARED STATE'][s]}</strong><span>◉</span></div><div class="client-screen"><b>SCREEN B</b><span>${s===2?'Asha is online':'Task updated'}</span><i>● connected</i></div></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'functions': return `<div class="function-visual">${flow(['Browser','Edge Function','Mail API','Browser'],caption,'function-flow')}<div class="secret-box ${s===2?'active':''}"><span>SERVER SECRET</span><b>MAIL_API_KEY</b><small>never sent to the browser</small></div></div>`;
    case 'async': return `<div class="async-visual"><div class="async-lane"><span class="async-label">WHEN A TASK IS CREATED</span><div class="async-rail"><div class="async-box ${s===0?'active':''}"><b>API request</b><small>save task · respond</small></div><span class="async-arrow">→</span><div class="async-box ${s===1?'active':''}"><b>Queue</b><small>message waits safely</small></div><span class="async-arrow">→</span><div class="async-box ${s===2?'active':''}"><b>Consumer</b><small>send email · acknowledge</small></div></div></div><div class="async-lane cron-lane ${s===3?'active':''}"><span class="async-label">ON A RECURRING SCHEDULE</span><div class="async-rail"><div class="async-box"><b>Cron</b><small>09:00 · DB timezone</small></div><span class="async-arrow">→</span><div class="async-box"><b>SQL or function</b><small>run scheduled work</small></div></div></div><div class="async-footnote">ILLUSTRATIVE FLOW · QUEUE CONSUMER IS AN APPLICATION WORKER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'workflow': return `<div class="workflow-visual"><div class="workflow-rail">${[['LOCAL','CLI + Docker'],['GIT','SQL migration'],['REVIEW','test + diff'],['REMOTE','apply changes']].map(([label,detail],i)=>`<div class="workflow-stop ${highlight(i)}"><span>${String(i+1).padStart(2,'0')}</span><b>${label}</b><small>${detail}</small></div>`).join('')}</div><div class="workflow-stamp">SCHEMA HISTORY <b>001 → 002 → 003</b></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'plans': {
      const rows = [
        ['Best for', 'Learning, prototypes, low-stakes demos', 'Apps real users rely on'],
        ['Inactivity', 'May pause after low activity', 'No inactivity pause'],
        ['Recovery', 'No automatic database backups', 'Daily backups, 7-day retention'],
        ['Included capacity', 'Smaller limits', 'Larger limits; check usage']
      ];
      return `<div class="plan-guide"><div class="plan-head"><span>DECISION</span><strong class="${s===0?'active':''}">FREE <small>$0 / month</small></strong><strong class="${s===1?'active':''}">PRO <small>from $25 / organization / month</small></strong></div>${rows.map(([label,free,pro])=>`<div class="plan-row"><b>${label}</b><span class="${s===0?'active':''}">${free}</span><span class="${s===1?'active':''}">${pro}</span></div>`).join('')}<div class="plan-note ${s===2?'active':''}">Check the full bill: plan + project compute + add-ons + usage beyond included quotas.</div><div class="plan-date">Published terms checked 15 Oct 2026 · verify current pricing before purchase.</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-intro': {
      const columns = [
        ['QUESTION', '“Why did saving a task get slow?”', 'Find the change and follow its path.'],
        ['SELF-MANAGED', 'API logs → DB metrics → charts', 'The team wires collection, storage, alerts and access.'],
        ['SUPABASE CLOUD', 'Observability → Reports', 'Start with built-in service reports; monitor your own code too.']
      ];
      return `<div class="obs-viz"><div class="obs-route">OPERATIONS <span>›</span> OBSERVABILITY</div><div class="obs-intro-grid">${columns.map(([kicker,title,detail],i)=>`<div class="obs-tile ${highlight(i)}"><small>${kicker}</small><strong>${title}</strong><p>${detail}</p></div>`).join('')}</div><div class="obs-signal"><span>METRICS <b>patterns</b></span><span>LOGS <b>events</b></span><span>SESSIONS <b>now</b></span></div><div class="obs-disclaimer">ILLUSTRATIVE RECONSTRUCTION · NO LIVE PROJECT DATA</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-overview': {
      const metrics = [['Slow queries','Statements to inspect'],['Peak connections','Most simultaneous sessions'],['Disk usage','Capacity occupied'],['Disk I/O','Read and write activity'],['Memory','RAM in use'],['CPU','Compute activity']];
      const services = ['API GATEWAY','DATABASE','POSTGREST','AUTH','EDGE FUNCTIONS','STORAGE','REALTIME'];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> OVERVIEW <em>choose time range</em></div><div class="obs-overview-cards">${metrics.map(([name,meaning])=>`<div class="obs-mini ${s===0?'lit':''}"><b>${name}</b><small>${meaning}</small></div>`).join('')}</div><div class="obs-service-title">SERVICE HEALTH <span>requests and warnings by service</span></div><div class="obs-service-grid">${services.map((service,i)=>`<div class="obs-service ${s===1?'lit':''}"><small>${service}</small><div class="obs-bars">${[34,42,35,48,39,46,28,44].map((n,j)=>`<i style="height:${n+(i+j)%3*5}%"></i>`).join('')}</div></div>`).join('')}</div><div class="obs-disclaimer">ILLUSTRATIVE RECONSTRUCTION · OPEN A DETAIL PAGE FOR THE CAUSE</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-query': {
      const rows = [
        ['SELECT tasks…','many','moderate','large','app role'],
        ['UPDATE task…','few','high','smaller','app role']
      ];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> QUERY PERFORMANCE <em>example patterns</em></div><div class="obs-query-grid"><div class="obs-q-head"><b>QUERY</b><b class="${s===0?'focus':''}">CALLS</b><b class="${s===1?'focus':''}">MEAN</b><b class="${s===2?'focus':''}">TOTAL TIME</b><b class="${s===3?'focus':''}">ROLE</b></div>${rows.map(row=>`<div class="obs-q-row">${row.map((cell,i)=>`<span class="${i===s+1?'focus':''}">${cell}</span>`).join('')}</div>`).join('')}</div><div class="obs-query-legend"><span><b>MAX / MIN</b> slowest / fastest call</span><span><b>ROWS</b> returned or changed</span><span><b>CACHE</b> data found in memory</span><span><b>APP</b> client name</span></div><div class="obs-callout">${['Many short calls can add up.','One slow call can hurt a user.','Investigate total cost and user impact.','Roles and cache give context, not a verdict.'][s]}</div><div class="obs-disclaimer">ILLUSTRATIVE PATTERNS · NO MEASURED QUERY TIMES</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-connections': {
      const states = [['CONNECTIONS','open sessions / limit'],['ACTIVE QUERIES','running SQL now'],['IDLE IN TRANSACTION','open transaction, no SQL now'],['BLOCKED QUERIES','waiting on a lock'],['TOP BLOCKER','session causing waits'],['LONGEST RUNNING','oldest running work']];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> DATABASE CONNECTIONS <em>LIVE snapshot</em></div><div class="obs-connection-cards">${states.map(([name,meaning],i)=>`<div class="obs-mini ${s<4&&(i===s||s===3&&i===4)?'lit':''}"><b>${name}</b><small>${meaning}</small></div>`).join('')}</div><div class="obs-session-scene"><div class="obs-session ${s===1?'running':s>=2&&s<4?'holding':''}"><b>SESSION A · holder</b><span>${s===0?'connected':s===1?'ACTIVE QUERY':s<4?'IDLE IN TRANSACTION':'ROLLBACK ✓'}</span><small>${s===1?'SELECT pg_sleep(20)':s===0?'session opened':'UPDATE task 101'}</small></div><div class="obs-lock ${s===3?'waiting':''}">${s===3?'LOCK HELD → WAITER BLOCKED':s===4?'LOCK RELEASED → CONTINUE':'ROW LOCK'}</div><div class="obs-session ${s===3?'waiting':''}"><b>SESSION B · waiter</b><span>${s<3?'connected':s===3?'WAITING':'QUERY COMPLETES ✓'}</span><small>UPDATE task 101</small></div></div><div class="obs-session-fields">SESSION TABLE: <b>State</b> · <b>Query / PID</b> · <b>Duration</b> · <b>Blocked by</b></div><div class="obs-disclaimer">ILLUSTRATIVE SESSION FLOW · USE A DISPOSABLE PROJECT FOR THE LIVE DEMO</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-database': {
      const panels = [
        ['MEMORY','Used · Cache + Buffers · Free · Swap','Cache is useful RAM. Swap can signal pressure.'],
        ['CPU','User · System · IOWait · Idle','High CPU or waiting needs workload context.'],
        ['DISK USAGE','Occupied storage capacity','Capacity and speed answer different questions.'],
        ['DISK I/O','Read / write activity over time','Heavy I/O can make requests wait.']
      ];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> DATABASE <em>select primary database</em></div><div class="obs-resource-grid">${panels.map(([name,terms,meaning],i)=>`<div class="obs-resource ${highlight(i)}"><small>${name}</small><div class="obs-resource-bars">${[48,58,52,63,50,55,62,46,57,51,60,53].map((v,j)=>`<i style="height:${v+(j+i)%3*4}%"></i>`).join('')}</div><b>${terms}</b><p>${meaning}</p></div>`).join('')}</div><div class="obs-disclaimer">ILLUSTRATIVE SHAPES · NO LIVE UTILIZATION VALUES</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-apis': {
      const groups = [
        ['API GATEWAY','Every incoming HTTP request','Geography · total requests · response errors · speed · ingress / egress'],
        ['DATA API','Generated /rest/v1 routes','Endpoint count · status · response speed · network traffic'],
        ['AUTH','Sign-in and identity requests','Attempts by type · sign-ups · resets · errors · processing time']
      ];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> PRODUCT REPORTS</div><div class="obs-product-grid">${groups.map(([name,job,measure],i)=>`<button data-step="${i}" class="obs-product ${highlight(i)}"><small>${name}</small><strong>${job}</strong><span>${measure}</span></button>`).join('')}</div><div class="obs-callout">${['Gateway request ≠ database connection.','A Data API endpoint is a route into PostgREST.','A 403 needs route and auth context before diagnosis.'][s]}</div><div class="obs-disclaimer">ILLUSTRATIVE DASHBOARD GUIDE · EMPTY CHART MAY MEAN NO EVENTS OR REPORTING DELAY</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'obs-services': {
      const groups = [
        ['EDGE FUNCTIONS','Code ran','Invocations · HTTP codes · execution time · region'],
        ['STORAGE','Files served','Requests · response speed · traffic · request caching'],
        ['REALTIME','Live events delivered','WebSocket clients · Broadcast · Presence · Postgres Changes']
      ];
      return `<div class="obs-viz"><div class="obs-route">OBSERVABILITY <span>›</span> PRODUCT REPORTS</div><div class="obs-product-grid">${groups.map(([name,job,measure],i)=>`<button data-step="${i}" class="obs-product ${highlight(i)}"><small>${name}</small><strong>${job}</strong><span>${measure}</span></button>`).join('')}</div><div class="obs-callout">${['Check the code and logs for an invocation spike.','Storage traffic is file traffic, not table storage.','Connected WebSocket clients are not PostgreSQL sessions.'][s]}</div><div class="obs-disclaimer">ILLUSTRATIVE DASHBOARD GUIDE · READ THE SELECTED TIME WINDOW</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'finale': return `<div class="finale-visual"><div class="finale-title">THE CONNECTED BACKEND</div>${flow(['USER','AUTH','DATA API + RLS','POSTGRES','OPTIONAL SERVICES'],caption,'finale-flow')}<div class="finale-bottom"><span>Storage + Realtime</span><span>Edge Functions</span><span>Queues + Cron</span></div></div>`;
    default: return '';
  }
}

function sourceLinks(slide) { return slide.source.map((key) => `<a href="${sources[key]}" target="_blank" rel="noopener noreferrer">${escapeHtml(key)} ↗</a>`).join(''); }
function lessonText(slide) {
  const definitions = slide.definitions?.map(([term, meaning]) => `<div class="lesson-definition"><strong>${escapeHtml(term)}</strong><p>${escapeHtml(meaning)}</p></div>`).join('') || '';
  return `<div class="lesson-text">${definitions ? `<div class="lesson-block"><span class="micro-label">IN ONE LINE</span>${definitions}</div>` : ''}${slide.example ? `<div class="lesson-block lesson-example"><span class="micro-label">TASKBOARD EXAMPLE</span><p>${escapeHtml(slide.example)}</p></div>` : ''}<div class="lesson-block lesson-point"><span class="micro-label">THE POINT</span><p>${escapeHtml(slide.takeaway)}</p></div></div>`;
}
function panelContent(slide) {
  const code = slide.sql || slide.code;
  const glossary = metricGlossary[slide.id];
  return `<div class="panel-inner"><div class="panel-heading"><span class="eyebrow">${state.overlay==='notes'?'PRESENTER NOTES':'TECHNICAL DETAILS'}</span><button data-action="close" aria-label="Close panel">✕</button></div><h2>${escapeHtml(slide.title)}</h2>${state.overlay==='notes'?`<p>${escapeHtml(slide.notes)}</p><div class="panel-time">Suggested time: ${Math.round(slide.duration/60*10)/10} min</div>`:`<p>${escapeHtml(slide.deep)}</p>${glossary?`<h3 class="glossary-title">Dashboard fields</h3><dl class="metric-glossary">${glossary.map(([label,meaning])=>`<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(meaning)}</dd></div>`).join('')}</dl>`:''}${code?`<div class="code-head"><span>REAL ${slide.sql?'SQL':'CODE'}</span><button data-action="copy">Copy</button></div><pre><code>${escapeHtml(code)}</code></pre>`:''}`}<div class="panel-sources"><b>Official sources</b>${sourceLinks(slide)}</div></div>`;
}

function renderOverlay() {
  const overlay = $('#overlay');
  $('#techBtn').setAttribute('aria-pressed', String(state.overlay==='tech'));
  $('#notesBtn').setAttribute('aria-pressed', String(state.overlay==='notes'));
  if (!state.overlay) { overlay.hidden = true; overlay.innerHTML = ''; return; }
  overlay.hidden = false;
  if (state.overlay==='overview') {
    overlay.innerHTML = `<div class="overlay-backdrop" data-action="close"></div><div class="overview-panel"><div class="panel-heading"><span class="eyebrow">${slides.length} SCREENS · ABOUT ${totalMinutes} MINUTES</span><button data-action="close" aria-label="Close overview">✕</button></div><h2>Talk map</h2><div class="overview-grid">${slides.map((slide,index)=>`<button data-slide="${index}" class="${index===state.index?'active':''}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(slide.chapter)}</small><strong>${escapeHtml(slide.title)}</strong></button>`).join('')}</div><p class="overview-hint">← → navigate · Space advances the scene · O overview · D details · N notes</p></div>`;
  } else {
    overlay.innerHTML = `<div class="overlay-backdrop" data-action="close"></div><aside class="detail-panel" aria-label="${state.overlay==='notes'?'Speaker notes':'Technical details'}">${panelContent(current())}</aside>`;
  }
}

function render() {
  const slide = current();
  const visualLabel = ({opening:'WORKED EXAMPLE', stack:'SERVICE DEFINITIONS', fit:'DECISION TABLE', app:'TASKBOARD MAP', plans:'PLAN COMPARISON'})[slide.visual] || (slide.visual.startsWith('obs-') ? 'ILLUSTRATIVE DASHBOARD' : 'WORKED EXAMPLE');
  $('#stage').innerHTML = `<section class="slide slide-${slide.id}" aria-label="Slide ${state.index+1}: ${escapeHtml(slide.title)}"><div class="slide-head"><div class="eyebrow">${escapeHtml(slide.tag)}</div><h1>${escapeHtml(slide.title)}</h1><p class="lead">${escapeHtml(slide.lead)}</p></div><div class="slide-main"><div class="visual-panel" aria-label="Interactive illustration"><div class="illustration-label">${escapeHtml(visualLabel)} <span>· ${state.step+1} / ${slide.steps.length}</span></div><div class="visual-content" aria-live="polite">${visual(slide)}</div></div><aside class="slide-side">${lessonText(slide)}<div class="step-list"><span class="micro-label">FOLLOW THE FLOW</span>${slide.steps.map((step,index)=>`<button data-step="${index}" class="${highlight(index)}"><small>${String(index+1).padStart(2,'0')}</small>${escapeHtml(step)}</button>`).join('')}</div></aside></div><div class="slide-foot"><div class="scene-controls"><button data-action="reset" aria-label="Restart illustration">↺</button><button data-action="step">Next step →</button></div><div class="slide-source"><span>FACT CHECKED AGAINST OFFICIAL DOCS</span> ${sourceLinks(slide)}</div></div></section>`;
  $('#chapterName').textContent = slide.chapter;
  $('#counter').textContent = `${String(state.index+1).padStart(2,'0')} / ${slides.length}`;
  $('#talkTime').textContent = `≈ ${totalMinutes} MIN TALK`;
  $('#prevBtn').disabled = state.index===0;
  $('#nextBtn').disabled = state.index===slides.length-1;
  $('#progressFill').style.width = `${((state.index+1)/slides.length)*100}%`;
  const chapters = [...new Set(slides.map((item)=>item.chapter))];
  $('#chapterTrack').innerHTML = chapters.map((chapter)=>`<button class="${chapter===slide.chapter?'active':''}" data-chapter="${escapeHtml(chapter)}">${escapeHtml(chapter)}</button>`).join('');
  history.replaceState(null,'',`${location.pathname}?slide=${state.index+1}${location.hash}`);
  renderOverlay();
}

function go(index) { state.index = Math.max(0,Math.min(slides.length-1,index)); state.step = 0; state.overlay = null; render(); $('#stage').focus({preventScroll:true}); }
function stepTo(index) { state.step = Math.max(0,Math.min(current().steps.length-1,index)); render(); }
function nextStep() { if (state.step < current().steps.length-1) stepTo(state.step+1); else if (state.index < slides.length-1) go(state.index+1); }
function toggleOverlay(name) { state.overlay=state.overlay===name?null:name; render(); }

document.addEventListener('click', async (event)=>{
  const button = event.target.closest('button,[data-action]');
  if (!button) return;
  if (button.hasAttribute('data-step')) { stepTo(Number(button.dataset.step)); return; }
  if (button.hasAttribute('data-slide')) { go(Number(button.dataset.slide)); return; }
  if (button.hasAttribute('data-chapter')) { go(slides.findIndex((slide)=>slide.chapter===button.dataset.chapter)); return; }
  const action = button.dataset.action;
  if (action==='close') { state.overlay=null; render(); return; }
  if (action==='reset') { stepTo(0); return; }
  if (action==='step') { nextStep(); return; }
  if (action==='copy') {
    try { await navigator.clipboard.writeText(current().sql||current().code||''); button.textContent='Copied'; setTimeout(()=>{if(button.isConnected)button.textContent='Copy';},1500); }
    catch { button.textContent='Use manual copy'; }
  }
});
$('#homeBtn').addEventListener('click',()=>go(0));
$('#overviewBtn').addEventListener('click',()=>toggleOverlay('overview'));
$('#techBtn').addEventListener('click',()=>toggleOverlay('tech'));
$('#notesBtn').addEventListener('click',()=>toggleOverlay('notes'));
$('#prevBtn').addEventListener('click',()=>go(state.index-1));
$('#nextBtn').addEventListener('click',()=>go(state.index+1));
$('#themeBtn').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;localStorage.setItem('supabase-talk-theme',state.theme);});
document.addEventListener('keydown',(event)=>{
  if (event.target.closest('input,textarea,select,[contenteditable]')) return;
  const key=event.key.toLowerCase();
  if (key==='escape') { state.overlay=null; render(); return; }
  if (key==='o') { toggleOverlay('overview'); return; }
  if (key==='d') { toggleOverlay('tech'); return; }
  if (key==='n') { toggleOverlay('notes'); return; }
  if (state.overlay) return;
  if (key==='arrowright') { event.preventDefault(); go(state.index+1); }
  else if (key==='arrowleft') { event.preventDefault(); go(state.index-1); }
  else if (key===' ' || key==='arrowdown') { event.preventDefault(); nextStep(); }
  else if (key==='home') { event.preventDefault(); go(0); }
  else if (key==='end') { event.preventDefault(); go(slides.length-1); }
});
window.addEventListener('popstate',()=>{const requested=Number(new URLSearchParams(location.search).get('slide')||1)-1;go(requested);});
render();
