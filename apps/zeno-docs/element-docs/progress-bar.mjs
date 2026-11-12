export default {
  category: 'Feedback',

  examples: [
    {
      title: 'Label and value',
      description:
        'The `label` is shown above the bar and names it. `show-value` adds the percentage next to the label.',
      html: `<zeno-progress-bar label="Uploading report.pdf" value="40" show-value></zeno-progress-bar>`,
    },
    {
      title: 'Variants',
      description:
        'The variant only changes the colour, so say what it means in the label.',
      html: `<zeno-progress-bar variant="primary" label="Storage used" value="35" show-value></zeno-progress-bar>
<zeno-progress-bar variant="success" label="Backup complete" value="100" show-value></zeno-progress-bar>
<zeno-progress-bar variant="warning" label="Storage almost full" value="85" show-value></zeno-progress-bar>
<zeno-progress-bar variant="error" label="Upload failed" value="60" show-value></zeno-progress-bar>
<zeno-progress-bar variant="info" label="Syncing contacts" value="50" show-value></zeno-progress-bar>`,
    },
    {
      title: 'Sizes',
      description:
        'The track is 4px, 8px or 12px high. `max` sets the value that counts as full.',
      html: `<zeno-progress-bar size="sm" label="Small" value="3" max="10"></zeno-progress-bar>
<zeno-progress-bar size="md" label="Medium" value="5" max="10"></zeno-progress-bar>
<zeno-progress-bar size="lg" value="7" max="10"></zeno-progress-bar>`,
    },
    {
      title: 'Striped and indeterminate',
      description:
        '`animated` moves the stripes and only works together with `striped`. Use `indeterminate` when the amount of work is not known.',
      html: `<zeno-progress-bar label="Installing update" value="65" striped animated></zeno-progress-bar>
<zeno-progress-bar label="Connecting to the server" indeterminate></zeno-progress-bar>`,
    },
    {
      title: 'Segments and your own value text',
      description:
        '`segments` splits the bar into equal steps. `formatValue` is a function, so set it as a property.',
      html: `<zeno-progress-bar label="Account setup" value="2" max="5" segments="5" show-value></zeno-progress-bar>`,
      script: `document.querySelector('zeno-progress-bar').formatValue = (value, max) =>
  'Step ' + value + ' of ' + max;`,
    },
  ],

  keyboard: [],

  accessibility: [
    'The filled part of the bar has `role="progressbar"` with `aria-valuenow`, `aria-valuemin="0"` and `aria-valuemax` set from `value` and `max`.',
    'The bar is named by the `aria-label` of the element, then by `label`, then by the word “Progress”.',
    'The element is not focusable and adds no keyboard behaviour.',
    'With reduced motion the stripes and the indeterminate bar do not move.',
  ],

  gaps: [
    // zeno-progress-bar.ts:293-312: renderSegmented() returns plain divs; 371 and 381 render it in place of renderBar(), which holds the role.
    'With `segments` there is no `progressbar` role, no value and no name. Assistive technology only gets the visible label text.',
    // zeno-progress-bar.ts:294 returns nothing for one segment, and 371/381 still skip renderBar().
    '`segments="1"` shows an empty track with no bar at all.',
    // zeno-progress-bar.ts:327-331: aria-valuenow is always written, also when indeterminate.
    'An `indeterminate` bar still reports `aria-valuenow`. For unknown progress the attribute should be left out.',
    // zeno-progress-bar.ts:269 clamps the width; 328 writes the raw value.
    '`aria-valuenow` is the raw `value`. A value below 0 or above `max` is reported as it is, while the drawn bar is limited to the track.',
    // zeno-progress-bar.ts:350-367: the value is only rendered inside the external label block; 351-352: the internal label needs size lg.
    '`show-value` without a `label` shows nothing at the `sm` and `md` sizes.',
    // zeno-progress-bar.ts:387-391: label || value.
    'At `size="lg"` the label is drawn inside the track and replaces the value, so `show-value` has no effect when a `label` is set.',
    // zeno-progress-bar.ts:28 (12px track), 47-51 (overflow: hidden), 152-162 (label centred inside the track).
    'At `size="lg"` the text sits inside a 12px track that clips its content. It also keeps one text colour on both the filled and the empty part of the bar.',
    // zeno-progress-bar.ts:263, 275-280: formatValue changes the visible text only; 327-331 has no aria-valuetext.
    'The text from `formatValue` is only visible. The bar has no `aria-valuetext`, so assistive technology still gets the plain number.',
    // zeno-progress-bar.ts:263: @property() without attribute: false; a string from the attribute would be called as a function at 277.
    '`formatValue` is also exposed as an attribute. An attribute gives a string, and the element then fails when it tries to call it.',
    // zeno-progress-bar.ts:331: fixed fallback 'Progress'.
    'The fallback name “Progress” is English only.',
    // zeno-progress-bar.ts:39-40 defines --progress-transition as `all <duration> <easing>`; 80 uses `transition: width var(--progress-transition)`, which is not a valid value.
    'The bar does not animate when `value` changes. The transition value is not valid CSS.',
    // zeno-progress-bar.ts:146-149 and 232-235: the animation is removed and the 30% width stays.
    'With reduced motion an `indeterminate` bar is a still bar at 30%, which looks like real progress.',
    // zeno-progress-bar.ts:344-346: striped, animated and indeterminate are switched off when segments is set; 345: animated needs striped.
    '`striped`, `animated` and `indeterminate` do nothing together with `segments`, and `animated` does nothing without `striped`. The element gives no warning.',
  ],
};
