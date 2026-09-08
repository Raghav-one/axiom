import fs from 'node:fs/promises';

for (const file of ['gpu.html', 'gpu-enhancements.css', 'gpu-enhancements.js']) {
  await fs.copyFile(file, `public/${file}`);
}

await fs.writeFile('public/.nojekyll', '');
await fs.cp('vendor', 'public/vendor', {recursive: true});
