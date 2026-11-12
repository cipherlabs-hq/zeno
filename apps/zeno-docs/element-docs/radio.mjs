export default {
  category: 'Forms',

  examples: [
    {
      title: 'Radios that share a name',
      description:
        'Radios with the same `name` uncheck each other. For a set with a legend, arrow keys and one error, put the radios in a `zeno-radio-group`.',
      html: `<zeno-radio name="delivery" value="standard" label="Standard delivery" checked></zeno-radio>
<zeno-radio name="delivery" value="express" label="Express delivery"></zeno-radio>
<zeno-radio name="delivery" value="pickup" label="Pick up in store"></zeno-radio>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-radio name="size" size="sm" label="Small" checked></zeno-radio>
<zeno-radio name="size" size="md" label="Medium"></zeno-radio>
<zeno-radio name="size" size="lg" label="Large"></zeno-radio>`,
    },
    {
      title: 'States',
      description:
        '`loading` shows a spinner in the circle and disables the radio. An `error` marks the radio invalid and shows the text under it.',
      html: `<zeno-radio label="Disabled" disabled></zeno-radio>
<zeno-radio label="Disabled and checked" disabled checked></zeno-radio>
<zeno-radio label="Loading" loading></zeno-radio>
<zeno-radio label="With an error" error="This option is no longer available."></zeno-radio>`,
    },
    {
      title: 'In a form',
      description:
        'Only the checked radio is sent, under `name`. A reset brings back the radio that was checked at the start.',
      html: `<form>
  <zeno-radio name="contact" value="email" label="Email" checked></zeno-radio>
  <zeno-radio name="contact" value="phone" label="Phone"></zeno-radio>
  <zeno-radio name="contact" value="post" label="Post"></zeno-radio>
  <zeno-button type="submit">Save changes</zeno-button>
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
    {
      keys: ['Tab'],
      action:
        'Moves focus to the radio. Outside a `zeno-radio-group` every radio is a Tab stop.',
    },
    { keys: ['Space'], action: 'Checks the focused radio.' },
  ],

  accessibility: [
    'Renders a native `<input type="radio">` in its shadow root, inside a `<label>` that holds the `label` text. A click on the text checks the radio.',
    'Without `label`, the name comes from `aria-label` on the element or from an outside `<label for>`.',
    'The input always carries `aria-invalid`. When an error shows, `aria-describedby` points at the error text.',
    'The native input is invisible but still focusable. The focus ring is drawn on the circle.',
    'The required star is hidden from assistive technology.',
  ],

  gaps: [
    // zeno-radio.ts:358-362: each native input is in its own shadow root, so the browser does not group them; 239: tabbable defaults to true; the file has no keydown handler.
    'Outside a `zeno-radio-group`, radios with one `name` are not a keyboard group. Every radio is a Tab stop and the arrow keys do not move between them. Assistive technology does not announce “1 of 3”.',
    // zeno-radio.ts:356-408: the template has no <slot>.
    'There is no slot. The label is plain text from `label`, and content placed inside the element is not shown.',
    // mixins/form-field.ts:138 declares readonly; zeno-radio.ts:343-409 never reads it.
    '`readonly` is declared but does nothing. A read-only radio can still be changed.',
    // zeno-radio.ts:387-407: each radio renders its own star and its own error; mixins/form-field.ts:166-169 marks every invalid radio as touched on a refused submit.
    'Outside a group, `required` works for each radio alone. Every required radio shows its own star, and after a refused submit every one of them shows the same error text.',
    // zeno-radio.ts:407: renderFieldError() is skipped inside a group.
    'Inside a `zeno-radio-group` the `error` of a single radio is not shown.',
    // zeno-radio.ts:364 disables the input while loading; 377-382 renders zeno-spinner, which is a status region named 'Loading'.
    '`loading` disables the inner input, so the radio cannot take focus while it loads. The spinner is announced as “Loading”, in English, and the input has no `aria-busy`.',
    // zeno-radio.ts:304-306: fixed string.
    'The required message “Please select one of these options.” is English only. An `error` text replaces it.',
    // mixins/form-field.ts:305-310: the error div has no role="alert" or aria-live.
    'The error text is not a live region. An error that appears while the user is elsewhere is not announced.',
    // zeno-radio.ts:163-166: margin-left on .radio__required.
    'The gap before the required star uses `margin-left`, so it is on the wrong side in a right-to-left page.',
  ],
};
