const config = {
  title: 'Axiom',
  tagline: 'The complete field library for artificial intelligence',
  favicon: 'favicon.svg',
  url: 'https://raghav-one.github.io',
  baseUrl: '/axiom/',
  organizationName: 'Raghav-one',
  projectName: 'axiom',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw'}},
  staticDirectories: ['public'],
  plugins: [function axiomNavigation() {
    return {name: 'axiom-navigation', getClientModules() { return [require.resolve('./src/client/sidebar.js')]; }};
  }],
  presets: [['classic', {
    docs: {
      routeBasePath: '/',
      sidebarPath: './sidebars.js',
      breadcrumbs: true,
      showLastUpdateTime: false,
      showLastUpdateAuthor: false,
    },
    blog: false,
    pages: false,
    sitemap: {changefreq: 'weekly', priority: 0.6},
    theme: {customCss: './src/css/custom.css'},
  }]],
  themes: [[require.resolve('@easyops-cn/docusaurus-search-local'), {
    hashed: true,
    indexDocs: true,
    indexBlog: false,
    indexPages: false,
    docsRouteBasePath: '/',
    searchBarShortcut: true,
    searchBarShortcutHint: true,
    searchBarPosition: 'right',
  }]],
  themeConfig: {
    colorMode: {defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false},
    navbar: {
      title: 'Axiom',
      logo: {alt: 'Axiom', src: 'favicon.svg'},
      items: [
        {to: '/', label: 'Field library', position: 'left'},
        {href: 'pathname:///gpu.html', label: 'GPU volume', position: 'left'},
        {href: 'pathname:///perspective.html', label: 'Perspective', position: 'left'},
      ],
    },
    docs: {sidebar: {hideable: true, autoCollapseCategories: true}},
    tableOfContents: {minHeadingLevel: 2, maxHeadingLevel: 4},
    footer: {style: 'light', copyright: 'Axiom · AI from bits and vectors to institutions and power'},
    prism: {additionalLanguages: ['python', 'bash', 'json']},
  },
};

module.exports = config;
