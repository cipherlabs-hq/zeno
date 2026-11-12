# The 2025 audit, and what happened to each finding

The 2025 code base was audited before Zeno became a public project. The audit
listed colour pairs that failed WCAG 2.2 AA and token groups that did not
exist. This page records each finding and its outcome.

## Contrast failures

The audit measured these pairs in the violet and gold theme:

| Colour                | On         | Measured | Needed |
| --------------------- | ---------- | -------- | ------ |
| Old Gold `#D4AF37`    | White      | 2.4:1    | 4.5:1  |
| Pale Purple `#E5D4ED` | White      | 1.3:1    | 4.5:1  |
| Muted `#94A3B8`       | Light gray | 2.1:1    | 4.5:1  |
| Peach `#F7E3AF`       | White      | 1.4:1    | 4.5:1  |

Outcome: the violet and gold theme is gone, and so are all four colours. The
neutral theme that replaced it has one accent, and a test checks its colour
pairs in both light and dark. See
[`packages/tokens/test/contrast-pairs.mjs`](../packages/tokens/test/contrast-pairs.mjs)
for the pairs and `pnpm --filter @usezeno/tokens test` for the current
numbers.

## Missing state tokens

| Finding                             | Outcome                                                                                                                                                                                                           |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No hover, active or disabled tokens | Added: `color.background.hover`, `.active`, `.selected` and `.disabled`; `color.text.disabled`; `color.border.controlHover` and `.disabled`; `solidHover`, `solidActive` and `subtleHover` in every colour family |
| No focus tokens                     | Added: `color.focus.ring`, `focus.ring.width`, `focus.ring.offset`                                                                                                                                                |
| No invalid state                    | Added: `color.text.invalid`, `color.border.invalid`                                                                                                                                                               |
| No feedback colours                 | Added: the `success`, `warning`, `danger` and `info` families, eight tokens each                                                                                                                                  |
| No selection colours                | Added: `color.selection.background`, `color.selection.text`                                                                                                                                                       |
| No link states                      | Added: `color.link.default`, `.hover`, `.active`, `.visited`                                                                                                                                                      |

## Other missing tokens

| Finding                                                                    | Outcome                                                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| No z-index scale                                                           | Added: `zIndex.base` to `zIndex.tooltip`                                                    |
| No opacity scale                                                           | Added `opacity.disabled` and `opacity.loading` only. Overlays use `color.background.scrim`  |
| Shadow colours hard-coded                                                  | Shadows are theme tokens now, `shadow.xs` to `shadow.2xl`, with separate dark values        |
| Spacing scale skips 7                                                      | Added `spacing.7`, plus `spacing.9` and `spacing.11`                                        |
| Mixed kebab-case and camelCase names                                       | Token paths are camelCase in JSON. Every custom property is kebab-case with a `zeno` prefix |
| Duplicate and circular colour references                                   | One palette, and theme tokens that point at it. The build fails on an unresolved reference  |
| Backdrop filter, glass tint, glow, reflection and perspective tokens       | Not added. The neutral theme does not use glass or depth effects                            |
| Text decoration, text transform, font feature and paragraph spacing tokens | Not added. No element needs them yet                                                        |
| Spring physics, delay, stagger and path animation tokens                   | Not added. `motion.duration` and `motion.easing` cover what the elements use                |

## Hard-coded values in components

The audit counted hard-coded colours, sizes and durations in the Vue
single-file components.

- The Lit elements in `@usezeno/core` now read only `--zeno-*` custom
  properties. A test in `packages/core/src/token-usage.spec.ts` fails if an
  element reads a property that the token stylesheet does not define, or uses a
  colour literal outside a print rule.
- The Vue single-file components in `@usezeno/vue` were re-pointed at the new
  tokens, but they still contain colours that Sass computed from the light
  theme. They are due to be replaced by the Lit elements, not repaired.
