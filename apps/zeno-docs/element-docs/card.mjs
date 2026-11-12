export default {
  category: 'Layout',

  examples: [
    {
      title: 'Basic',
      description:
        '`title` and `subtitle` make the header. Everything inside the element is the body.',
      html: `<zeno-card title="Annual report" subtitle="Updated on 9 March">
  The report has 24 pages and three attachments.
</zeno-card>`,
    },
    {
      title: 'Elevation and outline',
      description:
        '`elevation` goes from 0 to 4 and sets the shadow. `outlined` replaces the shadow with a border.',
      html: `<zeno-card elevation="0">Elevation 0</zeno-card>
<zeno-card elevation="1">Elevation 1</zeno-card>
<zeno-card elevation="2">Elevation 2</zeno-card>
<zeno-card elevation="3">Elevation 3</zeno-card>
<zeno-card elevation="4">Elevation 4</zeno-card>
<zeno-card outlined>Outlined</zeno-card>`,
    },
    {
      title: 'Clickable and selected',
      description:
        'A `clickable` card can take focus and fires a click on Enter or Space. The card does not change `selected` itself, so the page does it.',
      html: `<zeno-card clickable outlined title="Monthly plan">Billed every month.</zeno-card>
<zeno-card clickable outlined selected title="Yearly plan">Billed once a year.</zeno-card>`,
      script: `const cards = document.querySelectorAll('zeno-card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    cards.forEach(other => {
      other.selected = other === card;
    });
  });
});`,
    },
    {
      title: 'Compact, loading and disabled',
      description:
        '`compact` uses less padding. `loading` covers the card with a spinner. `disabled` dims it and stops clicks.',
      html: `<zeno-card compact outlined title="Compact">Less space around the content.</zeno-card>
<zeno-card loading outlined title="Loading">The content is on its way.</zeno-card>
<zeno-card disabled clickable outlined title="Disabled">This card cannot be used.</zeno-card>`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus to the card, when it is `clickable` or has an `href`.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Fires a click on a card that is `clickable`, unless it is `disabled` or `loading`. Keys pressed in a control inside the card are left to that control.',
    },
  ],

  accessibility: [
    'The card renders an `<article>`. Its name is the `aria-label` you set, or the `title`.',
    'With `clickable` or `href` the role changes to `button` and the card joins the tab order.',
    'A `clickable` card has `aria-pressed`, which follows `selected`.',
    '`disabled` sets `aria-disabled="true"`.',
    'The `title` text is rendered as an `<h3>`.',
  ],

  gaps: [
    // zeno-card.ts:347-357, 359-391, 397-408 with 269-288 and 433-438: each named slot is rendered only after its own slotchange or hasSlot() finds it.
    'The `cover`, `header` and `footer` slots do not work. Each slot is rendered only when the card already knows it has content, and the card can only learn that from the slot itself. Content given to these slots never shows.',
    // zeno-card.ts:294: handleClick returns unless `clickable` or `interactive` is set.
    '`href` alone does nothing. The card becomes a button in the tab order, but a click or Enter does not open the address unless `clickable` or `interactive` is also set.',
    // zeno-card.ts:297-304, 329: role="button", then a temporary <a> is clicked from script.
    'A card with `href` is announced as a button, not a link. It opens the address from script, so “open in new tab”, the status bar address and the link context menu are missing.',
    // zeno-card.ts:77-83, 329-330: only a pointer cursor and hover styles; role stays article, tabindex -1.
    '`interactive` alone is for the mouse only. The card looks clickable but stays out of the tab order.',
    // zeno-card.ts:330: tabindex="-1" on every card that is not clickable.
    'A card that is not clickable still has `tabindex="-1"`, so a mouse click moves focus to it.',
    // zeno-card.ts:332: aria-pressed is set whenever `clickable` is.
    'Every clickable card is announced as a toggle button, pressed or not pressed, also when it only opens something.',
    // zeno-card.ts:331, 333: aria-disabled only; tabindex stays 0.
    'A disabled clickable card stays in the tab order.',
    // zeno-card.ts:338-345: the overlay holds a spinner; no aria-busy on the article.
    '`loading` does not set `aria-busy`. The content under the overlay can still be read and reached with the keyboard.',
    // zeno-card.ts:374: fixed <h3>.
    'The title is always an `<h3>`. The level cannot be changed to fit the page outline.',
    // zeno-card.ts:256: the property is named `title`, which is also the global HTML attribute.
    'The header text uses the `title` attribute, which is also the native tooltip. Hovering the card shows the same text again as a tooltip.',
  ],
};
