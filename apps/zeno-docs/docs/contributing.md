---
title: Contributing
description: How to build Zeno, make a change and get it released.
slug: /contributing
---

# Contributing

Zeno is developed in one repository,
[github.com/cipherlabs-hq/zeno](https://github.com/cipherlabs-hq/zeno). Bug
reports and pull requests are welcome. For anything larger than a fix, open an
issue first so the change can be agreed before you write it.

## Set up

You need Node.js 22.12 or newer and pnpm 10. [Building](./building.md) has the
commands for building and testing.

## Make a change

1. Change the element in `packages/core/src/components/lit/<name>/`. That
   source is the only implementation. The React, Vue and Svelte bindings are
   generated from it with `pnpm generate`.
2. Add or update a browser test in `packages/core/test/browser/`. Many
   elements have no test of their own yet. A first test for one of them is a
   useful contribution in itself.
3. If you changed what an element does, update its notes in
   `apps/zeno-docs/element-docs/<name>.mjs`: the examples, the keyboard table,
   the accessibility notes and the known gaps. Remove a gap when you fix it.
4. Describe the change for the changelog:

   ```bash
   pnpm changeset
   ```

   Choose `patch` for a fix and `minor` for anything new or breaking while
   Zeno is below 1.0. Write one or two plain sentences for the people who use
   the packages.

5. Run the checks that CI runs:

   ```bash
   pnpm build
   pnpm test
   pnpm typecheck
   pnpm lint
   pnpm format:check
   pnpm docs:build
   ```

## How a release happens

Merged changesets collect in a "Version packages" pull request. Merging that
pull request publishes every package with the same new version and adds the
entry to the [Releases](/releases) page. See
[Versioning and support](./versioning.mdx) for what a version promises.

## Security

Do not report a security issue in a public issue or pull request. See
[Report a security issue](./versioning.mdx#report-a-security-issue).
