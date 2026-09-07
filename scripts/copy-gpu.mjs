import {cp,copyFile} from 'node:fs/promises';
await copyFile('gpu.html','dist/gpu.html');
await cp('vendor','dist/vendor',{recursive:true});
await copyFile('gpu-enhancements.css','dist/gpu-enhancements.css');
await copyFile('gpu-enhancements.js','dist/gpu-enhancements.js');
