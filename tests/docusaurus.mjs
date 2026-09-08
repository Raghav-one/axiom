import {access, readFile} from 'node:fs/promises';

const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
if (manifest.length !== 55) throw new Error(`Expected 55 chapters; found ${manifest.length}.`);
for (const id of ['ai-map', 'linear-algebra']) {
  const chapter = manifest.find(item => item.id === id);
  if (chapter.words < 2000) throw new Error(`${id} has not received the required deep-reference expansion.`);
}
const aiMap = manifest.find(item => item.id === 'ai-map');
if (aiMap.words < 4300) throw new Error(`AI map remains too thin at ${aiMap.words} words.`);
if (aiMap.headings.length > 12) throw new Error(`AI map remains fragmented across ${aiMap.headings.length} headings.`);
const aiMapContent = JSON.parse(await readFile('public/content/ai-map.json', 'utf8'));
const aiMapSections = [...aiMapContent.html.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>([\s\S]*?)(?=<h2|$)/g)];
for (const [index, match] of aiMapSections.entries()) {
  const words = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  if (words < 250) throw new Error(`AI map section ${index + 1} remains too thin at ${words} words.`);
  if (!match[1].includes('signal-bullets') || !match[1].includes('class="gotcha"')) throw new Error(`AI map section ${index + 1} does not follow the Signal section format.`);
}

await access('docusaurus.config.js');
await access('sidebars.js');
await access('src/client/sidebar.js');
await access('docs/index.mdx');
await access('public/gpu.html');
await access('public/perspective.html');
await access('public/vendor/katex.min.js');
await access('public/vendor/d3.min.js');
await access('dist/search.html');

const home = await readFile('dist/index.html', 'utf8');
for (const domain of new Set(manifest.map(chapter => chapter.group))) {
  if (!home.includes(`href="/axiom/${domain}"`)) throw new Error(`Homepage card for ${domain} does not preserve the deployment base path.`);
}
if (home.includes('href="/computing/"')) throw new Error('Homepage still contains root-level volume links.');

for (const domain of new Set(manifest.map(chapter => chapter.group))) {
  const file = await readFile(`docs/volumes/${domain}.mdx`, 'utf8');
  if (!file.includes('hide_table_of_contents: true')) throw new Error(`Duplicate navigation rail enabled for ${domain}.`);
  for (const chapter of manifest.filter(item => item.group === domain && item.id !== 'gpu')) {
    if (!file.includes(`{#${chapter.id}}`)) throw new Error(`Missing chapter target ${chapter.id}.`);
    for (const heading of chapter.headings) {
      if (!file.includes(`{#${chapter.id}-${heading.id}}`)) throw new Error(`Missing sidebar section target ${chapter.id}#${heading.id}.`);
    }
  }
}

const sidebars = await readFile('sidebars.js', 'utf8');
if (!sidebars.includes('chapter.headings.map')) throw new Error('Sidebar does not enumerate chapter subsections.');
if (!sidebars.includes('sidebar-chapter-group sidebar-chapter-${chapter.id}')) throw new Error('Sidebar does not expose chapter hierarchy styling.');
const client = await readFile('src/client/sidebar.js', 'utf8');
if (!client.includes('sidebar-section-active')) throw new Error('Sidebar client module does not synchronize active sections.');
const deepening = await readFile('src/content/deepening.mjs', 'utf8');
if (!deepening.includes('diagram-stage-list')) throw new Error('Mental-model diagrams do not expose responsive stage details.');
if (deepening.includes('class=\"diagram-detail\"')) throw new Error('Mental-model prose is still rendered inside fixed SVG coordinates.');
console.log(`Validated Docusaurus hierarchy for ${manifest.length} chapters.`);
