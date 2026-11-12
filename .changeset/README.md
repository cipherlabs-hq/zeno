# Changesets

Every change that should reach a published `@usezeno/*` package needs a changeset: a small
Markdown file in this folder that names the packages and says what changed.

```sh
pnpm changeset
```

The seven published packages share one version (a fixed group), so one bump moves all of them.
`docs/releasing.md` describes the whole release process.
