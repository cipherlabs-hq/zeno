export default {
  category: 'Overlays',

  examples: [
    {
      title: 'Basic',
      description:
        'Wrap one element and set the text with `content`. The tooltip shows when the pointer rests on the element or when the element gets keyboard focus. These examples wrap a native `<button>`.',
      html: `<zeno-tooltip content="Copy the link to this page">
  <button type="button">Copy link</button>
</zeno-tooltip>`,
    },
    {
      title: 'Placement',
      description:
        '`placement` is the side you prefer. The tooltip moves to the opposite side when there is no room.',
      html: `<zeno-tooltip content="Shown above" placement="top">
  <button type="button">Top</button>
</zeno-tooltip>
<zeno-tooltip content="Shown on the right" placement="right">
  <button type="button">Right</button>
</zeno-tooltip>
<zeno-tooltip content="Shown below" placement="bottom">
  <button type="button">Bottom</button>
</zeno-tooltip>
<zeno-tooltip content="Shown on the left" placement="left">
  <button type="button">Left</button>
</zeno-tooltip>`,
    },
    {
      title: 'Delay',
      description:
        '`delay` is the time in milliseconds before the tooltip shows for the pointer. The default is 200. Keyboard focus shows it at once.',
      html: `<zeno-tooltip content="Shown at once" delay="0">
  <button type="button">No delay</button>
</zeno-tooltip>
<zeno-tooltip content="Shown after one second" delay="1000">
  <button type="button">Long delay</button>
</zeno-tooltip>`,
    },
    {
      title: 'Disabled',
      description:
        'A disabled tooltip does not show. The wrapped element still works.',
      html: `<zeno-tooltip content="This text does not show" disabled>
  <button type="button">No tooltip</button>
</zeno-tooltip>`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the wrapped element. The tooltip shows at once, and hides when focus leaves.',
    },
    {
      keys: ['Escape'],
      action:
        'Hides the open tooltip. The key press is not stopped, so other listeners on the page also get it.',
    },
  ],

  accessibility: [
    'The text is set as `aria-description` on the first wrapped element. The text itself is used because an `id` reference cannot cross the shadow root.',
    'The bubble has `aria-hidden="true"`, so the text is read once, as the description.',
    'The tooltip shows for keyboard focus only when the wrapped element matches `:focus-visible`. A mouse click does not leave a tooltip open.',
    'The pointer can move from the element onto the bubble, and the bubble stays open. Escape, scrolling, and moving the pointer or focus away close it.',
    'In forced colours mode the bubble gets a border.',
  ],

  gaps: [
    // zeno-tooltip.ts:99-103: the focusin target must match :focus-visible.
    // For a Zeno control with delegated focus the target is the host, which
    // does not match. Checked in Chromium with the built bundle: Tab to a
    // <zeno-button> inside <zeno-tooltip> opens nothing.
    'Around `<zeno-button>` and other Zeno controls that pass focus to an inner control, the tooltip does not show for keyboard focus. It shows for the pointer only.',
    // zeno-tooltip.ts:153-166: aria-description is set on the slotted
    // element. zeno-element.ts:155-165: a Zeno control forwards only
    // aria-label, aria-disabled and data-testid to its inner control.
    'Around a Zeno control, `aria-description` is set on the host element. It does not reach the inner native control, which is the element that has focus.',
    // zeno-tooltip.ts:144-147: the anchor is the first assigned element.
    // 154 and 160: with no element there is no description.
    'Only the first wrapped element gets the description and is used for the position. Plain text with no element around it gets no description.',
    // types.ts:196: TooltipPlacement lists four sides. zeno-tooltip.ts:202-230
    // also reads a -start or -end suffix, for top and bottom only.
    'The `placement` type lists `top`, `right`, `bottom` and `left`. The code also reads `top-start`, `top-end`, `bottom-start` and `bottom-end`, which the type does not list. A suffix on `left` or `right` is ignored.',
    // zeno-tooltip.ts:172: position() runs once in reveal(). 127-133:
    // updated() does not call it, and there is no resize listener.
    'The position is set once, when the tooltip opens. It is not set again when `content` or `placement` change or when the window is resized while the tooltip is open.',
    // zeno-tooltip.ts:138-140: the bubble renders this.content only.
    'The text can only come from the `content` attribute. There is no slot for the bubble, so it cannot hold markup.',
  ],
};
