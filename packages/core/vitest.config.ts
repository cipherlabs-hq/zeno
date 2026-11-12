import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

// Two projects. `unit` runs pure logic in jsdom. `browser` renders the
// elements in headless Chromium, where shadow DOM, ElementInternals, <dialog>
// and layout are real.
export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.spec.ts', 'test/*.spec.mjs'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['test/browser/**/*.test.ts'],
          setupFiles: ['test/browser/setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            // Wide enough that elements use their desktop layout.
            viewport: { width: 1280, height: 800 },
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
