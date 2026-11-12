import vue from '@vitejs/plugin-vue';
import { zenoCompilerOptions } from '@usezeno/vue/elements';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: zenoCompilerOptions } })],
  test: {
    include: ['test/**/*.test.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1280, height: 800 },
      screenshotFailures: false,
    },
  },
});
