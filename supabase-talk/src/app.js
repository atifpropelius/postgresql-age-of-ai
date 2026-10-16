import {slides, totalSeconds} from './slides.js';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[char]));
const text = (value) => escapeHtml(value);
const initial = Number(new URLSearchParams(location.search).get('slide') || 1) - 1;
let index = Number.isFinite(initial) ? Math.max(0, Math.min(slides.length - 1, initial)) : 0;
let demoStep = 0;

function definitions(items, extraClass = '') {
  if (!items || !items.length) return '';
  return `<dl class="definitions ${extraClass}">${items.map(([term, meaning]) =>
    `<div><dt>${text(term)}</dt><dd>${text(meaning)}</dd></div>`).join('')}</dl>`;
}

function table(slide, extraClass = '') {
  return `<div class="table-frame ${extraClass}"><table><thead><tr>${slide.columns.map((column) =>
    `<th scope="col">${text(column)}</th>`).join('')}</tr></thead><tbody>${slide.rows.map((row) =>
    `<tr>${row.map((cell, col) => `<${col === 0 ? 'th scope="row"' : 'td'}>${text(cell)}</${col === 0 ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

function note(label, value, extraClass = '') {
  return value ? `<div class="inline-note ${text(extraClass)}"><strong>${text(label)}</strong><span>${text(value)}</span></div>` : '';
}

function rail(steps) {
  return `<ol class="rail">${steps.map((step) => `<li>${text(step)}</li>`).join('')}</ol>`;
}

const demoScenes = [
  {location:'TABLE EDITOR / public.tasks', type:'table', content:'<table><thead><tr><th>id</th><th>owner_id</th><th>title</th><th>done</th></tr></thead><tbody><tr><td>101</td><td>atif-demo-id</td><td>Review brief</td><td>false</td></tr></tbody></table>', lesson:'One row is one task. PostgreSQL stores and validates it.'},
  {location:'AUTHENTICATION / Users', type:'lines', content:'<p>Demo identity: <strong>Atif</strong></p><p>User ID: <code>atif-demo-id</code></p><p>Session: signed in</p>', lesson:'Auth identifies Atif. A policy still decides which task rows he can see.'},
  {location:'DATA API / task request', type:'lines', content:'<p><code>GET /rest/v1/tasks?select=id,title</code></p><p>Allowed response:</p><p><code>[ { "id": 101, "title": "Review brief" } ]</code></p>', lesson:'PostgREST serves the HTTP route; the row comes from PostgreSQL.'},
  {location:'MIGRATION / reviewed file', type:'lines', content:'<p><code>create table public.tasks (...);</code></p><p><code>alter table public.tasks enable row level security;</code></p><p><code>-- committed and tested before release</code></p>', lesson:'A migration records a schema change so the team can review and replay it.'},
  {location:'STORAGE / private task-files bucket', type:'lines', content:'<p>Object path: <code>users/atif/brief.pdf</code></p><p>File bytes: object storage</p><p>Object metadata: PostgreSQL</p>', lesson:'The task row can keep a path; Storage keeps the PDF bytes.'},
  {location:'EDGE FUNCTION / Invocations + Logs', type:'lines', content:'<p>Function: <code>task-email</code></p><p>Inspect: status · duration · error message</p><p>Then open Usage → Edge Function invocations.</p>', lesson:'A function failure is investigated in its logs; its calls contribute to Usage.'}
];

function body(slide) {
  switch (slide.kind) {
    case 'title':
      return `<div class="hero"><div class="hero-line">TASK APP <span>→</span> SUPABASE SERVICES <span>→</span> POSTGRESQL</div><h2>By the end, you can:</h2><ol class="objectives">${slide.objectives.map((item, i) => `<li><span>${String(i + 1).padStart(2,'0')}</span>${text(item)}</li>`).join('')}</ol></div>`;
    case 'context':
      return `<div class="context-facts">${slide.facts.map(([value, description]) => `<div><strong>${text(value)}</strong><p>${text(description)}</p></div>`).join('')}</div><p class="footnote">${text(slide.footnote)}</p>`;
    case 'services':
      return table(slide, 'dense-table');
    case 'architecture':
      return `<div class="architecture-line"><span>Atif’s browser / mobile app</span><b aria-hidden="true">→</b><span>Auth · Data API · Storage · Realtime · Edge Functions</span><b aria-hidden="true">→</b><span>Postgres rows · file bytes · worker</span></div>${table(slide, 'architecture-table')}`;
    case 'request':
      return `<div class="request-grid">${slide.stages.map(([number, title, detail]) => `<div class="request-stage"><small>${text(number)}</small><strong>${text(title)}</strong><p>${text(detail)}</p></div>`).join('')}</div><div class="code-line"><span>CLIENT CODE</span><code>${text(slide.code)}</code></div>${note('RLS', slide.definition)}${note('OPENAPI', slide.openapi)}`;
    case 'workflow':
      return `${definitions(slide.definitions, 'workflow-definitions')}${rail(slide.steps)}${slide.code ? `<div class="code-line"><span>CLI EXAMPLE</span><code>${text(slide.code)}</code></div>` : ''}${note('COST CHOICE', slide.cost)}${note('PRODUCTION CHECK', slide.caution)}`;
    case 'region':
      return `<div class="factor-grid">${slide.factors.map(([term, meaning]) => `<div><strong>${text(term)}</strong><p>${text(meaning)}</p></div>`).join('')}</div>${note('TASK APP EXAMPLE', slide.example)}${note('PLAN AHEAD', slide.caution)}`;
    case 'dashboard':
      return `<div class="dashboard-path"><span>IN STUDIO</span><strong>${text(slide.path)}</strong></div>${table(slide, 'dashboard-table')}${note('WATCH FOR', slide.caution)}`;
    case 'usage':
      return `<div class="usage-snapshot"><div class="snapshot-label">ILLUSTRATIVE PRO DASHBOARD SNAPSHOT · ALLOWANCES CAN CHANGE</div><div class="snapshot-values">${slide.snapshot.map(([name, value, detail]) => `<div><small>${text(name)}</small><strong>${text(value)}</strong><span>${text(detail)}</span></div>`).join('')}</div></div><div class="metric-grid">${slide.metrics.map(([name, meaning]) => `<div><strong>${text(name)}</strong><span>${text(meaning)}</span></div>`).join('')}</div>${note('SPEND CAP', slide.spendCap, 'spend-cap-note')}${note('EXAMPLE', slide.example)}`;
    case 'demo':
      return `<div class="demo-layout"><ol class="demo-list">${slide.stops.map(([place, action], i) => `<li class="${i === demoStep ? 'active' : ''}"><button data-demo-step="${i}"><span>${String(i + 1).padStart(2,'0')}</span><strong>${text(place)}</strong><small>${text(action)}</small></button></li>`).join('')}</ol><div class="demo-screen"><div class="demo-screen-head"><span>PREPARED ILLUSTRATION · NOT LIVE PROJECT DATA</span><b>${text(demoScenes[demoStep].location)}</b></div><div class="demo-screen-body ${demoScenes[demoStep].type}">${demoScenes[demoStep].content}</div><p>${text(demoScenes[demoStep].lesson)}</p><button class="demo-next" data-demo-next>${demoStep === demoScenes.length - 1 ? 'Restart walkthrough ↺' : 'Next stop →'}</button></div></div>`;
    case 'wrap':
      return `<div class="wrap-list">${slide.takeaways.map(([number, title, detail]) => `<div><span>${text(number)}</span><strong>${text(title)}</strong><p>${text(detail)}</p></div>`).join('')}</div><p class="checklist">${text(slide.checklist)}</p>`;
    default:
      return `${definitions(slide.definitions)}${table(slide)}${note('TASK APP EXAMPLE', slide.example)}`;
  }
}

function render() {
  const slide = slides[index];
  $('#stage').innerHTML = `<article class="slide slide-${text(slide.id)}" aria-label="Slide ${index + 1}: ${text(slide.title)}"><header class="slide-head"><div class="eyebrow">${String(index + 1).padStart(2,'0')} / ${text(slide.section)}</div><h1>${text(slide.title)}</h1><p class="lead">${text(slide.lead)}</p></header><div class="slide-body">${body(slide)}</div><footer class="slide-takeaway"><strong>TAKEAWAY</strong><span>${text(slide.takeaway)}</span></footer></article>`;
  $('#chapterName').textContent = slide.section;
  $('#sectionLabel').textContent = slide.section;
  $('#counter').textContent = `${String(index + 1).padStart(2,'0')} / ${slides.length}`;
  $('#talkTime').textContent = `${totalSeconds / 60} MIN TALK`;
  $('#prevBtn').disabled = index === 0;
  $('#nextBtn').disabled = index === slides.length - 1;
  $('#progressFill').style.width = `${((index + 1) / slides.length) * 100}%`;
  document.title = `${slide.title} · Supabase as a Backend`;
}

function go(next, historyMode = 'replace') {
  index = Math.max(0, Math.min(slides.length - 1, next));
  demoStep = 0;
  const url = new URL(location.href);
  url.searchParams.set('slide', index + 1);
  if (historyMode === 'push') history.pushState({slide:index + 1}, '', url);
  else history.replaceState({slide:index + 1}, '', url);
  render();
  $('#stage').focus({preventScroll:true});
}

$('#homeBtn').addEventListener('click', () => go(0, 'push'));
$('#prevBtn').addEventListener('click', () => go(index - 1, 'push'));
$('#nextBtn').addEventListener('click', () => go(index + 1, 'push'));
$('#stage').addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.hasAttribute('data-demo-step')) {
    demoStep = Number(target.dataset.demoStep);
    render();
  } else if (target.hasAttribute('data-demo-next')) {
    demoStep = (demoStep + 1) % demoScenes.length;
    render();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'ArrowRight' || (event.key === ' ' && (event.target === document.body || event.target === $('#stage')))) {
    event.preventDefault(); go(index + 1, 'push');
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault(); go(index - 1, 'push');
  } else if (event.key === 'Home') {
    event.preventDefault(); go(0, 'push');
  } else if (event.key === 'End') {
    event.preventDefault(); go(slides.length - 1, 'push');
  }
});
window.addEventListener('popstate', () => {
  const requested = Number(new URLSearchParams(location.search).get('slide') || 1) - 1;
  index = Number.isFinite(requested) ? Math.max(0, Math.min(slides.length - 1, requested)) : 0;
  render();
});
go(index);
