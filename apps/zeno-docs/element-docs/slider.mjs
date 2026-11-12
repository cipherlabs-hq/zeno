export default {
  category: 'Forms',

  examples: [
    {
      title: 'Basic',
      description:
        '`min`, `max` and `step` set the range. The `input` event fires while the value moves and `change` fires when it is set. Both carry the number in `event.detail.value`.',
      html: `<zeno-slider label="Font size" min="12" max="24" step="2" value="16"></zeno-slider>
<p data-result>Value: 16</p>`,
      script: `document.querySelector('zeno-slider').addEventListener('input', event => {
  document.querySelector('[data-result]').textContent = 'Value: ' + event.detail.value;
});`,
    },
    {
      title: 'Sizes',
      html: `<zeno-slider label="Small" size="sm" value="25"></zeno-slider>
<zeno-slider label="Medium" size="md" value="50"></zeno-slider>
<zeno-slider label="Large" size="lg" value="75"></zeno-slider>`,
    },
    {
      title: 'Marks',
      description:
        '`show-marks` draws a tick at the minimum and at the maximum. The `marks` property takes a list of values, each with an optional `label`. The labels are drawn below the element’s own box, so this example leaves space under each slider.',
      html: `<div style="padding-bottom: 2rem">
  <zeno-slider label="Brightness" value="30" show-marks></zeno-slider>
</div>
<div style="padding-bottom: 2rem">
  <zeno-slider label="Quality" value="50" step="50"></zeno-slider>
</div>`,
      script: `document.querySelectorAll('zeno-slider')[1].marks = [
  { value: 0, label: 'Low' },
  { value: 50, label: 'Medium' },
  { value: 100, label: 'High' },
];`,
    },
    {
      title: 'States',
      description:
        'The `error` text shows below the slider and colours the fill.',
      html: `<zeno-slider label="Disabled" value="60" disabled></zeno-slider>
<zeno-slider label="With an error" value="90" error="Choose 80 or less."></zeno-slider>`,
    },
    {
      title: 'In a form',
      description:
        'A slider always has a value, so it is always sent with the form. With no `value` it sends the minimum.',
      html: `<form>
  <zeno-slider name="volume" label="Volume" value="40"></zeno-slider>
  <zeno-button type="submit">Save</zeno-button>
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
    { keys: ['Tab'], action: 'Moves focus to the slider.' },
    {
      keys: ['ArrowRight', 'ArrowUp'],
      action: 'Raises the value by one `step`.',
    },
    {
      keys: ['ArrowLeft', 'ArrowDown'],
      action: 'Lowers the value by one `step`.',
    },
    {
      keys: ['Home', 'End'],
      action: 'Sets the value to the minimum or the maximum.',
    },
    {
      keys: ['PageUp', 'PageDown'],
      action:
        'Raises or lowers the value by a larger amount. The browser sets the amount.',
    },
  ],

  accessibility: [
    'The control is a native `<input type="range">`. It lies over the drawn track and is transparent, so pointer and keyboard input go to the native input. All keys in the table come from it.',
    'The drawn thumb has `role="presentation"`. The track, fill and marks are plain elements with no role.',
    'The `label` attribute renders a `<label>` for the input. Without it, the name comes from an outside `<label for>` or from `aria-label` on the element.',
    'The input has `aria-valuetext` with the value as text. Set the `formatValue` property to a function to read the value with a unit.',
    'When the slider is invalid, the input has `aria-invalid="true"` and `aria-describedby` points at the error text.',
  ],

  gaps: [
    // form-field.ts:138 declares readonly. zeno-slider.ts:424-444: the input
    // gets disabled and required, never readonly, and handleInput (335-340)
    // does not check it.
    'The `readonly` attribute does nothing. A read-only slider can still be moved.',
    // zeno-slider.ts:296-310: numericValue and percentage do not clamp.
    // 321-323: formSubmitValue() returns numericValue as it is.
    'A `value` outside `min` and `max` is not clamped. The element submits the value as it is. The native input inside it is limited to the range, so the two do not agree.',
  ],
};
