export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        'The text comes from `label`. `indeterminate` shows a dash for a group that is partly selected. It is cleared when the user makes a choice.',
      html: `<zeno-checkbox label="Send me a weekly summary"></zeno-checkbox>
<zeno-checkbox label="Remember this device" checked></zeno-checkbox>
<zeno-checkbox label="Select all files" indeterminate></zeno-checkbox>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-checkbox size="sm" label="Small"></zeno-checkbox>
<zeno-checkbox size="md" label="Medium"></zeno-checkbox>
<zeno-checkbox size="lg" label="Large"></zeno-checkbox>`,
    },
    {
      title: 'Disabled, loading and error',
      description:
        '`loading` shows a spinner in the box and stops changes. `error` marks the checkbox as invalid and shows the text under it.',
      html: `<zeno-checkbox label="Disabled" disabled></zeno-checkbox>
<zeno-checkbox label="Disabled and checked" disabled checked></zeno-checkbox>
<zeno-checkbox label="Saving your choice" loading></zeno-checkbox>
<zeno-checkbox label="I accept the terms" error="Accept the terms to continue."></zeno-checkbox>`,
    },
    {
      title: 'Events',
      description:
        'A change by the user fires `input` and then `change`. Both carry `checked`, `value` and `indeterminate` in `event.detail`.',
      html: `<zeno-checkbox label="Share usage data" value="usage"></zeno-checkbox>
<p data-result>Not changed yet.</p>`,
      script: `document.querySelector('zeno-checkbox').addEventListener('change', event => {
  document.querySelector('[data-result]').textContent =
    'checked: ' + event.detail.checked + ', value: ' + event.detail.value;
});`,
    },
    {
      title: 'In a form',
      description:
        'A checked box sends its `name` with its `value`, or with “on” when no value is set. An unchecked box sends nothing. A `required` box must be checked before the form submits.',
      html: `<form>
  <zeno-checkbox name="terms" label="I accept the terms" required></zeno-checkbox>
  <zeno-checkbox name="updates" value="weekly" label="Send me a weekly summary" checked></zeno-checkbox>
  <zeno-button type="submit">Create account</zeno-button>
  <zeno-button type="reset" variant="ghost">Reset</zeno-button>
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
    { keys: ['Tab'], action: 'Moves focus to the checkbox.' },
    { keys: ['Space'], action: 'Checks or unchecks it.' },
  ],

  accessibility: [
    'Renders a native `<input type="checkbox">` in its shadow root, hidden visually but still the control that takes focus and keys. The role, the checked state and the mixed state of `indeterminate` are the browser’s own.',
    'The native input sits inside a `<label>` with the `label` text, so the text names it and a click on the text toggles it.',
    'A `<label for>` outside the element also works: its text becomes the `aria-label` of the input and a click on it toggles the checkbox. An `aria-label` on the element wins over it.',
    'The input always has `aria-invalid`, `"true"` or `"false"`. While the error text shows, `aria-describedby` points at it.',
    '`required` is set on the native input. The asterisk after the label is hidden from assistive technology. When a required box is left unchecked, the error text is the browser’s own message for a checkbox, unless `error` is set.',
  ],

  gaps: [
    // zeno-checkbox.ts:391-409: the label is the `label` string; the element has no slot.
    'The label is text only. There is no slot, so the label cannot hold a link, for example to the terms the user accepts.',
    // mixins/form-field.ts:138 declares `readonly`; zeno-checkbox.ts never reads it.
    '`readonly` is accepted but does nothing. The checkbox can still be changed.',
    // zeno-checkbox.ts:364: `?disabled=${this.isDisabled || this.loading}`.
    'A `loading` checkbox is a disabled native input. It leaves the tab order, and assistive technology announces it as unavailable, the same as `disabled`.',
    // mixins/form-field.ts:305-310: the error <div> has no role and no aria-live.
    'The error text is not a live region. A screen reader reads it when focus is on the checkbox, but does not announce it when it appears.',
  ],
};
