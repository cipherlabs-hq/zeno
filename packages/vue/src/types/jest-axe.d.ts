declare module 'jest-axe' {
  export interface AxeResults {
    violations: unknown[];
  }

  export function axe(_html: string | Element): Promise<AxeResults>;
  export const toHaveNoViolations: Record<string, unknown>;
}
