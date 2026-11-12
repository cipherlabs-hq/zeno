<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./apps/zeno-docs/static/img/zeno-mascot-sticker.svg">
    <img src="./apps/zeno-docs/static/img/zeno-lockup.svg" alt="" height="64">
  </picture>
</p>

# Zeno

Zeno is a design system built from web components. Each element is written
once, with [Lit](https://lit.dev), and that implementation is the source of
truth. React, Vue and Svelte use the same elements, either directly or through
thin wrappers.

## Status

**Pre-release.** Zeno is at 0.x: until 1.0, a minor release can change
element names, attributes, events and token names. Do not depend on Zeno in
production yet. The first release will be 0.1.0.
[Releases](https://zeno.thecipherlabs.com/releases) lists every version and
what changed.

## Packages

| Package                | Contents                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `@usezeno/tokens`      | Design tokens: CSS custom properties and a JS export                                                                        |
| `@usezeno/core`        | The 44 Lit elements (`zeno-button`, `zeno-input`, …)                                                                        |
| `@usezeno/react`       | React components that wrap the elements, with typed props and events                                                        |
| `@usezeno/vue`         | For Vue 3: compiler helper, template types and `v-model` helper for the elements. Also the older Vue components (see below) |
| `@usezeno/svelte`      | For Svelte 5: registers the elements and types them in markup                                                               |
| `@usezeno/styles`      | Sass variables for the older Vue components                                                                                 |
| `@usezeno/composables` | Vue composables for the older Vue components                                                                                |
| `@usezeno/storybook`   | Storybook for the elements (not published)                                                                                  |
| `@usezeno/docs`        | Documentation site, built with Docusaurus (not published)                                                                   |

`examples/` holds one small app each for plain HTML, React 19, Vue 3 and
Svelte 5. All four render the same sign-up form and pass the same tests.

The older Vue components in `@usezeno/vue` are a second implementation from
the 2025 code base. They stay until the elements replace them.
[docs/vue-sfc-retirement.md](./docs/vue-sfc-retirement.md) lists, per
component, whether it can go.

## Use

```js
import '@usezeno/tokens/css';
import '@usezeno/core/web-components';
```

```html
<zeno-input name="email" type="email" label="Email" required></zeno-input>
<zeno-button type="submit">Sign up</zeno-button>
```

The documentation site covers every element, the tokens, forms, theming and
each framework. Its source is in `apps/zeno-docs`, and `pnpm docs:dev` serves
it on your machine. It is published at
[zeno.thecipherlabs.com](https://zeno.thecipherlabs.com).

## Building

You need Node.js 22.12 or newer and pnpm 10.

```bash
pnpm install
pnpm --filter @usezeno/core exec playwright install chromium   # once: the browser the tests run in
pnpm build            # every package and example, in dependency order
pnpm test             # every package's and example's tests
pnpm typecheck
pnpm lint
pnpm generate         # after changing an element's properties or events
pnpm build-storybook
pnpm docs:build
```

## Contributing and releases

- [CONTRIBUTING.md](./CONTRIBUTING.md): how to set up, make a change and add
  a changeset.
- [SECURITY.md](./SECURITY.md): how to report a security issue in private.
- [docs/releasing.md](./docs/releasing.md): how a release is made, and the
  steps for the first one.
- [CHANGELOG.md](./CHANGELOG.md): what changed in each release.

Zeno is named after a dog, a small black Yorkie poodle mix.

## License

[MIT](./LICENSE). Copyright Cipher Labs.
