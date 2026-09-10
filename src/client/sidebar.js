let timer;

function syncSidebar() {
  const hashId = decodeURIComponent(window.location.hash.slice(1));
  if (!hashId && document.readyState !== 'complete') return;
  const id = hashId || document.querySelector('main article h2[id]')?.id;
  if (!id) return;
  const links = Array.from(document.querySelectorAll('.sidebar-chapter-link a[href], a.sidebar-chapter-link[href]'));
  const active = links.find(link => {
    try { return new URL(link.getAttribute('href'), window.location.href).hash === `#${id}`; }
    catch { return false; }
  }) || links.find(link => {
    try {
      const chapterId = new URL(link.getAttribute('href'), window.location.href).hash.slice(1);
      return id === chapterId || id.startsWith(`${chapterId}-`);
    } catch { return false; }
  });
  links.forEach(link => {
    const selected = link === active;
    link.classList.toggle('sidebar-chapter-active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
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
