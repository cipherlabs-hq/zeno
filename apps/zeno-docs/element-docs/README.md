# Element notes

One file per element, named after the tag without the `zeno-` prefix. Each
file holds what cannot be read from the code: the examples shown on the
element's page, its keyboard behaviour, accessibility notes and known gaps.

Everything else on an element page (attributes, properties, events, slots,
parts, form participation, test coverage) is generated from
`@usezeno/core`'s custom-elements manifest and test files by
`apps/zeno-docs/scripts/generate.mjs`. Do not repeat it here.

```js
export default {
  // Shown under the generated name, in the navigation and on the index.
  // One of: 'Actions', 'Forms', 'Feedback', 'Overlays', 'Navigation',
  // 'Data display', 'Layout'.
  category: 'Actions',

  examples: [
    {
      title: 'Variants',
      // Optional. One or two plain sentences.
      description: 'The five looks a button can have.',
      // Rendered as written, by the real elements, and shown as the code.
      html: `<zeno-button>Save</zeno-button>`,
      // Optional. Runs after the markup is on the page. `document` is scoped
      // to this example, so `document.querySelector` finds only its nodes.
      script: `document.querySelector('zeno-button').addEventListener('click', () => {});`,
      // Optional. For an example that changes the page around it, such as
      // the theme. The page shows this text and a button, and renders the
      // example only when the reader presses it.
      held: 'This example changes the theme of the whole site.',
    },
  ],

  // Keys the element itself handles, or that its native inner control
  // handles. Leave empty for an element that is not interactive.
  keyboard: [{ keys: ['Enter', 'Space'], action: 'Activates the button.' }],

  // Plain statements of what the element does for assistive technology.
  accessibility: ['Renders a native button inside its shadow root.'],

  // What is missing or wrong today. Say it plainly. Each entry must be
  // something you can point to in the source.
  gaps: [],
};
```

The generator checks every example: each `zeno-` tag must exist and each
attribute on it must be one the element declares. A wrong example fails the
build.
