import {copyFile} from 'node:fs/promises';

// The Revolution handbook is part of this site, not an off-site reading list.
await copyFile('../revolution/revolution.html', 'public/perspective.html');
await copyFile('../revolution/revolution.html', 'dist/perspective.html');
