// @vitest-environment node
// Server rendering (Next.js, Astro, Vite SSR) imports the elements in Node,
// where there is no DOM. The import must not throw there.
import { expect, it } from 'vitest';

it('imports in Node without a DOM', async () => {
  expect(typeof document).toBe('undefined');
  const elements = await import('../src/web-components.ts');
  expect(elements.ZenoButton).toBeTypeOf('function');
  expect(elements.ZenoToggletip).toBeTypeOf('function');
  expect(elements.ZenoCodeSnippet).toBeTypeOf('function');
});
