export default {
  category: 'Layout',

  examples: [
    {
      title: 'Sections with markup',
      description:
        'Each section is a native `<details>`. The `summary` slot is the line that opens it, and the content can hold any markup. Sections next to each other share their borders, like an accordion.',
      html: `<zeno-disclosure>
  <span slot="summary"><code>GET /facilities</code></span>
  <p>Lists facilities near a point. <a href="#">Parameters</a></p>
</zeno-disclosure>
<zeno-disclosure open>
  <span slot="summary"><code>GET /coverage</code></span>
  <p>Coverage by county and city.</p>
</zeno-disclosure>`,
    },
  ],

  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: 'Opens or closes the section, on the summary.',
    },
  ],

  accessibility: [
    'The summary is a native `<summary>`, which browsers expose as a button with its expanded state.',
    'Closed content is not rendered, so screen readers skip it.',
    'Find in page opens a closed section that holds the text, in browsers that support it.',
  ],

  gaps: [
    // zeno-disclosure.ts: the summary cannot contain a heading.
    'The summary is not inside a heading, so screen reader users cannot move between sections by heading. Put a heading before the group instead.',
    // zeno-disclosure.ts: sections are independent.
    'Each section opens on its own. There is no setting to close the others when one opens.',
  ],
};
