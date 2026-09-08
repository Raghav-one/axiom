const manifest = require('./src/manifest.json');

const domains = [
  ['computing', 'Computing foundations'],
  ['mathematics', 'Mathematics for AI'],
  ['data', 'Data and representation'],
  ['machine-learning', 'Machine learning'],
  ['deep-learning', 'Deep learning'],
  ['hardware', 'Hardware and acceleration'],
  ['language', 'Language models and architectures'],
  ['training', 'Training and adaptation'],
  ['agents', 'Agents, tools and reasoning'],
  ['multimodal', 'Vision, audio and the physical world'],
  ['production', 'Engineering and production'],
  ['safety', 'Safety, security and interpretation'],
  ['research', 'Research, evidence and practice'],
].map(([id, name]) => ({id, name}));

const library = domains.map((domain, domainIndex) => ({
  type: 'category',
  label: `${String(domainIndex + 1).padStart(2, '0')}  ${domain.name}`,
  collapsed: domainIndex !== 0,
  link: {type: 'doc', id: `volumes/${domain.id}`},
  items: manifest.filter(chapter => chapter.group === domain.id).map(chapter => {
    if (chapter.id === 'gpu') {
      return {type: 'link', label: `${chapter.number}  ${chapter.title}`, href: 'pathname:///gpu.html'};
    }
    return {
      type: 'category',
      label: `${chapter.number}  ${chapter.title}`,
      collapsed: true,
      items: [{
        type: 'link',
        label: '00  Chapter overview',
        href: `/${domain.id}/#${chapter.id}`,
        className: 'sidebar-section-link',
      }, ...chapter.headings.map((heading, index) => ({
        type: 'link',
        label: `${String(index + 1).padStart(2, '0')}  ${heading.title}`,
        href: `/${domain.id}/#${chapter.id}-${heading.id}`,
        className: 'sidebar-section-link',
      }))],
    };
  }),
}));

module.exports = {library};
