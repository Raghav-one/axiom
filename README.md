# Axiom

A compact AI reference library covering computing, mathematics, data, models, hardware, systems, safety, and research practice. The Frontier-style reader groups 55 chapters across 13 domains, with hash-routed chapter links and a mobile navigation drawer.

## Local development

```bash
npm install
npm run build
npm start
```

`npm run content` rebuilds chapter JSON and standalone GPU assets. `npm run build` produces the static Vite site in `dist/`. Perspective remains a separate static page at `/axiom/perspective.html`.

The production site is deployed through GitHub Pages on every push to `main` at <https://raghav-one.github.io/axiom/>.
