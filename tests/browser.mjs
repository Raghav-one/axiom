import {readFile, access} from 'node:fs/promises';

const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
const required = ['ai-map', 'linear-algebra', 'gpu', 'transformer-architecture', 'capstone-projects'];

if (manifest.length < 55) throw new Error(`Expected at least 55 chapters; found ${manifest.length}.`);
for (const id of required) {
  const chapter = manifest.find(item => item.id === id);
  if (!chapter) throw new Error(`Missing required chapter: ${id}`);
  if (!chapter.title || !chapter.summary || !chapter.group) throw new Error(`Incomplete metadata: ${id}`);
  if (id !== 'gpu') await access(`public/content/${id}.json`);
}
await access('gpu.html');
await access('public/perspective.html');
for (const chapter of manifest) {
  const source = chapter.id === 'gpu'
    ? await readFile('gpu.html', 'utf8')
    : await readFile(`public/content/${chapter.id}.json`, 'utf8');
  if (!/(<svg|<canvas|authored-diagram)/.test(source)) {
    throw new Error(`Chapter needs a visual diagram or interactive graphic: ${chapter.id}`);
  }
}
const app = await readFile('src/main.jsx', 'utf8');
if (/target="_blank"|href=\{url\}/.test(app)) throw new Error('The library shell must not send readers to external source links.');
console.log(`Validated ${manifest.length} chapters and the standalone GPU handbook.`);
