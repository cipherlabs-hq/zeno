---
title: Building
description: Build and test the Zeno packages from the repository.
slug: /building
---

# Building

You need Node.js 22.12 or newer and pnpm 10.

```bash
pnpm install
pnpm --filter @usezeno/core exec playwright install chromium   # once: the browser the tests run in
pnpm build       # build every package and example, in dependency order
pnpm test        # run every package's and example's tests
pnpm typecheck   # type-check every package and example
pnpm lint        # ESLint, no warnings allowed
```

To work on one package, run its script through pnpm's filter:

```bash
pnpm --filter @usezeno/core test
pnpm --filter @usezeno/storybook dev
pnpm --filter @usezeno/docs start
```

The packages build in this order: tokens, styles, core, composables, then the
framework packages, then the examples. `pnpm build` handles the order for you.

## Tests

The elements are tested in a real browser: Vitest starts headless Chromium
through Playwright, and the tests click, type and submit forms as a person
would. Not every element has such tests yet. The
[status table](/elements#status-of-each-element) says which do: those are
also checked with axe-core in the light and the dark theme, and the others
are only tested to register and render. A smaller set of unit tests runs in
Node.

The four example apps run one shared set of checks, so a change that breaks
an element in one framework fails that framework's example.

## Generated files

Three files are written by `scripts/generate-bindings.mjs` from the
custom-elements manifest that the core build produces:

- `packages/react/src/index.ts`
- `packages/vue/src/elements/generated.ts`
- `packages/svelte/src/elements.ts`

After you change an element's properties or events, run:

```bash
pnpm generate
```

`pnpm generate:check` fails when one of those files is out of date. CI runs
it.

## This site

The site is a Docusaurus app in `apps/zeno-docs`. Before it starts or builds,
`apps/zeno-docs/scripts/generate.mjs` writes the element pages, the token
tables, the Releases page and the example sources from the code, so those
cannot drift from it. None of that output is committed.

```bash
pnpm docs:build   # build the packages, generate, and write apps/zeno-docs/build
pnpm docs:dev     # generate and serve with live reload (run pnpm build once first)
```

The examples, keyboard notes, accessibility notes and known gaps of an
element are hand-written, in `apps/zeno-docs/element-docs/<name>.mjs`. The
generator checks every example against the manifest and fails on a tag or
attribute that does not exist.
