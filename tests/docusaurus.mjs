import {access, readFile} from 'node:fs/promises';

const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
if (manifest.length !== 55) throw new Error(`Expected 55 chapters; found ${manifest.length}.`);
for (const id of ['ai-map', 'linear-algebra']) {
  const chapter = manifest.find(item => item.id === id);
  if (chapter.words < 2000) throw new Error(`${id} has not received the required deep-reference expansion.`);
}

await access('docusaurus.config.js');
await access('sidebars.js');
await access('src/theme/Root.js');
await access('docs/index.mdx');
await access('public/gpu.html');
await access('public/perspective.html');
await access('public/vendor/katex.min.js');
await access('public/vendor/d3.min.js');
await access('dist/search.html');

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
if (!sidebars.includes('collapsible: false')) throw new Error('Chapter subsections can collapse and disappear on hash navigation.');
const root = await readFile('src/theme/Root.js', 'utf8');
if (!root.includes("aria-current', 'location'")) throw new Error('Subsection hash state is not exposed or highlighted.');
console.log(`Validated Docusaurus hierarchy for ${manifest.length} chapters.`);
