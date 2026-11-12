# Examples

One small app per way of using Zeno. Each renders the same sign-up form: a
text field, a select, a checkbox, three buttons and a modal.

| Folder   | Uses                                                 |
| -------- | ---------------------------------------------------- |
| `html`   | The elements from plain HTML and a little TypeScript |
| `react`  | React 19 with `@usezeno/react`                       |
| `vue`    | Vue 3 with the elements and `@usezeno/vue/elements`  |
| `svelte` | Svelte 5 with `@usezeno/svelte`                      |

`shared` holds what the four have in common: the page styles, the option list,
and `sign-up-contract.ts`. That file is one set of eight checks, and every app
runs it in headless Chromium: properties reach the element, typing updates the
app's state, the app's state updates the element, the modal opens and closes,
the form submits the right values, and a required field blocks an empty
submit. The Vue and Svelte apps add tests for their own binding rules.

## Running one

Build the packages once from the repository root, then work in the folder:

```bash
pnpm build
cd examples/react
pnpm dev         # open the app
pnpm test        # the checks, in headless Chromium
pnpm typecheck
pnpm build
```

The tests need the browser that `pnpm --filter @usezeno/core exec playwright install chromium`
installs.
