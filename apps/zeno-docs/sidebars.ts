import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
// Written by scripts/generate.mjs, which runs before the site starts or builds.
import elements from './src/generated/elements.json';
import site from './src/generated/site.json';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'get-started',
    {
      type: 'category',
      label: 'Elements',
      link: { type: 'doc', id: 'elements/index' },
      collapsed: false,
      items: site.categories.map(category => ({
        type: 'category' as const,
        label: category,
        collapsed: true,
        items: elements
          .filter(element => element.category === category)
          .map(element => `elements/${element.name}`),
      })),
    },
    'using-the-elements',
    'tokens',
    'frameworks',
    {
      type: 'category',
      label: 'Project',
      collapsed: false,
      items: [
        'releases',
        'versioning',
        'accessibility',
        'contributing',
        'building',
      ],
    },
  ],
};

export default sidebars;
