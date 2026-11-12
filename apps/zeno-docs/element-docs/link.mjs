export default {
  category: 'Navigation',

  examples: [
    {
      title: 'In running text',
      description:
        'A link in a sentence is underlined, so it does not depend on colour to be seen.',
      html: `<p>Read the <zeno-link href="/methodology">methodology</zeno-link> before you cite a score.</p>`,
    },
    {
      title: 'External',
      description:
        '`external` adds the external-link icon. With `target="_blank"` the link gets `rel="noopener noreferrer"` and screen readers hear “(opens in a new tab)”.',
      html: `<zeno-link href="https://example.com/openapi.json" target="_blank" external>OpenAPI spec (JSON)</zeno-link>`,
    },
    {
      title: 'Around a router link',
      description:
        'Without `href` the element styles the `<a>` inside it, such as the one a React Router or Vue Router link renders, so navigation stays in the app.',
      html: `<zeno-link><a href="/coverage">Coverage</a></zeno-link>`,
    },
    {
      title: 'Standalone',
      description:
        'A link on its own line has no underline until the pointer is on it.',
      html: `<zeno-link href="/data" standalone>Data and API</zeno-link>`,
    },
  ],

  keyboard: [{ keys: ['Enter'], action: 'Follows the link.' }],

  accessibility: [
    'With `href` the element renders a native `<a>` inside its shadow root. Without one, the slotted `<a>` is the link and keeps its own semantics.',
    'Links in running text are underlined (WCAG 1.4.1). `standalone` removes the underline for links that are not in a sentence.',
    'A link with `target="_blank"` includes visually hidden text, `new-tab-label`, so screen reader users know a new tab opens.',
    'The focus ring follows the focus ring token, also on a slotted anchor.',
  ],

  gaps: [
    // zeno-link.ts: ::slotted(a) only reaches a direct child.
    'Without `href` only an `<a>` that is a direct child is styled. An anchor nested deeper keeps the page styles.',
    // zeno-link.ts: a disabled link renders a span.
    'A disabled link is plain text with `aria-disabled`. It is not in the tab order, so a keyboard user does not learn it exists.',
  ],
};
