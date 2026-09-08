import fs from 'node:fs/promises';
import manifest from '../src/manifest.json' with {type: 'json'};
import {domains} from '../src/catalog.mjs';

const yaml = value => JSON.stringify(String(value));
const safeHeading = value => String(value).replace(/[{}<>]/g, '').trim();

await fs.rm('docs', {recursive: true, force: true});
await fs.mkdir('docs/volumes', {recursive: true});

const cards = domains.map((domain, domainIndex) => {
  const domainChapters = manifest.filter(chapter => chapter.group === domain.id);
  return `<Link className="domainCard" to="/${domain.id}"><span>${String(domainIndex + 1).padStart(2, '0')} · ${domainChapters.length} chapters</span><strong>${domain.name}</strong><p>${domain.description}</p></Link>`;
}).join('\n');

const landing = `---
id: index
title: Axiom — The AI Field Library
slug: /
hide_table_of_contents: true
hide_title: true
pagination_next: null
pagination_prev: null
---

import Link from '@docusaurus/Link';

<header className="libraryHero">
  <p className="eyebrow">THE COMPLETE FIELD LIBRARY</p>
  <h1>Artificial intelligence, from first principles to frontier systems.</h1>
  <p>A rigorous map of computing, mathematics, data, learning, hardware, language models, agents, multimodality, production, safety, and the institutions that shape the field.</p>
  <div className="heroFacts"><span><strong>${manifest.length}</strong> chapters</span><span><strong>${domains.length}</strong> long-form volumes</span><span><strong>${manifest.reduce((sum, chapter) => sum + chapter.words, 0).toLocaleString()}+</strong> indexed words</span></div>
</header>

The sequence starts below the model layer. Bits, memory, programs, complexity, vectors, probability, gradients, data provenance, and evaluation establish the contracts that later material depends on. Each discipline is one continuous reference volume. Its chapters and every subsection live in the left sidebar, so the reader follows one hierarchy instead of switching between competing navigation rails.

<div className="domainGrid">
${cards}
</div>
`;

await fs.writeFile('docs/index.mdx', landing);

for (const [domainIndex, domain] of domains.entries()) {
  const chapters = manifest.filter(chapter => chapter.group === domain.id);
  const imports = chapters.filter(chapter => chapter.id !== 'gpu').map((chapter, index) => `import chapter${index} from '@site/public/content/${chapter.id}.json';`).join('\n');
  const chapterSections = chapters.map((chapter, chapterIndex) => {
    if (chapter.id === 'gpu') {
      return `## ${chapter.number}. ${chapter.title} {#gpu}\n\n<div className="gpuCallout"><span>THE HARDWARE VOLUME</span><strong>GPU: from silicon to distributed scale</strong><p>The standalone GPU handbook carries its own 24-part architecture rail, interactive diagrams, memory calculations, kernel examples, and distributed-compute sections.</p><StaticLink to="/gpu.html">Open the GPU handbook →</StaticLink></div>`;
    }
    const dataIndex = chapters.filter(item => item.id !== 'gpu').findIndex(item => item.id === chapter.id);
    const sections = chapter.headings.map((heading, sectionIndex) => `### ${sectionIndex + 1}. ${safeHeading(heading.title)} {#${chapter.id}-${heading.id}}\n\n<ChapterSection html={chapter${dataIndex}.html} index={${sectionIndex}} />`).join('\n\n');
    const prerequisites = chapter.prerequisites.length
      ? `<div className="prerequisites"><strong>Prerequisites</strong> · ${chapter.prerequisites.map(id => manifest.find(item => item.id === id)?.title).filter(Boolean).join(' · ')}</div>`
      : '';
    const sources = chapter.sources.length
      ? `<details className="evidenceLedger"><summary>Evidence ledger</summary>${chapter.sources.map(([name, url]) => `<p><strong><a href="${url}">${name}</a>.</strong> Primary reference retained as provenance for this chapter.</p>`).join('')}</details>`
      : '';
    return `## ${chapter.number}. ${chapter.title} {#${chapter.id}}\n\n<p className="chapterSummary">${chapter.summary}</p>\n\n<div className="chapterMeta"><span>${chapter.words.toLocaleString()} words</span><span>${chapter.minutes} minute reference</span><span>${chapter.headings.length} sections</span></div>\n\n${prerequisites}\n\n<ChapterIntro html={chapter${dataIndex}.html} />\n\n${sections}\n\n${sources}`;
  }).join('\n\n');
  const totalWords = chapters.reduce((sum, chapter) => sum + (chapter.id === 'gpu' ? 0 : chapter.words), 0);
  const doc = `---
id: ${domain.id}
title: ${yaml(domain.name)}
description: ${yaml(domain.description)}
slug: /${domain.id}/
hide_table_of_contents: true
hide_title: true
pagination_next: null
pagination_prev: null
---

import ChapterSection, {ChapterIntro} from '@site/src/components/ChapterSection';
import StaticLink from '@site/src/components/StaticLink';
${imports}

<p className="chapterKicker">VOLUME ${String(domainIndex + 1).padStart(2, '0')} · ${chapters.length} CHAPTERS</p>

# ${domain.name}

<p className="chapterSummary">${domain.description}</p>

<div className="chapterMeta"><span>${totalWords.toLocaleString()} words</span><span>${chapters.reduce((sum, chapter) => sum + chapter.headings.length, 0)} indexed sections</span><span>Read continuously or navigate from the sidebar</span></div>

${chapterSections}
`;
  await fs.writeFile(`docs/volumes/${domain.id}.mdx`, doc);
}

console.log(`Generated ${domains.length} Docusaurus reference volumes containing ${manifest.length} chapters.`);
