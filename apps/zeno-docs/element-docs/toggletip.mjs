export default {
  category: 'Overlays',

  examples: [
    {
      title: 'Basic',
      description:
        'A button with an information icon. A click, a tap, Enter or Space opens the note; it can hold links. Use it where a tooltip would hide text from touch screens.',
      html: `<p>Not enough data
  <zeno-toggletip label="Why there is no score">
    <p>A score needs at least two inspections in the last three years. <a href="/methodology">How scores work</a></p>
  </zeno-toggletip>
</p>`,
    },
    {
      title: 'Own icon',
      description:
        'Put an icon in the `icon` slot to replace the information icon.',
      html: `<zeno-toggletip label="Help">
  <zeno-icon slot="icon" name="help-circle"></zeno-icon>
  <p>Press Enter to search.</p>
</zeno-toggletip>`,
    },
  ],

  keyboard: [
    {
      keys: ['Enter', 'Space'],
      action: 'Opens or closes the note, on the button.',
    },
    {
      keys: ['Tab'],
      action:
        'Moves from the button into the note, so links in it can be used.',
    },
    {
      keys: ['Escape'],
      action: 'Closes the note and puts focus back on the button.',
    },
  ],

  accessibility: [
    'The button is a native button named by `label`, with `aria-expanded` and `aria-controls` pointing at the note.',
    'When the note opens, a polite live region reads its text, so a screen reader user hears it without moving.',
    'The note follows the button in the focus order. A press outside, Escape, or focus leaving the element closes it.',
    'The note sits in the top layer as a popover, so a parent with `overflow: hidden` does not clip it.',
    'The note uses the page surface colours, so links in it keep their contrast.',
  ],

  gaps: [
    // zeno-toggletip.ts: AnchoredPopover places below, or above when there is no room.
    'The note opens below the button, or above it when there is no room below. There is no `placement` attribute.',
    // zeno-toggletip.ts: the live region reads textContent.
    'The live region reads the text of the note only. Links in it are not announced as links until focus reaches them.',
  ],
};
