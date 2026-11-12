export default {
  category: 'Actions',

  examples: [
    {
      title: 'Variants',
      html: `<zeno-button variant="primary">Primary</zeno-button>
<zeno-button variant="secondary">Secondary</zeno-button>
<zeno-button variant="accent">Accent</zeno-button>
<zeno-button variant="outline">Outline</zeno-button>
<zeno-button variant="ghost">Ghost</zeno-button>
<zeno-button variant="destructive">Destructive</zeno-button>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-button size="xs">Extra small</zeno-button>
<zeno-button size="sm">Small</zeno-button>
<zeno-button size="md">Medium</zeno-button>
<zeno-button size="lg">Large</zeno-button>
<zeno-button size="xl">Extra large</zeno-button>`,
    },
    {
      title: 'Disabled and loading',
      description:
        'A loading button keeps its width, shows a spinner and cannot be pressed.',
      html: `<zeno-button disabled>Disabled</zeno-button>
<zeno-button loading>Saving</zeno-button>`,
    },
    {
      title: 'As a link',
      description:
        'With `href` the element renders a link that looks the same.',
      html: `<zeno-button href="#as-a-link" variant="outline">Go to this heading</zeno-button>`,
    },
    {
      title: 'In a form',
      description:
        'A submit button runs the form’s validation and adds its own name and value to the data. A reset button puts every control back.',
      html: `<form>
  <zeno-input name="email" type="email" label="Email" required></zeno-input>
  <zeno-button type="submit" name="action" value="join">Join</zeno-button>
  <zeno-button type="reset" variant="ghost">Clear</zeno-button>
  <p data-result>Nothing submitted yet.</p>
</form>`,
      script: `const form = document.querySelector('form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const sent = [...new FormData(form)].map(([name, value]) => name + '=' + value);
  document.querySelector('[data-result]').textContent = 'Submitted: ' + sent.join('&');
});`,
    },
  ],

  keyboard: [
    { keys: ['Tab'], action: 'Moves focus to the button.' },
    {
      keys: ['Enter', 'Space'],
      action:
        'Activates the button. On a submit or reset button this acts on the form.',
    },
    { keys: ['Enter'], action: 'Follows the link when `href` is set.' },
  ],

  accessibility: [
    'Renders a native `<button>` in its shadow root, or a native `<a>` when `href` is set, so the role and keyboard behaviour are the browser’s own.',
    'Focus is delegated to the inner control. `aria-label` and the other ARIA attributes set on the element are copied to it.',
    '`loading` disables the inner button and sets `aria-busy="true"`. The spinner is hidden from assistive technology.',
    'A disabled link gets `aria-disabled="true"` and leaves the tab order.',
    'An `icon-only` button has no text, so give it an `aria-label`.',
  ],

  gaps: [
    'The `variant` type also lists `tertiary`, `link` and `glass`. The element has no styles for them, so they render as an unstyled button.',
    'The `xs` size is styled, but the `size` type does not list it, so TypeScript and the framework wrappers reject it.',
    'Nothing announces the change when `loading` starts or ends, beyond `aria-busy`.',
    'An `icon-only` button without an `aria-label` has no accessible name, and the element does not warn about it.',
  ],
};
