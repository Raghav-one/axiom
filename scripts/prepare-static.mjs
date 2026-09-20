import fs from 'node:fs/promises';

await fs.writeFile('public/.nojekyll', '');
await fs.copyFile('gpu.html', 'public/gpu.html');
await fs.cp('vendor', 'public/vendor', {recursive: true});
await fs.cp('static/gpu-visuals', 'public/gpu-visuals', {recursive: true});
