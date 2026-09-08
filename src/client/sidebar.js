let timer;

function syncSidebar() {
  const id = decodeURIComponent(window.location.hash.slice(1)) || document.querySelector('main article h2[id]')?.id;
  if (!id) return;
  const links = Array.from(document.querySelectorAll('.sidebar-section-link a[href]'));
  const active = links.find(link => {
    try { return new URL(link.getAttribute('href'), window.location.href).hash === `#${id}`; }
    catch { return false; }
  });
  links.forEach(link => {
    const selected = link === active;
    link.classList.toggle('sidebar-section-active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  const activeChapter = active?.closest('.sidebar-chapter-group');
  if (!activeChapter) return;
  document.querySelectorAll('.sidebar-chapter-group').forEach(group => {
    if (group === activeChapter || group.dataset.closed === 'true') return;
    const toggle = group.querySelector(':scope > .menu__list-item-collapsible [role="button"][aria-expanded="true"]');
    if (toggle) {
      group.dataset.closed = 'true';
      toggle.click();
    }
  });
}

function scheduleSync() {
  if (timer) return;
  timer = window.setTimeout(() => {
    timer = undefined;
    syncSidebar();
  }, 80);
}

if (typeof window !== 'undefined') {
  document.documentElement.dataset.axiomSidebar = 'loaded';
  window.addEventListener('hashchange', scheduleSync);
  window.addEventListener('popstate', scheduleSync);
  window.addEventListener('load', scheduleSync);
  new MutationObserver(scheduleSync).observe(document.documentElement, {childList: true, subtree: true});
  window.setTimeout(syncSidebar, 250);
}
