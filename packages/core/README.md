# @usezeno/core

The Zeno elements, written with Lit. Importing `@usezeno/core/web-components`
registers all 39 elements, and exports their classes and types.

The elements read the `--zeno-*` custom properties from `@usezeno/tokens` and
carry no fallback values. Load the token stylesheet once per page:

```js
import '@usezeno/tokens/css';
import '@usezeno/core/web-components';
```

```html
<zeno-input name="email" type="email" label="Email" required></zeno-input>
<zeno-button type="submit">Sign up</zeno-button>
```

There is one entry point, and it registers every element. An app that uses
two elements still loads all of them (about 75 kB of JavaScript after gzip,
Lit included).

## What the build produces

- `dist/web-components.js` and its types.
- `dist/custom-elements.json`, a
  [custom-elements manifest](https://github.com/webcomponents/custom-elements-manifest)
  that lists every element's properties, attributes, events, slots and parts.
  The React, Vue and Svelte bindings are generated from it (`pnpm generate` at
  the repository root).

## Tests

`pnpm test` runs two sets with Vitest: unit tests in Node, and tests in
headless Chromium (through Playwright). Not every element is tested to the
same depth. The form controls, the overlays and the icon have their own
browser tests, which also check them with axe-core in the light and the dark
theme. Every other element is only checked to register and render. The
[status table](https://zeno.thecipherlabs.com/elements#status-of-each-element)
on the documentation site lists each element.

Install the browser once with
`pnpm --filter @usezeno/core exec playwright install chromium`.

Pre-release: the API can change in any 0.x minor release.
