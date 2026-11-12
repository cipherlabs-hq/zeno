export default {
  category: 'Navigation',

  examples: [
    {
      title: 'Basic pagination',
      description:
        '`total` is the number of items, not pages. With the default `page-size` of 10, 120 items give 12 pages. The element fires `change` when the page changes.',
      html: `<zeno-pagination total="120" current="3"></zeno-pagination>
<p data-result>Page 3 is shown.</p>`,
      script: `document.querySelector('zeno-pagination').addEventListener('change', event => {
  document.querySelector('[data-result]').textContent = 'Page ' + event.detail.current + ' is shown.';
});`,
    },
    {
      title: 'More pages around the current one',
      description:
        '`sibling-count` is the number of page buttons on each side of the current page. The default is 1.',
      html: `<zeno-pagination total="500" current="12" sibling-count="1"></zeno-pagination>
<zeno-pagination total="500" current="12" sibling-count="2"></zeno-pagination>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-pagination total="50" size="sm"></zeno-pagination>
<zeno-pagination total="50" size="md"></zeno-pagination>
<zeno-pagination total="50" size="lg"></zeno-pagination>`,
    },
    {
      title: 'Simple and compact',
      description:
        '`simple` hides the page buttons and keeps Previous and Next. `compact` hides the words “Previous” and “Next” and keeps the arrows.',
      html: `<zeno-pagination total="80" current="2" simple show-total></zeno-pagination>
<zeno-pagination total="80" current="2" compact></zeno-pagination>`,
    },
    {
      title: 'Total, page size and jump to a page',
      description:
        '`show-total` shows the range of items. `show-size-changer` adds a page size list and fires `size-change`. `show-jumper` adds a field: type a page number and press Enter.',
      html: `<zeno-pagination total="240" show-total show-size-changer show-jumper></zeno-pagination>
<p data-result>10 items on each page.</p>`,
      script: `document.querySelector('zeno-pagination').addEventListener('size-change', event => {
  document.querySelector('[data-result]').textContent =
    event.detail.pageSize + ' items on each page.';
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus through the previous button, the page buttons, the next button, the page size list and the jump field.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'On a button, goes to that page.',
    },
    {
      keys: ['Enter'],
      action:
        'In the jump field, goes to the typed page. A number outside the range goes to the first or last page.',
    },
    {
      keys: ['ArrowUp', 'ArrowDown'],
      action:
        'In the page size list, change the page size, as in any native `<select>`.',
    },
  ],

  accessibility: [
    'Renders a `<nav>` landmark. It is named by the `aria-label` of the element, or “Pagination navigation” when there is none.',
    'Every control is a native `<button>`, `<select>` or `<input>`, and the page buttons are in a list.',
    'The button of the current page has `aria-current="page"`. Each page button is named “Go to page” and its number.',
    'The previous and next buttons are named “Go to previous page” and “Go to next page”, and are disabled on the first and last page.',
    'With reduced motion the buttons have no transition. The element is hidden when the page is printed.',
  ],

  gaps: [
    // zeno-pagination.ts:385, 408, 426, 430, 461, 479, 482, 494, 503, 516, 525: fixed strings in the template.
    'All text is English only and has no property: “Previous”, “Next”, “Go to page”, “of”, “/ page”, “Go to”, “Items per page” and “Page number to go to”. Only the name of the landmark can be replaced, with `aria-label`.',
    // zeno-pagination.ts:309-321: goToPage only updates `current` and emits the event; the file has no aria-live region.
    'Nothing announces the new page after a change. The page that uses the element has to do that.',
    // zeno-pagination.ts:309-311 clamps only inside goToPage; 392-394 compares the raw value.
    'A `current` set from outside is not checked. With a value past the last page no button is marked as current and the next button stays enabled.',
    // zeno-pagination.ts:382-386 and 392-394 with total = 0: start is 1, end is 0, totalPages is 0.
    'An empty list is not handled. With `total="0"` and `show-total` the text is “1-0 of 0”, and the next button stays enabled.',
    // zeno-pagination.ts:369-377: Number('') is 0, which is not NaN, so goToPage(0) goes to page 1.
    'Enter in an empty jump field goes to page 1.',
    // zeno-pagination.ts:348-355: sets pageSize and current, emits only size-change.
    'A new page size can also change `current`, but only `size-change` fires. A page that listens only to `change` misses it.',
    // zeno-pagination.ts:497-505: an option is selected only when it equals pageSize.
    'When `page-size` is not one of `page-sizes`, the page size list shows its first option, which is not the size in use.',
    // zeno-pagination.ts:490-494: classes pagination__size-changer and pagination__select; no rule for them in the styles (30-228).
    'The page size list has no styles. It looks like a plain browser `<select>` and does not follow `size`.',
    // zeno-pagination.ts:149-151: simple hides the list; nothing else shows the current page.
    'In `simple` mode nothing shows the current page unless `show-total` is also set.',
    // zeno-pagination.ts:441-445: a span with the text '...' and no aria-hidden or label.
    'The gap between page numbers is three plain dots. It is not hidden from assistive technology and has no name.',
    // zeno-pagination.ts:178-180: the jumper input is always 32px high; 54-67 sizes apply to buttons only.
    'The jump field does not follow `size`. It is always 32px high.',
    // zeno-pagination.ts:191-195: outline: none with a border colour and box-shadow in its place.
    'The jump field removes its focus outline and shows a border colour and a shadow instead. A shadow is not drawn in forced colours mode.',
    // zeno-pagination.ts:429, 483: size="20"; zeno-icon.ts:33-51 styles xs to xl only.
    'The element gives its arrow icons the size `20`, which `zeno-icon` does not have, so they render at the default size.',
  ],
};
