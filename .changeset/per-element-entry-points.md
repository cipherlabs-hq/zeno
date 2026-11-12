---
'@usezeno/core': minor
'@usezeno/react': minor
---

Per-element entry points: `@usezeno/core/<element>` registers one element and the elements it renders, and `@usezeno/react/<element>` is its React component. `@usezeno/react` is now free of side effects, so importing a few components from its index also bundles only those elements. `@usezeno/core/web-components` still registers all of them.
