import {slides, sources, totalMinutes, metricGlossary} from './slides.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const params = new URLSearchParams(location.search);
const state = {
  index: Math.max(0, Math.min(slides.length - 1, Number(params.get('slide') || 1) - 1 || 0)),
  step: 0,
  overlay: null,
  theme: localStorage.getItem('supabase-talk-theme') || 'dark'
};
document.documentElement.dataset.theme = state.theme;

const current = () => slides[state.index];
const highlight = (index) => index === state.step ? 'active' : '';
const flow = (labels, caption, modifier = '') => `<div class="flow ${modifier}">${labels.map((label,index) => `<div class="flow-node ${highlight(index)}"><span class="node-number">${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(label)}</strong></div>${index < labels.length-1 ? '<div class="flow-arrow"><span>→</span></div>' : ''}`).join('')}</div><p class="viz-caption">${escapeHtml(caption)}</p>`;
const card = (label, detail, active = false, icon = '') => `<div class="service-card ${active?'active':''}"><span class="card-icon">${icon}</span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></div>`;
const captions = {
  opening:['One product begins with one data model.','Users need a trusted identity.','Your app needs a way to query data.','Files need a home and access rules.','Live clients can react to changes.'],
  stack:['The browser or server sends a request.','The gateway routes HTTP requests.','Request services, Queues and Cron have different jobs.','Postgres holds the shared data core.'],
  fit:['Integrated backend for a small product.','Auth, RLS and live events for teamwork.','Measure whether a specialist system fits better.'],
  app:['A user proves who they are.','The task is written into a Postgres table.','An attachment goes through Storage.','Other connected screens receive an event.'],
  data:['The table defines a record shape.','A column is a named, typed field.','A row is one task record.','Keys identify and relate records.'],
  api:['The SDK sends a request.','The request carries the publishable key and user token.','PostgREST serves the Data API route.','Postgres applies grants and RLS before returning rows.'],
  security:['Muskan sees only rows owned by Muskan.','Atif sees only rows owned by Atif.'],
  storage:['A client submits a file.','Access rules decide whether it is allowed.','Postgres stores bucket and object metadata.','Object storage holds the actual bytes.'],
  realtime:['Stream selected database row changes.','Send a message to channel subscribers.','Track who is online in a shared channel.'],
  functions:['The client calls a function.','The function checks the caller.','Trusted code uses a server-side secret.','The function returns a result to the client.'],
  async:['The request creates a task without waiting for email delivery.','A durable queue holds the message for a consumer.','A worker reads, performs the work, then acknowledges it.','Cron separately triggers recurring work on a schedule.'],
  workflow:['Run the local development stack.','Record schema changes as SQL migrations.','Review the diff and test the result.','Apply reviewed changes to the remote project.'],
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
    case 'opening': return `<div class="opening-visual"><div class="opening-ring ring-one"></div><div class="opening-ring ring-two"></div><div class="hero-center"><span class="hero-orbit">OPEN SOURCE · POSTGRES AT THE CORE</span><b>supabase<span>.</span></b><small>Build the product. Understand the system.</small></div><div class="opening-stats"><div class="opening-stat"><strong>≈10M</strong><span>developers · Jun 2026</span></div><div class="opening-stat"><strong>$10.5B</strong><span>post-money · Jun 2026</span></div><div class="opening-stat"><strong>FREE → PAID</strong><span>paying count undisclosed</span></div></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'stack': return `<div class="stack-visual"><div class="stack-top ${s===0?'active':''}">YOUR WEB OR MOBILE APP <span class="moving-packet">●</span></div><div class="stack-spine">↓ HTTP request</div><div class="gateway ${s===1?'active':''}">SUPABASE API GATEWAY</div><div class="stack-spine">↓ request services + Postgres-backed jobs</div><div class="services">${card('Auth','identity',s===2,'◈')}${card('Data API','REST rows',s===2,'⌘')}${card('Storage','files',s===2,'▧')}${card('Realtime','events',s===2,'≋')}${card('Functions','code',s===2,'{ }')}${card('Queues','pending work',s===2,'☷')}${card('Cron','schedules',s===2,'◷')}</div><div class="stack-spine">Queues + Cron run from database extensions</div><div class="postgres-core ${s===3?'active':''}"><span class="db-glyph">▤</span><div><strong>POSTGRESQL</strong><small>tables · policies · transactions · extensions</small></div></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'fit': {
      const cases = [
        {name:'Product MVP',load:'User accounts + related records + files',choice:'A strong starting point',reason:'One integrated backend speeds up delivery.'},
        {name:'Collaborative app',load:'Shared data + access rules + live UI',choice:'A natural fit',reason:'Auth, RLS and Realtime work with Postgres.'},
        {name:'Specialized workload',load:'Huge analytics scans or niche search at scale',choice:'Evaluate other systems too',reason:'A warehouse or search engine may suit the dominant job.'}
      ]; const item = cases[s];
      return `<div class="fit-visual"><div class="scenario-tabs">${cases.map((option,i)=>`<button data-step="${i}" class="${highlight(i)}">${escapeHtml(option.name)}</button>`).join('')}</div><div class="fit-card"><span class="micro-label">THE WORKLOAD</span><h3>${escapeHtml(item.load)}</h3><div class="fit-verdict"><span>SUPABASE?</span><strong>${escapeHtml(item.choice)}</strong></div><p>${escapeHtml(item.reason)}</p></div><div class="fit-axis"><span>DATA MODEL</span><span>TEAM SPEED</span><span>OPERATIONS</span><span>COST</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'app': {
      const requirements = [['01','Sign in','Auth'],['02','Save a task','Postgres + Data API'],['03','Attach a PDF','Storage'],['04','See an update','Realtime']];
      return `<div class="app-visual"><div class="app-phone"><div class="app-phone-top"><span>◉</span><span>TASKBOARD</span><span>•••</span></div><div class="app-user"><span>MU</span><div>Good morning, Muskan<small>Your private workspace</small></div></div><div class="fake-task ${s===1?'active':''}"><b>Review launch copy</b><small>Due today</small></div><div class="fake-task"><b>Send project brief</b><small>Attached: brief.pdf</small></div><div class="app-phone-foot ${s===3?'active':''}">● Live updates connected</div></div><div class="app-requirements">${requirements.map(([number,need,service],i)=>`<div class="requirement ${highlight(i)}"><span>${number}</span><b>${need}</b><small>→ ${service}</small></div>`).join('')}</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'data': return `<div class="data-visual"><div class="data-path"><span>project database</span><b>›</b><span>public schema</span><b>›</b><strong>tasks table</strong></div><div class="table-wrap ${s===0?'active':''}"><table><thead><tr>${['id','owner_id','title','done'].map((name,i)=>`<th class="${s===1&&i===2?'selected':''}">${name}<small>${['bigint','uuid','text','boolean'][i]}</small></th>`).join('')}</tr></thead><tbody><tr class="${s===2?'selected':''}"><td class="${s===3?'selected':''}">101</td><td>muskan-id</td><td>Review launch copy</td><td>false</td></tr><tr><td>102</td><td>atif-id</td><td>Send brief</td><td>true</td></tr><tr><td>103</td><td>muskan-id</td><td>Call team</td><td>false</td></tr></tbody></table></div><div class="data-legend"><span><b>TABLE</b> record collection</span><span><b>COLUMN</b> named field</span><span><b>ROW</b> one task</span><span><b>KEY</b> identity / link</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'api': return `<div class="api-visual">${flow(['Client SDK','User token','Data API','Postgres + RLS'],caption,'api-flow')}<div class="api-response"><span>REQUEST</span><code>GET /rest/v1/tasks?select=id,title,done</code><span>RESPONSE</span><code>[ { id: 101, title: "Review launch copy" } ]</code></div><div class="openapi-note"><b>OpenAPI spec</b><span>describes the exposed REST routes and schemas · it does not execute requests</span></div></div>`;
    case 'security': {
      const person = s===0?'Muskan':'Atif'; const id = s===0?'muskan-id':'atif-id';
      return `<div class="security-visual"><div class="identity-switch"><button data-step="0" class="${highlight(0)}"><span>MU</span>Muskan</button><button data-step="1" class="${highlight(1)}"><span>AT</span>Atif</button></div><div class="security-flow"><span>signed-in user<br><b>${person}</b></span><span class="security-arrow">→</span><span>policy checks<br><b>auth.uid() = owner_id</b></span><span class="security-arrow">→</span><span>visible rows<br><b>${s===0?'101 · 103':'102'}</b></span></div><div class="security-table"><div class="security-head"><b>task</b><b>owner</b><b>result</b></div>${[['101','muskan-id'],['102','atif-id'],['103','muskan-id']].map(([task,owner])=>`<div class="security-row ${owner===id?'visible':'blocked'}"><span>${task}</span><span>${owner}</span><span>${owner===id?'VISIBLE':'HIDDEN'}</span></div>`).join('')}</div><div class="security-label">SIMULATED POLICY RESULT · SAME QUERY, DIFFERENT USER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'storage': return `<div class="storage-visual"><div class="storage-flow">${['Client upload','RLS policy','Postgres metadata','Object bytes'].map((label,i)=>`<div class="storage-unit ${highlight(i)}"><span>${['↑','♙','▤','▥'][i]}</span><b>${label}</b><small>${['brief.pdf','is user allowed?','path + bucket','object provider'][i]}</small></div>${i<3?'<span class="storage-arrow">→</span>':''}`).join('')}</div><div class="storage-note"><strong>tasks table</strong><span>attachment path ↔ task ID</span><strong>task-files bucket</strong></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'realtime': return `<div class="realtime-visual"><div class="realtime-modes">${['DATABASE CHANGES','BROADCAST','PRESENCE'].map((mode,i)=>`<button data-step="${i}" class="${highlight(i)}">${mode}</button>`).join('')}</div><div class="realtime-scene"><div class="client-screen"><b>SCREEN A</b><span>${s===2?'Muskan is online':'Task updated'}</span><i>● connected</i></div><div class="realtime-channel ${s===1?'broadcast':''}"><span>◉</span><strong>${['POSTGRES CHANGE','CHANNEL MESSAGE','SHARED STATE'][s]}</strong><span>◉</span></div><div class="client-screen"><b>SCREEN B</b><span>${s===2?'Atif is online':'Task updated'}</span><i>● connected</i></div></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'functions': return `<div class="function-visual">${flow(['Browser','Edge Function','Mail API','Browser'],caption,'function-flow')}<div class="secret-box ${s===2?'active':''}"><span>SERVER SECRET</span><b>MAIL_API_KEY</b><small>never sent to the browser</small></div></div>`;
    case 'async': return `<div class="async-visual"><div class="async-lane"><span class="async-label">WHEN A TASK IS CREATED</span><div class="async-rail"><div class="async-box ${s===0?'active':''}"><b>API request</b><small>save task · respond</small></div><span class="async-arrow">→</span><div class="async-box ${s===1?'active':''}"><b>Queue</b><small>message waits safely</small></div><span class="async-arrow">→</span><div class="async-box ${s===2?'active':''}"><b>Consumer</b><small>send email · acknowledge</small></div></div></div><div class="async-lane cron-lane ${s===3?'active':''}"><span class="async-label">ON A RECURRING SCHEDULE</span><div class="async-rail"><div class="async-box"><b>Cron</b><small>09:00 · DB timezone</small></div><span class="async-arrow">→</span><div class="async-box"><b>SQL or function</b><small>run scheduled work</small></div></div></div><div class="async-footnote">ILLUSTRATIVE FLOW · QUEUE CONSUMER IS AN APPLICATION WORKER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'workflow': return `<div class="workflow-visual"><div class="workflow-rail">${[['LOCAL','CLI + Docker'],['GIT','SQL migration'],['REVIEW','test + diff'],['REMOTE','apply changes']].map(([label,detail],i)=>`<div class="workflow-stop ${highlight(i)}"><span>${String(i+1).padStart(2,'0')}</span><b>${label}</b><small>${detail}</small></div>`).join('')}</div><div class="workflow-stamp">SCHEMA HISTORY <b>001 → 002 → 003</b></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
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
  $('#stage').innerHTML = `<section class="slide slide-${slide.id}" aria-label="Slide ${state.index+1}: ${escapeHtml(slide.title)}"><div class="slide-head"><div class="eyebrow">${escapeHtml(slide.tag)}</div><h1>${escapeHtml(slide.title)}</h1><p class="lead">${escapeHtml(slide.lead)}</p></div><div class="slide-main"><div class="visual-panel" aria-label="Interactive illustration"><div class="illustration-label">INTERACTIVE ILLUSTRATION <span>· ${state.step+1} / ${slide.steps.length}</span></div><div class="visual-content" aria-live="polite">${visual(slide)}</div></div><aside class="slide-side"><div class="side-kicker">THE IDEA</div><p class="takeaway">${escapeHtml(slide.takeaway)}</p><div class="step-list"><span class="micro-label">FOLLOW THE FLOW</span>${slide.steps.map((step,index)=>`<button data-step="${index}" class="${highlight(index)}"><small>${String(index+1).padStart(2,'0')}</small>${escapeHtml(step)}</button>`).join('')}</div></aside></div><div class="slide-foot"><div class="scene-controls"><button data-action="reset" aria-label="Restart illustration">↺</button><button data-action="step">Next step →</button></div><div class="slide-source"><span>FACT CHECKED AGAINST OFFICIAL DOCS</span> ${sourceLinks(slide)}</div></div></section>`;
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
