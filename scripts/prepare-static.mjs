import fs from 'node:fs/promises';

await fs.writeFile('public/.nojekyll', '');
await fs.cp('vendor', 'public/vendor', {recursive: true});
