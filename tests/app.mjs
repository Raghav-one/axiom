import {access, readFile} from 'node:fs/promises';

const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
if (manifest.length !== 55) throw new Error(`Expected 55 chapters; found ${manifest.length}.`);
for (const chapter of manifest) {
  await access(`public/content/${chapter.id}.json`);
  if (!chapter.title || !chapter.group || !chapter.number) throw new Error(`Invalid chapter metadata: ${chapter.id}`);
}
for (const page of ['dist/index.html', 'dist/gpu.html', 'dist/perspective.html', 'dist/content/ai-map.json']) await access(page);
const index = await readFile('dist/index.html', 'utf8');
if (!index.includes('/axiom/')) throw new Error('Production base path is missing from the app build.');
console.log(`Validated Axiom Vite shell and ${manifest.length} chapter payloads.`);
