# Axiom

A Docusaurus reference library for artificial intelligence, from computing and mathematics through systems, models, hardware, evaluation, institutions, and practice. The curriculum is published as 13 continuous volumes containing 55 chapters. The single documentation sidebar contains every discipline, chapter, and chapter subsection.

## Local development

```bash
npm install
npm run build
npm start
```

`npm run content` rebuilds the chapter JSON, the Docusaurus MDX volumes, the sidebar targets, and the standalone GPU assets. Generated `docs/` files are intentionally ignored because the production build creates them before Docusaurus compiles the site.

The production site is deployed through GitHub Pages on every push to `main` at <https://raghav-one.github.io/axiom/>.
