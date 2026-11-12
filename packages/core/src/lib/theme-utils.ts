/**
 * Theme helpers.
 *
 * The token stylesheet (`@usezeno/tokens/css`) follows the operating system by
 * default. Setting `data-theme="light"` or `data-theme="dark"` on an element
 * forces that theme for the element and everything inside it. These helpers
 * read and write that attribute; they hold no state of their own.
 */

/** A theme the token stylesheet defines. */
export type ThemeName = 'light' | 'dark';

/** What a person can choose: a theme, or whatever the system asks for. */
export type ThemePreference = ThemeName | 'system';

export const THEME_ATTRIBUTE = 'data-theme';

function defaultRoot(): HTMLElement | undefined {
  return typeof document === 'undefined' ? undefined : document.documentElement;
}

export function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark';
}

/** The theme the operating system asks for. Light where that is unknown. */
export function getSystemTheme(): ThemeName {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/** The preference set on `root`: `system` when it has no `data-theme`. */
export function getThemePreference(
  root: Element | undefined = defaultRoot()
): ThemePreference {
  const value = root?.getAttribute(THEME_ATTRIBUTE);
  return isThemeName(value) ? value : 'system';
}

/** The theme in effect on `root`, with `system` resolved. */
export function getTheme(root: Element | undefined = defaultRoot()): ThemeName {
  const preference = getThemePreference(root);
  return preference === 'system' ? getSystemTheme() : preference;
}

/**
 * Sets the theme on `root` (the document element by default). `system`
 * removes the attribute, so the stylesheet follows the operating system
 * again.
 */
export function setTheme(
  preference: ThemePreference,
  root: Element | undefined = defaultRoot()
): void {
  if (!root) {
    return;
  }
  if (preference === 'system') {
    root.removeAttribute(THEME_ATTRIBUTE);
  } else {
    root.setAttribute(THEME_ATTRIBUTE, preference);
  }
}

/**
 * Calls `listener` when the operating system's theme changes. Returns a
 * function that stops listening.
 */
export function onSystemThemeChange(
  listener: (theme: ThemeName) => void
): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (event: MediaQueryListEvent) =>
    listener(event.matches ? 'dark' : 'light');
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}
