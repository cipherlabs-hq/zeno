export default {
  category: 'Data display',

  examples: [
    {
      title: 'Basic, with sorting',
      description:
        'Set `columns` and `data` as properties. Each row needs an `id`. A column sorts on click when it has `sortable: true`. A `formatter` changes the text of a cell; sorting still uses the raw value.',
      html: `<zeno-data-table></zeno-data-table>`,
      script: `const table = document.querySelector('zeno-data-table');
table.columns = [
  { key: 'name', label: 'File', sortable: true },
  { key: 'owner', label: 'Owner', sortable: true },
  { key: 'size', label: 'Size', sortable: true, align: 'right', formatter: value => value + ' KB' },
];
table.data = [
  { id: 'f1', name: 'report.pdf', owner: 'Ada', size: 482 },
  { id: 'f2', name: 'notes.txt', owner: 'Grace', size: 3 },
  { id: 'f3', name: 'budget.csv', owner: 'Alan', size: 57 },
  { id: 'f4', name: 'plan.docx', owner: 'Ada', size: 120 },
];`,
    },
    {
      title: 'Selectable rows',
      description:
        '`selectable` adds a checkbox to each row and one to the header. `row-select` and `select-all` carry the ids of the selected rows. `striped` shades every second row.',
      html: `<zeno-data-table selectable striped></zeno-data-table>
<p data-result>No rows selected.</p>`,
      script: `const table = document.querySelector('zeno-data-table');
const result = document.querySelector('[data-result]');
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
];
table.data = [
  { id: 'ada', name: 'Ada', email: 'ada@example.com', role: 'Owner' },
  { id: 'grace', name: 'Grace', email: 'grace@example.com', role: 'Editor' },
  { id: 'alan', name: 'Alan', email: 'alan@example.com', role: 'Viewer' },
];
const show = event => {
  const ids = event.detail.selectedRows;
  result.textContent = ids.length ? 'Selected: ' + ids.join(', ') : 'No rows selected.';
};
table.addEventListener('row-select', show);
table.addEventListener('select-all', show);`,
    },
    {
      title: 'Sizes',
      description:
        '`size` changes the padding and the text size. The default is `md`.',
      html: `<zeno-data-table size="sm"></zeno-data-table>
<zeno-data-table size="lg"></zeno-data-table>`,
      script: `document.querySelectorAll('zeno-data-table').forEach(table => {
  table.columns = [
    { key: 'task', label: 'Task' },
    { key: 'status', label: 'Status' },
  ];
  table.data = [
    { id: 't1', task: 'Write the summary', status: 'Done' },
    { id: 't2', task: 'Check the numbers', status: 'In progress' },
  ];
});`,
    },
    {
      title: 'Loading and empty',
      description:
        '`loading` fades the table and shows a spinner. The wrapper with `position: relative` keeps the spinner over the table; see the gaps below. A table with no rows shows `emptyMessage`.',
      html: `<div style="position: relative">
  <zeno-data-table loading></zeno-data-table>
</div>
<zeno-data-table></zeno-data-table>`,
      script: `const tables = document.querySelectorAll('zeno-data-table');
const columns = [
  { key: 'name', label: 'File' },
  { key: 'changed', label: 'Last changed' },
];
tables[0].columns = columns;
tables[0].data = [
  { id: 'f1', name: 'report.pdf', changed: 'Today' },
  { id: 'f2', name: 'notes.txt', changed: 'Yesterday' },
];
tables[1].columns = columns;
tables[1].data = [];
tables[1].emptyMessage = 'No files yet.';`,
    },
    {
      title: 'Pages',
      description:
        '`show-pagination` splits the rows into pages of `page-size` rows and shows a `zeno-pagination` under the table.',
      html: `<zeno-data-table show-pagination page-size="5"></zeno-data-table>`,
      script: `const table = document.querySelector('zeno-data-table');
table.columns = [
  { key: 'number', label: 'Invoice', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
];
table.data = Array.from({ length: 12 }, (unused, index) => ({
  id: 'invoice-' + (index + 1),
  number: 'Invoice ' + (index + 1),
  amount: 100 + index * 25,
}));`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves focus through the column headers, the row checkboxes of a `selectable` table and the page buttons.',
    },
    {
      keys: ['Space'],
      action: 'On a row checkbox, selects or deselects the row.',
    },
  ],

  accessibility: [
    'Renders a native `<table>` with `<thead>`, `<tbody>`, `<th>` and `<td>`.',
    'Row selection uses `zeno-checkbox`. The header checkbox is named “Select all rows” and shows a mixed state when only some rows of the page are selected.',
    'The sorted column header gets `aria-sort`.',
    'While `loading` is set, the `zeno-spinner` over the table is a polite live region named “Loading”.',
    'On screens up to 768px wide, a `responsive` table hides the header row and shows each row as a block. The column label is printed before each value by CSS.',
  ],

  gaps: [
    // zeno-data-table.ts:565-572: the <th> has @click and tabindex="0" but no keydown handler.
    'Sorting does not work with the keyboard. A sortable header can take focus, but Enter and Space do nothing, because the header only listens for clicks.',
    // zeno-data-table.ts:570: role="button" on the <th>.
    'A sortable header has `role="button"` on the `<th>`. That replaces the column header role of the cell, and `aria-sort` is not allowed on a button.',
    // zeno-data-table.ts:571, types.ts:78: aria-sort gets 'asc' or 'desc'.
    '`aria-sort` is set to `asc` or `desc`. The valid values are `ascending` and `descending`.',
    // zeno-data-table.ts:553 against 404: the header checks `col.sortable !== false`, handleSort checks `!column.sortable`.
    'A column without `sortable` looks sortable and does nothing. The header gets the sort icon, the pointer cursor and a tab stop unless `sortable` is `false`, but a click sorts only when `sortable` is `true`.',
    // zeno-data-table.ts:345-346, 349: Boolean properties that default to true.
    '`hoverable`, `responsive` and `sortable` are on by default, and a Boolean attribute cannot be set to false in HTML. They can only be turned off from JavaScript, for example `table.sortable = false`.',
    // zeno-data-table.ts:609, 616 and 178-181: every row has the clickable class and a click handler only.
    'Every row shows a pointer cursor and fires `row-click`, but rows cannot take focus. A row action is not possible with the keyboard.',
    // zeno-data-table.ts:529: <table> has no <caption>, aria-label or aria-labelledby.
    'The table has no accessible name. There is no caption and no label attribute or slot for one.',
    // zeno-data-table.ts:629: the same literal for every row.
    'Every row checkbox has the same name, “Select row”. A screen reader user cannot tell which row a checkbox belongs to.',
    // zeno-data-table.ts:543, 629, 352: literals.
    'The texts “Select all rows”, “Select row” and “No data available” are English. Only the last one can be changed, with `emptyMessage`.',
    // zeno-data-table.ts:359: `@state() private selectedRows`.
    'The selection can only be read from the detail of `row-select` and `select-all`. There is no property to read it, set it or clear it.',
    // zeno-data-table.ts:448-458: the handler loops over paginatedData.
    'With pages, the header checkbox selects only the rows of the page that shows.',
    // zeno-data-table.ts:359-360: no code resets selectedRows or currentPage when `data` changes.
    'The selection and the page number are kept when `data` changes. Ids of rows that are gone stay in `selectedRows`. When the new list is shorter, the table can stay on a page that no longer exists: it shows `emptyMessage`, and with only one page left there are no page buttons to go back.',
    // zeno-data-table.ts:425, 450, 518, 600: `row.id || this.data.indexOf(row)`.
    'A row with no `id`, or with the id `0` or an empty string, is tracked by its position in `data`. Its selection moves to another row when the order of `data` changes.',
    // types.ts:69: formatter returns a string; zeno-data-table.ts:647-653: the cell has no slot.
    'A cell holds text only. A `formatter` returns a string and there is no slot for a cell, so a cell cannot hold a link, a button or a badge.',
    // types.ts:67: `width` is declared; zeno-data-table.ts never reads it.
    'A column can declare `width`, but the table never uses it.',
    // zeno-data-table.ts:249-255 against 58-65: `.table__loading` is `position: absolute`, but the wrapper and the host are not positioned.
    'The loading spinner is not kept inside the table. It is centred in the nearest positioned ancestor, which can be the whole page. Until this is fixed, put the table in an element with `position: relative`.',
    // zeno-data-table.ts:227-230, 665-673: `pointer-events: none` and a spinner; nothing for the keyboard or assistive technology.
    '`loading` blocks the mouse only. It does not set `aria-busy` on the table, and the headers and checkboxes under the spinner can still be reached with Tab and used.',
    // zeno-data-table.ts:357-358, 403-411: sort state is private; a click only switches between asc and desc.
    'There is no property for the first sort, and no way to go back to the unsorted order once a column is sorted.',
    // zeno-data-table.ts:352: no `attribute` option, so Lit lower-cases the property name.
    'The attribute for `emptyMessage` is `emptymessage`, with no hyphen, while `page-size` and `show-pagination` on the same element have one.',
  ],
};
