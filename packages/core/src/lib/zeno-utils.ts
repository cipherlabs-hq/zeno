/**
 * Formats a number as currency with the specified locale
 * @param amount - The number to format as currency
 * @param locale - The locale to use for formatting (default: "en-US")
 * @param currency - The currency code to use (default: "USD")
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    // Fallback for invalid locale/currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
