import 'vitest';

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any -- augmenting vitest's matcher interface
  interface Matchers<T = any> extends AxeMatchers<T> {}
}
