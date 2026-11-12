export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        'The label comes from the `label` attribute. The `change` event carries the new state in `event.detail.checked`.',
      html: `<zeno-switch label="Email notifications" checked></zeno-switch>
<p data-result>Notifications are on.</p>`,
      script: `document.querySelector('zeno-switch').addEventListener('change', event => {
  document.querySelector('[data-result]').textContent =
    'Notifications are ' + (event.detail.checked ? 'on' : 'off') + '.';
});`,
    },
    {
      title: 'Sizes',
      html: `<zeno-switch size="sm" label="Small"></zeno-switch>
<zeno-switch size="md" label="Medium"></zeno-switch>
<zeno-switch size="lg" label="Large"></zeno-switch>`,
    },
    {
      title: 'Label position and icon',
      description:
        '`label-position="start"` puts the label before the switch. `show-icon` draws a check mark in the thumb.',
      html: `<zeno-switch label="Label at the start" label-position="start"></zeno-switch>
<zeno-switch label="With a check icon" show-icon checked></zeno-switch>`,
    },
    {
      title: 'States',
      description:
        'A loading switch shows a spinner in the thumb and cannot be changed.',
      html: `<zeno-switch label="Disabled" disabled></zeno-switch>
<zeno-switch label="Disabled and on" disabled checked></zeno-switch>
<zeno-switch label="Loading" loading></zeno-switch>
<zeno-switch label="With an error" error="Turn this on to continue."></zeno-switch>`,
    },
    {
      title: 'In a form',
      description:
        'A switch is sent with the form only when it is on. The value it sends is `on` unless you set `value`.',
      html: `<form>
  <zeno-switch name="updates" label="Send me product updates" checked></zeno-switch>
  <zeno-switch name="terms" value="accepted" label="I accept the terms" required></zeno-switch>
  <zeno-button type="submit">Create account</zeno-button>
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
    { keys: ['Tab'], action: 'Moves focus to the switch.' },
    { keys: ['Space'], action: 'Turns the switch on or off.' },
  ],

  accessibility: [
    'The control is a native `<input type="checkbox">` with `role="switch"`. The Space key and the on or off state come from it.',
    'The input and the `label` text are inside one `<label>`, so the text names the switch and a click on the text toggles it. Without `label`, the name comes from an outside `<label for>` or from `aria-label` on the element. A click on an outside label also toggles the switch.',
    'A required switch shows `*` after the label. The mark is hidden from assistive technology, and the native `required` attribute is set on the input.',
    'When the switch is invalid, the input has `aria-invalid="true"` and `aria-describedby` points at the error text.',
  ],

  gaps: [
    // form-field.ts:138 declares readonly. zeno-switch.ts:371-386: the input
    // never reads it, and handleChange (337-343) does not check it.
    'The `readonly` attribute does nothing. A read-only switch can still be turned on and off.',
    // zeno-switch.ts:377: ?disabled=${this.isDisabled || this.loading}; no
    // aria-busy anywhere in render (369-430).
    'While `loading`, the inner input gets the native `disabled` attribute. The switch leaves the tab order and reads as unavailable, and it has no `aria-busy`.',
    // zeno-switch.ts:415-430: the label is rendered from the label property
    // only; the template has no <slot>.
    'The label can only be plain text from the `label` attribute. There is no slot, so the label cannot hold a link or other markup.',
  ],
};
