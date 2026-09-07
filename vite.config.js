import {defineConfig} from 'vite';
export default defineConfig({base:'./',esbuild:{jsxFactory:'h',jsxFragment:'Fragment'},build:{target:'es2020'},server:{port:5178}});
