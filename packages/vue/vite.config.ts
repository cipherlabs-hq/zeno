import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const stylesDir = (path: string) =>
  fileURLToPath(new URL(`../styles/${path}`, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [stylesDir('dist/scss'), stylesDir('scss')],
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      // `index` is the Vue components. `elements` is the thin path: helpers
      // and template types for using the Lit elements directly.
      entry: { index: 'src/index.ts', elements: 'src/elements/index.ts' },
      cssFileName: 'vue',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'vue',
        /^@usezeno\//,
        /^@vuepic\//,
        /^@tanstack\//,
        'lucide-vue-next',
      ],
    },
  },
});
