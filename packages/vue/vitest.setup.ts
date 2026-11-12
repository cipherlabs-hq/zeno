import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expect.extend(toHaveNoViolations as any);
