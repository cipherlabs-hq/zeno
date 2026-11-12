# Contributing to Zeno

Bug reports and pull requests are welcome. For anything larger than a fix,
open an issue first so the change can be agreed before you write it.

The full guide is the Contributing page of the site. Its source is
[`apps/zeno-docs/docs/contributing.md`](./apps/zeno-docs/docs/contributing.md).
The short version:

1. You need Node.js 22.12 or newer and pnpm 10.

   ```bash
   pnpm install
   pnpm build
   ```

2. The elements are in `packages/core/src/components/lit/`. That source is the
   only implementation. The React, Vue and Svelte bindings are generated from
   it with `pnpm generate`.
3. Add or update a browser test in `packages/core/test/browser/`.
4. If the change affects what an element does, update its notes in
   `apps/zeno-docs/element-docs/<name>.mjs`.
5. Add a changeset with `pnpm changeset`: `patch` for a fix, `minor` for
   anything new or breaking while Zeno is below 1.0.
6. Run what CI runs:

   ```bash
   pnpm format:check
   pnpm lint
   pnpm build
   pnpm generate:check
   pnpm typecheck
   pnpm test
   pnpm release:check
   pnpm docs:build
   ```

   The browser tests need Chromium once:
   `pnpm --filter @usezeno/core exec playwright install chromium`.

Commits and pull requests are in plain English and say what changed and why.

Security problems are not reported in public. See [SECURITY.md](./SECURITY.md).

How a release is made is in [docs/releasing.md](./docs/releasing.md).
