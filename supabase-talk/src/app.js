import {slides, sources, totalMinutes} from './slides.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const params = new URLSearchParams(location.search);
const state = {
  index: Math.max(0, Math.min(slides.length - 1, Number(params.get('slide') || 1) - 1 || 0)),
  step: 0,
  playing: false,
  timer: null,
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
  security:['Asha sees only rows owned by Asha.','Atif sees only rows owned by Atif.'],
  storage:['A client submits a file.','Access rules decide whether it is allowed.','Postgres stores bucket and object metadata.','Object storage holds the actual bytes.'],
  realtime:['Stream selected database row changes.','Send a message to channel subscribers.','Track who is online in a shared channel.'],
  functions:['The client calls a function.','The function checks the caller.','Trusted code uses a server-side secret.','The function returns a result to the client.'],
  async:['The request creates a task without waiting for email delivery.','A durable queue holds the message for a consumer.','A worker reads, performs the work, then acknowledges it.','Cron separately triggers recurring work on a schedule.'],
  workflow:['Run the local development stack.','Record schema changes as SQL migrations.','Review the diff and test the result.','Apply reviewed changes to the remote project.'],
  production:['Check policies and secret placement.','Measure slow queries and their plans.','Control connection count for the workload.','Verify backups and a restore path.'],
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
      return `<div class="app-visual"><div class="app-phone"><div class="app-phone-top"><span>◉</span><span>TASKBOARD</span><span>•••</span></div><div class="app-user"><span>AS</span><div>Good morning, Asha<small>Your private workspace</small></div></div><div class="fake-task ${s===1?'active':''}"><b>Review launch copy</b><small>Due today</small></div><div class="fake-task"><b>Send project brief</b><small>Attached: brief.pdf</small></div><div class="app-phone-foot ${s===3?'active':''}">● Live updates connected</div></div><div class="app-requirements">${requirements.map(([number,need,service],i)=>`<div class="requirement ${highlight(i)}"><span>${number}</span><b>${need}</b><small>→ ${service}</small></div>`).join('')}</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'data': return `<div class="data-visual"><div class="data-path"><span>project database</span><b>›</b><span>public schema</span><b>›</b><strong>tasks table</strong></div><div class="table-wrap ${s===0?'active':''}"><table><thead><tr>${['id','owner_id','title','done'].map((name,i)=>`<th class="${s===1&&i===2?'selected':''}">${name}<small>${['bigint','uuid','text','boolean'][i]}</small></th>`).join('')}</tr></thead><tbody><tr class="${s===2?'selected':''}"><td class="${s===3?'selected':''}">101</td><td>asha-id</td><td>Review launch copy</td><td>false</td></tr><tr><td>102</td><td>atif-id</td><td>Send brief</td><td>true</td></tr><tr><td>103</td><td>asha-id</td><td>Call team</td><td>false</td></tr></tbody></table></div><div class="data-legend"><span><b>TABLE</b> record collection</span><span><b>COLUMN</b> named field</span><span><b>ROW</b> one task</span><span><b>KEY</b> identity / link</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'api': return `<div class="api-visual">${flow(['Client SDK','User token','Data API','Postgres + RLS'],caption,'api-flow')}<div class="api-response"><span>REQUEST</span><code>GET /rest/v1/tasks?select=id,title,done</code><span>RESPONSE</span><code>[ { id: 101, title: "Review launch copy" } ]</code></div><div class="openapi-note"><b>OpenAPI spec</b><span>describes the exposed REST routes and schemas · it does not execute requests</span></div></div>`;
    case 'security': {
      const person = s===0?'Asha':'Atif'; const id = s===0?'asha-id':'atif-id';
      return `<div class="security-visual"><div class="identity-switch"><button data-step="0" class="${highlight(0)}"><span>AS</span>Asha</button><button data-step="1" class="${highlight(1)}"><span>AT</span>Atif</button></div><div class="security-flow"><span>signed-in user<br><b>${person}</b></span><span class="security-arrow">→</span><span>policy checks<br><b>auth.uid() = owner_id</b></span><span class="security-arrow">→</span><span>visible rows<br><b>${s===0?'101 · 103':'102'}</b></span></div><div class="security-table"><div class="security-head"><b>task</b><b>owner</b><b>result</b></div>${[['101','asha-id'],['102','atif-id'],['103','asha-id']].map(([task,owner])=>`<div class="security-row ${owner===id?'visible':'blocked'}"><span>${task}</span><span>${owner}</span><span>${owner===id?'VISIBLE':'HIDDEN'}</span></div>`).join('')}</div><div class="security-label">SIMULATED POLICY RESULT · SAME QUERY, DIFFERENT USER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'storage': return `<div class="storage-visual"><div class="storage-flow">${['Client upload','RLS policy','Postgres metadata','Object bytes'].map((label,i)=>`<div class="storage-unit ${highlight(i)}"><span>${['↑','♙','▤','▥'][i]}</span><b>${label}</b><small>${['brief.pdf','is user allowed?','path + bucket','object provider'][i]}</small></div>${i<3?'<span class="storage-arrow">→</span>':''}`).join('')}</div><div class="storage-note"><strong>tasks table</strong><span>attachment path ↔ task ID</span><strong>task-files bucket</strong></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'realtime': return `<div class="realtime-visual"><div class="realtime-modes">${['DATABASE CHANGES','BROADCAST','PRESENCE'].map((mode,i)=>`<button data-step="${i}" class="${highlight(i)}">${mode}</button>`).join('')}</div><div class="realtime-scene"><div class="client-screen"><b>SCREEN A</b><span>${s===2?'Asha is online':'Task updated'}</span><i>● connected</i></div><div class="realtime-channel ${s===1?'broadcast':''}"><span>◉</span><strong>${['POSTGRES CHANGE','CHANNEL MESSAGE','SHARED STATE'][s]}</strong><span>◉</span></div><div class="client-screen"><b>SCREEN B</b><span>${s===2?'Atif is online':'Task updated'}</span><i>● connected</i></div></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'functions': return `<div class="function-visual">${flow(['Browser','Edge Function','Mail API','Browser'],caption,'function-flow')}<div class="secret-box ${s===2?'active':''}"><span>SERVER SECRET</span><b>MAIL_API_KEY</b><small>never sent to the browser</small></div></div>`;
    case 'async': return `<div class="async-visual"><div class="async-lane"><span class="async-label">WHEN A TASK IS CREATED</span><div class="async-rail"><div class="async-box ${s===0?'active':''}"><b>API request</b><small>save task · respond</small></div><span class="async-arrow">→</span><div class="async-box ${s===1?'active':''}"><b>Queue</b><small>message waits safely</small></div><span class="async-arrow">→</span><div class="async-box ${s===2?'active':''}"><b>Consumer</b><small>send email · acknowledge</small></div></div></div><div class="async-lane cron-lane ${s===3?'active':''}"><span class="async-label">ON A RECURRING SCHEDULE</span><div class="async-rail"><div class="async-box"><b>Cron</b><small>09:00 · DB timezone</small></div><span class="async-arrow">→</span><div class="async-box"><b>SQL or function</b><small>run scheduled work</small></div></div></div><div class="async-footnote">ILLUSTRATIVE FLOW · QUEUE CONSUMER IS AN APPLICATION WORKER</div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'workflow': return `<div class="workflow-visual"><div class="workflow-rail">${[['LOCAL','CLI + Docker'],['GIT','SQL migration'],['REVIEW','test + diff'],['REMOTE','apply changes']].map(([label,detail],i)=>`<div class="workflow-stop ${highlight(i)}"><span>${String(i+1).padStart(2,'0')}</span><b>${label}</b><small>${detail}</small></div>`).join('')}</div><div class="workflow-stamp">SCHEMA HISTORY <b>001 → 002 → 003</b></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    case 'production': {
      const checks = [['SECURITY','RLS + keys','Can user B read user A’s task?'],['QUERIES','plans + indexes','Which query is slow and why?'],['CONNECTIONS','pooling','Are short-lived functions opening too many sessions?'],['RECOVERY','backups + restore','Can we restore the data we need?']];
      return `<div class="production-visual"><div class="production-grid">${checks.map(([title,detail,question],i)=>`<div class="production-check ${highlight(i)}"><span>0${i+1}</span><b>${title}</b><small>${detail}</small><p>${question}</p></div>`).join('')}</div><div class="resource-line"><span>CPU</span><span>RAM</span><span>DISK I/O</span><span>CONNECTIONS</span><span>LATENCY</span></div></div><p class="viz-caption">${escapeHtml(caption)}</p>`;
    }
    case 'finale': return `<div class="finale-visual"><div class="finale-title">THE CONNECTED BACKEND</div>${flow(['USER','AUTH','DATA API + RLS','POSTGRES','OPTIONAL SERVICES'],caption,'finale-flow')}<div class="finale-bottom"><span>Storage + Realtime</span><span>Edge Functions</span><span>Queues + Cron</span></div></div>`;
    default: return '';
  }
}

function sourceLinks(slide) { return slide.source.map((key) => `<a href="${sources[key]}" target="_blank" rel="noopener noreferrer">${escapeHtml(key)} ↗</a>`).join(''); }
function panelContent(slide) {
  const code = slide.sql || slide.code;
  return `<div class="panel-inner"><div class="panel-heading"><span class="eyebrow">${state.overlay==='notes'?'PRESENTER NOTES':'TECHNICAL DETAILS'}</span><button data-action="close" aria-label="Close panel">✕</button></div><h2>${escapeHtml(slide.title)}</h2>${state.overlay==='notes'?`<p>${escapeHtml(slide.notes)}</p><div class="panel-time">Suggested time: ${Math.round(slide.duration/60*10)/10} min</div>`:`<p>${escapeHtml(slide.deep)}</p>${code?`<div class="code-head"><span>REAL ${slide.sql?'SQL':'CODE'}</span><button data-action="copy">Copy</button></div><pre><code>${escapeHtml(code)}</code></pre>`:''}`}<div class="panel-sources"><b>Official sources</b>${sourceLinks(slide)}</div></div>`;
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
  $('#stage').innerHTML = `<section class="slide slide-${slide.id}" aria-label="Slide ${state.index+1}: ${escapeHtml(slide.title)}"><div class="slide-head"><div class="eyebrow">${escapeHtml(slide.tag)}</div><h1>${escapeHtml(slide.title)}</h1><p class="lead">${escapeHtml(slide.lead)}</p></div><div class="slide-main"><div class="visual-panel" aria-label="Interactive illustration"><div class="illustration-label">INTERACTIVE ILLUSTRATION <span>· ${state.step+1} / ${slide.steps.length}</span></div><div class="visual-content" aria-live="polite">${visual(slide)}</div></div><aside class="slide-side"><div class="side-kicker">THE IDEA</div><p class="takeaway">${escapeHtml(slide.takeaway)}</p><div class="step-list"><span class="micro-label">FOLLOW THE FLOW</span>${slide.steps.map((step,index)=>`<button data-step="${index}" class="${highlight(index)}"><small>${String(index+1).padStart(2,'0')}</small>${escapeHtml(step)}</button>`).join('')}</div></aside></div><div class="slide-foot"><div class="scene-controls"><button data-action="reset" aria-label="Restart animation">↺</button><button data-action="play" class="play-button">${state.playing?'Pause':'Play flow'} ${state.playing?'Ⅱ':'▶'}</button><button data-action="step">Next step →</button></div><div class="slide-source"><span>FACT CHECKED AGAINST OFFICIAL DOCS</span> ${sourceLinks(slide)}</div></div></section>`;
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

function stop() { if (state.timer) clearInterval(state.timer); state.timer = null; state.playing = false; }
function go(index) { stop(); state.index = Math.max(0,Math.min(slides.length-1,index)); state.step = 0; state.overlay = null; render(); $('#stage').focus({preventScroll:true}); }
function stepTo(index) { stop(); state.step = Math.max(0,Math.min(current().steps.length-1,index)); render(); }
function nextStep() { if (state.step < current().steps.length-1) stepTo(state.step+1); else if (state.index < slides.length-1) go(state.index+1); }
function play() {
  if (state.playing) { stop(); render(); return; }
  if (state.step===current().steps.length-1) state.step=0;
  state.playing = true; render();
  state.timer = setInterval(()=>{
    if (state.step < current().steps.length-1) { state.step++; render(); }
    else { stop(); render(); }
  }, 1500);
}
function toggleOverlay(name) { stop(); state.overlay=state.overlay===name?null:name; render(); }

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
  if (action==='play') { play(); return; }
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
  if (key==='escape') { state.overlay=null; stop(); render(); return; }
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
