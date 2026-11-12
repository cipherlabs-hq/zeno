import { describe, expect, it } from 'vitest';
import { formatCurrency } from './zeno-utils.js';

describe('formatCurrency', () => {
  it('should format currency with default locale and currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('should format currency with custom locale', () => {
    const result = formatCurrency(1234.56, 'de-DE', 'EUR');
    expect(result).toContain('1.234,56');
    expect(result).toContain('€');
  });

  it('should format currency with different locale', () => {
    expect(formatCurrency(1234.56, 'ja-JP', 'JPY')).toBe('￥1,235');
  });

  it('should handle zero amounts', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('should fallback to en-US USD for invalid locale', () => {
    expect(formatCurrency(1234.56, 'invalid-locale')).toBe('$1,234.56');
  });

  it('should handle large numbers', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });
});
