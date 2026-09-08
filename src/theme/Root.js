import React, {useEffect} from 'react';

function syncSidebarHash() {
  const current = window.location.hash;
  const links = document.querySelectorAll(
    '.sidebar-section-link a[href], a.sidebar-section-link[href]',
  );

  for (const link of links) {
    const target = new URL(link.href, window.location.href);
    const active = Boolean(current) &&
      target.pathname === window.location.pathname &&
      target.hash === current;

    link.classList.toggle('sidebar-section-active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else if (link.getAttribute('aria-current') === 'location') link.removeAttribute('aria-current');
  }
}

export default function Root({children}) {
  useEffect(() => {
    const syncAfterNavigation = (event) => {
      if (event.target.closest('a[href*="#"]')) window.setTimeout(syncSidebarHash, 0);
    };

    syncSidebarHash();
    window.addEventListener('hashchange', syncSidebarHash);
    window.addEventListener('popstate', syncSidebarHash);
    document.addEventListener('click', syncAfterNavigation);

    // Docusaurus replaces sidebar nodes during client-side navigation.
    const observer = new MutationObserver(syncSidebarHash);
    observer.observe(document.body, {childList: true, subtree: true});

    return () => {
      window.removeEventListener('hashchange', syncSidebarHash);
      window.removeEventListener('popstate', syncSidebarHash);
      document.removeEventListener('click', syncAfterNavigation);
      observer.disconnect();
    };
  }, []);

  return children;
}
