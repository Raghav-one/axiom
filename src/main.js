import './style.css';
import {domains} from './catalog.mjs';

const base = import.meta.env.BASE_URL;
const app = document.querySelector('#app');
const storedFilter = 'axiom-domain-filter';
const storedOpen = 'axiom-open-domains';
let manifest = [];
let sidebarOpen = false;
let filter = localStorage.getItem(storedFilter) || 'all';
let openDomains = new Set(JSON.parse(localStorage.getItem(storedOpen) || '[]'));

const esc = value => String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const chapterUrl = id => `#/chapter/${encodeURIComponent(id)}`;

function route() {
  const match = location.hash.match(/^#\/chapter\/([^/?#]+)/);
  return match ? {name: 'chapter', id: decodeURIComponent(match[1])} : {name: 'home'};
}

function persistNavigation() {
  localStorage.setItem(storedFilter, filter);
  localStorage.setItem(storedOpen, JSON.stringify([...openDomains]));
}

function currentChapter(current) {
  return current.name === 'chapter' ? manifest.find(chapter => chapter.id === current.id) : undefined;
}

function domainChapters(domainId) {
  return manifest.filter(chapter => chapter.group === domainId);
}

function sidebar(current) {
  const active = currentChapter(current);
  if (active) openDomains.add(active.group);
  const visibleDomains = domains.filter(domain => filter === 'all' || filter === domain.id);
  return `<aside class="sidebar ${sidebarOpen ? 'is-open' : ''}" aria-label="Axiom navigation">
    <div class="sidebar-head">
      <a class="brand" href="#/" aria-label="Axiom home"><span>A</span> Axiom</a>
      <button class="close-drawer" type="button" aria-label="Close navigation">×</button>
    </div>
    <p class="sidebar-subtitle">AI field library</p>
    <label class="domain-filter-label" for="domain-filter">Filter domains</label>
    <select id="domain-filter" class="domain-filter">
      <option value="all" ${filter === 'all' ? 'selected' : ''}>All domains</option>
      ${domains.map(domain => `<option value="${domain.id}" ${filter === domain.id ? 'selected' : ''}>${esc(domain.short)}</option>`).join('')}
    </select>
    <nav class="domain-list" aria-label="Chapters">
      ${visibleDomains.map(domain => {
        const expanded = openDomains.has(domain.id);
        const items = domainChapters(domain.id);
        return `<section class="domain-group">
          <button class="domain-toggle" type="button" data-domain="${domain.id}" aria-expanded="${expanded}" aria-controls="domain-${domain.id}">
            <span><b>${esc(domain.name)}</b><small>${items.length} chapters</small></span><i aria-hidden="true">${expanded ? '−' : '+'}</i>
          </button>
          <div class="chapter-list" id="domain-${domain.id}" ${expanded ? '' : 'hidden'}>
            ${items.map(chapter => `<a class="chapter-link ${active?.id === chapter.id ? 'is-active' : ''}" href="${chapterUrl(chapter.id)}"><em>${chapter.number}</em><span>${esc(chapter.title)}</span></a>`).join('')}
          </div>
        </section>`;
      }).join('')}
    </nav>
    <nav class="special-links" aria-label="Reference sites">
      <a href="${base}gpu.html">GPU handbook <span>↗</span></a>
      <a href="${base}perspective.html">Perspective <span>↗</span></a>
    </nav>
  </aside>`;
}

function home() {
  return `<article class="home-view">
    <p class="eyebrow">Axiom · field library</p>
    <h1>Artificial intelligence, organized from foundations to production.</h1>
    <p class="lede">A continuous reference across computing, mathematics, data, models, systems, safety, and research practice. Choose a domain from the library or begin with the foundations.</p>
    <div class="home-actions"><a class="primary-action" href="${chapterUrl('ai-map')}">Start with the field map</a><a class="secondary-action" href="${base}gpu.html">Open the GPU handbook</a></div>
    <section class="domain-grid" aria-label="Axiom domains">
      ${domains.map(domain => { const chapters = domainChapters(domain.id); return `<a href="${chapterUrl(chapters[0]?.id || '')}" class="domain-card"><span>${String(domains.indexOf(domain) + 1).padStart(2, '0')}</span><h2>${esc(domain.name)}</h2><p>${esc(domain.description)}</p><small>${chapters.length} chapters</small></a>`; }).join('')}
    </section>
  </article>`;
}

async function chapterView(chapter) {
  if (!chapter) return `<article class="empty-state"><h1>Chapter not found</h1><p>This route does not match a chapter in Axiom.</p><a href="#/">Return to the field library</a></article>`;
  const response = await fetch(`${base}content/${chapter.id}.json`);
  if (!response.ok) throw new Error(`Could not load ${chapter.id}`);
  const content = await response.json();
  const domain = domains.find(item => item.id === chapter.group);
  return `<article class="chapter-view">
    <a class="crumb" href="#/">Axiom</a><span class="crumb-separator">/</span><span class="crumb">${esc(domain?.name || chapter.group)}</span>
    <p class="eyebrow">${esc(domain?.short || chapter.group)} · chapter ${chapter.number}</p>
    <h1>${esc(chapter.title)}</h1>
    <p class="chapter-summary">${esc(chapter.summary || '')}</p>
    <div class="chapter-meta"><span>${chapter.words.toLocaleString()} words</span><span>${chapter.minutes} min reference</span><span>${chapter.headings?.length || 0} sections</span></div>
    <div class="chapter-content">${content.html}</div>
  </article>`;
}

function shell(main) {
  const current = route();
  return `<button class="drawer-toggle" type="button" aria-label="Open navigation" aria-expanded="${sidebarOpen}"><span></span><span></span><span></span></button>
    <div class="mobile-bar"><a class="brand" href="#/"><span>A</span> Axiom</a><a href="${base}perspective.html">Perspective</a></div>
    <div class="scrim ${sidebarOpen ? 'is-visible' : ''}" aria-hidden="true"></div>
    <div class="app-layout">${sidebar(current)}<main class="main-content" id="main-content" tabindex="-1">${main}</main></div>`;
}

function enhanceReaderContent() {
  const diagrams = document.querySelectorAll('.chapter-content .concept-diagram, .chapter-content .worked-system, .chapter-content .derivation, .chapter-content .diagram, .chapter-content .gpu-diagram, .chapter-content .history-rail');
  diagrams.forEach(diagram => {
    diagram.classList.add('standard-diagram');
    if (diagram.matches('.history-rail') && !diagram.querySelector('.diagram-header')) {
      const header = document.createElement('div');
      header.className = 'diagram-header';
      header.innerHTML = '<span>HISTORICAL SEQUENCE</span><h3>Changes in the field and its constraints</h3>';
      diagram.prepend(header);
    }
  });

  document.querySelectorAll('.chapter-content pre').forEach(block => {
    if (block.dataset.enhanced) return;
    const source = block.textContent || '';
    const language = /^(import |from |def |print\()/m.test(source) ? 'Python' : /^(const |let |function |async )/m.test(source) ? 'JavaScript' : 'Implementation example';
    const header = document.createElement('div');
    block.classList.add('rich-code');
    header.className = 'code-meta';
    header.innerHTML = `<span>${language}</span><small>inspect → run → verify</small>`;
    block.prepend(header);
    block.dataset.enhanced = 'true';
  });
}

function bindEvents() {
  document.querySelector('.drawer-toggle')?.addEventListener('click', () => { sidebarOpen = true; render(); });
  document.querySelector('.close-drawer')?.addEventListener('click', () => { sidebarOpen = false; render(); });
  document.querySelector('.scrim')?.addEventListener('click', () => { sidebarOpen = false; render(); });
  document.querySelector('#domain-filter')?.addEventListener('change', event => { filter = event.target.value; persistNavigation(); render(); });
  document.querySelectorAll('.domain-toggle').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.domain;
    openDomains.has(id) ? openDomains.delete(id) : openDomains.add(id);
    persistNavigation(); render();
  }));
  document.querySelectorAll('.chapter-link').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    const destination = link.getAttribute('href');
    sidebarOpen = false;
    if (location.hash === destination) render();
    else location.hash = destination;
  }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && sidebarOpen) { sidebarOpen = false; render(); } }, {once: true});
}

async function render() {
  const current = route();
  try {
    const main = current.name === 'home' ? home() : await chapterView(currentChapter(current));
    app.innerHTML = shell(main);
    enhanceReaderContent();
    bindEvents();
    if (current.name === 'chapter') document.querySelector('#main-content')?.focus({preventScroll: true});
  } catch (error) {
    app.innerHTML = shell(`<article class="empty-state"><h1>Content unavailable</h1><p>${esc(error.message)}</p><a href="#/">Return to the field library</a></article>`);
    bindEvents();
  }
}

async function start() {
  const response = await fetch(`${base}content/manifest.json`);
  manifest = response.ok ? await response.json() : await (await fetch(`${base}manifest.json`)).json();
  if (!openDomains.size) openDomains.add(domains[0].id);
  await render();
}

window.addEventListener('hashchange', () => {
  sidebarOpen = false;
  render();
});
start();
