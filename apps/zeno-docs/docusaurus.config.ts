import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { brand, links } from './src/brand';
import { codeTheme } from './src/prism-theme';

const config: Config = {
  title: brand.name,
  tagline: 'Web components and design tokens that work in any framework',
  url: links.site,
  baseUrl: '/',
  favicon: brand.avatar,
  trailingSlash: false,
  // The site is served from the root, so the warning banner for a wrong base
  // URL is not needed. Leaving it out also drops one inline script, which keeps
  // the content security policy in static/_headers to a single hash.
  baseUrlIssueBanner: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  i18n: { defaultLocale: 'en', locales: ['en'] },

  // Registers the Zeno elements in the browser. See src/clientModules/zeno.ts.
  clientModules: ['./src/clientModules/zeno.ts'],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: `${links.repository}/edit/main/apps/zeno-docs/`,
        },
        blog: false,
        theme: {
          // The Zeno tokens first, then the mapping onto the site theme.
          customCss: [
            require.resolve('@usezeno/tokens/css'),
            './src/css/custom.css',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      // The brand link is drawn by src/theme/Logo, from the lockup files.
      title: brand.name,
      items: [
        { to: '/get-started', label: 'Get started', position: 'left' },
        { to: '/elements', label: 'Elements', position: 'left' },
        { to: '/tokens', label: 'Tokens', position: 'left' },
        { to: '/frameworks', label: 'Frameworks', position: 'left' },
        { to: '/releases', label: 'Releases', position: 'left' },
        { href: links.repository, label: 'GitHub', position: 'right' },
        { href: links.npm, label: 'npm', position: 'right' },
      ],
    },
    footer: {
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Get started', to: '/get-started' },
            { label: 'Elements', to: '/elements' },
            { label: 'Tokens', to: '/tokens' },
            { label: 'Frameworks', to: '/frameworks' },
          ],
        },
        {
          title: 'Project',
          items: [
            { label: 'Releases', to: '/releases' },
            { label: 'Versioning and support', to: '/versioning' },
            { label: 'Accessibility', to: '/accessibility' },
            { label: 'Contributing', to: '/contributing' },
          ],
        },
        {
          title: 'Elsewhere',
          items: [
            { label: 'GitHub', href: links.repository },
            { label: 'npm', href: links.npm },
            { label: 'Report a bug', href: links.issues },
          ],
        },
      ],
      copyright: `${brand.footLine}<br />Copyright © ${new Date().getFullYear()} Cipher Labs. Released under the MIT License.`,
    },
    prism: {
      theme: codeTheme,
      darkTheme: codeTheme,
      additionalLanguages: ['bash', 'diff', 'json'],
    },
    colorMode: { respectPrefersColorScheme: true },
    docs: { sidebar: { hideable: false } },
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
  } satisfies Preset.ThemeConfig,
};

export default config;
