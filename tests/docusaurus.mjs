import {access, readFile} from 'node:fs/promises';

const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
if (manifest.length !== 55) throw new Error(`Expected 55 chapters; found ${manifest.length}.`);
for (const id of ['ai-map', 'linear-algebra']) {
  const chapter = manifest.find(item => item.id === id);
  if (chapter.words < 2000) throw new Error(`${id} has not received the required deep-reference expansion.`);
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
console.log(`Validated Docusaurus hierarchy for ${manifest.length} chapters.`);
