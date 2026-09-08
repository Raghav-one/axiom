import {copyFile} from 'node:fs/promises';

// The Revolution handbook is versioned in this project so hosted builds remain self-contained.
await copyFile('public/perspective.html', 'dist/perspective.html');
