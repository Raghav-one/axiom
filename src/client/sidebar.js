let timer;

function syncSidebar() {
  const hashId = decodeURIComponent(window.location.hash.slice(1));
  if (!hashId && document.readyState !== 'complete') return;
  const id = hashId || document.querySelector('main article h2[id]')?.id;
  if (!id) return;
  const links = Array.from(document.querySelectorAll('.sidebar-section-link a[href]'));
  const active = links.find(link => {
    try { return new URL(link.getAttribute('href'), window.location.href).hash === `#${id}`; }
    catch { return false; }
  });
  if (!active && hashId) {
    const chapter = Array.from(document.querySelectorAll('.sidebar-chapter-group')).find(group => {
      const token = Array.from(group.classList).find(name => name.startsWith('sidebar-chapter-') && name !== 'sidebar-chapter-group');
      const chapterId = token?.slice('sidebar-chapter-'.length);
      return chapterId && (hashId === chapterId || hashId.startsWith(`${chapterId}-`));
    });
    const opener = chapter?.querySelector(':scope > .menu__list-item-collapsible [role="button"][aria-expanded="false"]');
    if (opener) { opener.click(); window.setTimeout(syncSidebar, 120); }
    return;
  }
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
  [250, 600, 1200, 2000].forEach(delay => window.setTimeout(syncSidebar, delay));
}
