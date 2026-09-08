import React, {useEffect} from 'react';

const sectionLinks = () => Array.from(document.querySelectorAll(
  '.sidebar-section-link a[href], a.sidebar-section-link[href]',
 ));

function setActiveLink(id) {
  if (!id) return;
  let activeLink;
  for (const link of sectionLinks()) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    const target = new URL(link.href, window.location.href);
    const active = target.pathname === window.location.pathname && target.hash === `#${id}`;
    link.classList.toggle('sidebar-section-active', active);
    if (active) {
      activeLink = link;
      link.setAttribute('aria-current', 'location');
    } else if (link.getAttribute('aria-current') === 'location') {
      link.removeAttribute('aria-current');
    }
  }

  if (activeLink) {
    const activeChapter = activeLink.closest('.sidebar-chapter-group');
    for (const group of document.querySelectorAll('.sidebar-chapter-group')) {
      if (group === activeChapter || group.dataset.closing === 'true') continue;
      const closer = group.querySelector(':scope > .menu__list-item-collapsible [role="button"][aria-expanded="true"]');
      if (closer instanceof HTMLElement) {
        group.dataset.closing = 'true';
        closer.click();
        window.setTimeout(() => delete group.dataset.closing, 120);
      }
    }
    return;
  }

  const chapter = Array.from(document.querySelectorAll('.sidebar-chapter-group')).find(group => {
    const chapterClass = Array.from(group.classList).find(name => typeof name === 'string' && name.startsWith('sidebar-chapter-') && name !== 'sidebar-chapter-group');
    const chapterId = chapterClass?.slice('sidebar-chapter-'.length);
    return chapterId && (id === chapterId || id.startsWith(`${chapterId}-`));
  });
  const toggle = chapter?.querySelector(':scope > .menu__list-item-collapsible [role="button"][aria-expanded="false"]');
  if (toggle instanceof HTMLElement && chapter.dataset.opening !== 'true') {
    chapter.dataset.opening = 'true';
    toggle.click();
    window.setTimeout(() => {
      delete chapter.dataset.opening;
      setActiveLink(id);
    }, 80);
  }
}

function syncSidebarHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (id) setActiveLink(id);
}

function watchReadingPosition() {
  const headings = Array.from(document.querySelectorAll('main article h2[id], main article h3[id]'));
  if (!headings.length) return () => {};
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (visible) setActiveLink(visible.target.id);
  }, {rootMargin: '-82px 0px -72% 0px', threshold: 0});
  headings.forEach(heading => {
    if (heading instanceof Element && heading.isConnected) observer.observe(heading);
  });
  if (!window.location.hash) setActiveLink(headings[0].id);
  return () => observer.disconnect();
}

export default function Root({children}) {
  useEffect(() => {
    let stopWatching = watchReadingPosition();
    let rebuildTimer;
    const rebuild = () => {
      window.clearTimeout(rebuildTimer);
      rebuildTimer = window.setTimeout(() => {
        stopWatching();
        syncSidebarHash();
        stopWatching = watchReadingPosition();
      }, 40);
    };
    const syncAfterNavigation = (event) => {
      if (event.target.closest('a[href*="#"]')) window.setTimeout(syncSidebarHash, 0);
    };

    syncSidebarHash();
    const hydrationTimer = window.setTimeout(rebuild, 180);
    window.addEventListener('hashchange', syncSidebarHash);
    window.addEventListener('popstate', rebuild);
    document.addEventListener('click', syncAfterNavigation);

    const observer = new MutationObserver(rebuild);
    observer.observe(document.body, {childList: true, subtree: true});

    return () => {
      window.removeEventListener('hashchange', syncSidebarHash);
      window.clearTimeout(rebuildTimer);
      window.clearTimeout(hydrationTimer);
      stopWatching();
      window.removeEventListener('popstate', rebuild);
      document.removeEventListener('click', syncAfterNavigation);
      observer.disconnect();
    };
  }, []);

  return children;
}
