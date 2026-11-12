import vue from '@vitejs/plugin-vue';
import { zenoCompilerOptions } from '@usezeno/vue/elements';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: zenoCompilerOptions } })],
});
