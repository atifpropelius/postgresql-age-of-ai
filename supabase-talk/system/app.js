import {slides} from '../src/slides.js?v=compute-agent-20261019';
import {presenterNotes} from './notes.js?v=compute-agent-20261019';

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));
const pad = (number) => String(number).padStart(2, '0');
const formatDuration = (seconds) => `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
const requestedSlide = Number(new URLSearchParams(location.search).get('slide'));
let index = Number.isInteger(requestedSlide) && requestedSlide >= 1 && requestedSlide <= slides.length ? requestedSlide - 1 : 0;

function renderLinks(links) {
  return (links || []).map(([label, url]) =>
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`
  ).join('');
}

function renderDeepDive(cards) {
  return (cards || []).map((card) => `<article class="deep-card">
    <div class="deep-head"><h2>${escapeHtml(card.title)}</h2><span>${escapeHtml(card.badge)}</span></div>
    <ol>${card.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ol>
    <div class="deep-links">${renderLinks(card.links)}</div>
  </article>`).join('');
}

function renderNavigation() {
  let section = '';
  $('#slideList').innerHTML = slides.map((slide, slideIndex) => {
    const heading = section === slide.section ? '' : `<div class="nav-section">${escapeHtml(slide.section)}</div>`;
    section = slide.section;
    return `${heading}<button type="button" data-slide="${slideIndex}" ${slideIndex === index ? 'aria-current="page"' : ''}><span>${pad(slideIndex + 1)}</span><span>${escapeHtml(slide.title)}</span></button>`;
  }).join('');
  $('#slideCount').textContent = slides.length;
  $('#slideList').querySelector('[aria-current="page"]')?.scrollIntoView({block: 'nearest'});
}

function sizePreview() {
  const frame = $('#previewFrame');
  frame.style.setProperty('--preview-scale', String(frame.clientWidth / 1280));
}

function render() {
  const slide = slides[index];
  const note = presenterNotes[slide.id];
  if (!note) throw new Error(`Missing presenter note for slide ${slide.id}`);
  renderNavigation();
  $('#topSection').textContent = slide.section;
  $('#duration').textContent = `${formatDuration(slide.duration)} FOR THIS SLIDE`;
  $('#pageNumber').textContent = `SLIDE ${pad(index + 1)} / ${pad(slides.length)}`;
  $('#pageTitle').textContent = slide.title;
  $('#pageLead').textContent = slide.lead;
  $('#noteTime').textContent = formatDuration(slide.duration);
  $('#takeaway').textContent = slide.takeaway;
  $('#say').textContent = note.say;
  $('#what').textContent = note.what;
  $('#why').textContent = note.why;
  $('#how').textContent = note.how;
  $('#deepDive').innerHTML = renderDeepDive(note.deepDive);
  $('#sourceLinks').innerHTML = renderLinks(note.links);
  $('#pagerCount').textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
  $('#previous').disabled = index === 0;
  $('#next').disabled = index === slides.length - 1;
  const audienceUrl = `../?slide=${index + 1}&v=compute-agent-20261019`;
  $('#audienceLink').href = audienceUrl;
  $('#slidePreview').src = audienceUrl;
  document.title = `${pad(index + 1)} · ${slide.title} · Presenter system`;
  sizePreview();
}

function go(next, mode = 'push') {
  const bounded = Math.max(0, Math.min(slides.length - 1, next));
  if (bounded === index && mode === 'push') return;
  index = bounded;
  const url = new URL(location.href);
  url.searchParams.set('slide', index + 1);
  if (mode === 'push') history.pushState({slide: index + 1}, '', url);
  else history.replaceState({slide: index + 1}, '', url);
  render();
  $('.content').scrollTop = 0;
}

$('#slideList').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-slide]');
  if (button) go(Number(button.dataset.slide));
});
$('#previous').addEventListener('click', () => go(index - 1));
$('#next').addEventListener('click', () => go(index + 1));
document.addEventListener('keydown', (event) => {
  if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); go(index + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(index - 1); }
});
window.addEventListener('popstate', () => {
  const value = Number(new URLSearchParams(location.search).get('slide'));
  index = Number.isInteger(value) && value >= 1 && value <= slides.length ? value - 1 : 0;
  render();
});
new ResizeObserver(sizePreview).observe($('#previewFrame'));
go(index, 'replace');
