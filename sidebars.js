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
  className: 'sidebar-domain-group',
  label: `${String(domainIndex + 1).padStart(2, '0')}  ${domain.name}`,
  collapsed: domainIndex !== 0,
  link: {type: 'doc', id: `volumes/${domain.id}`},
  // A volume is one continuous document. Keep navigation at chapter level so the
  // sidebar remains an index, rather than duplicating the document outline.
  items: manifest.filter(chapter => chapter.group === domain.id).map(chapter => ({
    type: 'link',
    label: `${chapter.number}  ${chapter.title}`,
    href: `/${domain.id}/#${chapter.id}`,
    className: `sidebar-chapter-link sidebar-chapter-${chapter.id}`,
  })),
}));

module.exports = {library};
