// Writes dist/custom-elements.json, the machine-readable description of every
// element: attributes, properties, events, slots and CSS parts. Editors and
// documentation tools read it, and @usezeno/react is generated from it.

/** Points the manifest at the built files, which are what the package ships. */
function builtPaths() {
  const rewrite = value =>
    value.replace(/^(\/?)src\//, '$1dist/').replace(/\.ts$/, '.js');
  const walk = node => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      for (const [key, value] of Object.entries(node)) {
        if ((key === 'path' || key === 'module') && typeof value === 'string') {
          node[key] = rewrite(value);
        } else {
          walk(value);
        }
      }
    }
  };
  return {
    name: 'zeno-built-paths',
    packageLinkPhase({ customElementsManifest }) {
      walk(customElementsManifest);
    },
  };
}

export default {
  globs: ['src/components/lit/**/*.ts'],
  exclude: ['**/*.spec.ts', '**/*.test.ts'],
  outdir: 'dist',
  litelement: true,
  plugins: [builtPaths()],
};
