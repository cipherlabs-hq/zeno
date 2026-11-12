# @usezeno/vue

## 0.1.0

### Minor Changes

- 3afca37: Five new elements: `zeno-code-snippet` (copy button with a spoken “Copied”), `zeno-link` (its own anchor, or styles a router's), `zeno-toggletip` (a click-to-open note that can hold links), `zeno-inline-loading` and `zeno-disclosure` (a `<details>` section whose content is markup). `zeno-icon` has 50 built-in icons from Feather, so the icons other elements ask for now draw, and takes a size in pixels. Fixes: `zeno-alert` is assertive only for errors and warnings, has `live="off"`, `heading`, `heading-level` and `close-label`; `zeno-input` has `help-text` and its clear and password buttons are in the tab order; `zeno-tag` has a background by default, is no longer a live region, and shows its `prefix` slot; the `zeno-slider` thumb is no longer cut off and shows keyboard focus; `zeno-hamburger` reports `aria-expanded` and keeps one name (“Menu”); `zeno-spinner` drops `aria-busy`.
- bdc6a93: First public pre-release of Zeno: 39 Lit elements in `@usezeno/core`, design tokens for light and dark themes in `@usezeno/tokens`, and bindings for React, Vue and Svelte. The API can still change in any 0.x minor release.

### Patch Changes

- Updated dependencies [3afca37]
- Updated dependencies [bdc6a93]
- Updated dependencies [c24acfb]
  - @usezeno/core@0.1.0
  - @usezeno/composables@0.1.0
