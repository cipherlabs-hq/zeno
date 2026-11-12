# @usezeno/tokens

The Zeno design tokens. The JSON files in `src/tokens` are the only source.
`build.mjs` runs Style Dictionary over them and writes everything in `dist`.

Pre-release: token names can change in any 0.x minor release.

## What it builds

| Import                        | File                  | Contents                                                |
| ----------------------------- | --------------------- | ------------------------------------------------------- |
| `@usezeno/tokens/css`         | `dist/css/tokens.css` | Every token as a `--zeno-*` custom property             |
| `@usezeno/tokens`             | `dist/index.js`       | `tokens`, `light`, `dark` and `vars`, with types        |
| `@usezeno/tokens/tokens.json` | `dist/tokens.json`    | Resolved values with their types, for other build tools |

`tokens.json` has no CSS in it. It is the starting point for outputs on other
platforms, such as Swift or Kotlin. Zeno does not build those yet.

## Using the stylesheet

Load the stylesheet once per page. The Zeno elements read these custom
properties and carry no fallback values, so they need it.

```js
import '@usezeno/tokens/css';
```

Light is the default theme. The stylesheet switches to dark when the operating
system asks for dark. The `data-theme` attribute overrides that:

| Markup                      | Result                                          |
| --------------------------- | ----------------------------------------------- |
| no attribute                | Follows the operating system                    |
| `<html data-theme="light">` | Light, whatever the operating system says       |
| `<html data-theme="dark">`  | Dark, whatever the operating system says        |
| `data-theme` on any element | That theme for the element and everything in it |

## Source layout

- `src/tokens/base` holds tokens that are the same in every theme: the colour
  palette, spacing, radius, type, motion, sizes, breakpoints, z-index, opacity
  and border widths.
- `src/tokens/theme/light.json` and `dark.json` hold the tokens that change
  with the theme: `color.*` and `shadow.*`. Both files must define the same
  names. The build stops if they differ.

Components use the theme tokens, such as `color.text.primary` or
`color.accent.solid`. The palette steps, such as `palette.gray.700`, exist so
that the theme tokens have something to point at.

Each of the six colour families (`accent`, `neutral`, `success`, `warning`,
`danger`, `info`) has the same eight tokens: `solid`, `solidHover`,
`solidActive`, `onSolid`, `subtle`, `subtleHover`, `border` and `text`.

## Contrast check

`pnpm test` checks the colour pairs in `test/contrast-pairs.mjs` against
WCAG 2.2 AA in both themes: 4.5:1 for text, and 3:1 for control boundaries,
focus rings and filled shapes. A change that takes a listed pair below its
minimum fails the test. Add a pair to that file when a component starts to
rely on a new combination.

The check covers the token pairs it lists. It does not look at how a component
uses them, so a component that lowers the opacity of its text can still fail.
