import {
  ref,
  computed,
  onMounted,
  watch,
  type Ref,
  type ComputedRef,
} from 'vue';

/**
 * Theme options available for the application
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Return type for the useThemeToggle composable
 */
export interface UseThemeToggleReturn {
  /** Current theme setting */
  theme: Ref<Theme>;
  /** Computed current theme (resolves 'auto' to actual theme) */
  currentTheme: ComputedRef<'light' | 'dark'>;
  /** Whether dark mode is currently active */
  isDark: ComputedRef<boolean>;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  /** Set a specific theme */
  setTheme: (_newTheme: Theme) => void;
}

/**
 * Storage key for theme preference
 */
const THEME_STORAGE_KEY = 'zeno-theme-preference';

/**
 * Load theme preference from localStorage
 */
function loadStoredTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'auto';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'auto'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to load theme from localStorage:', error);
  }

  return 'auto';
}

/**
 * Save theme preference to localStorage
 */
function saveThemeToStorage(theme: Theme): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
}

/**
 * Apply theme using data-theme attribute on html element
 */
function applyTheme(targetTheme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  html.setAttribute('data-theme', targetTheme);

  // Also set color-scheme for native browser theming
  html.style.colorScheme = targetTheme;
}

/**
 * Theme toggle composable that manages light/dark mode with localStorage persistence
 * and data-theme attribute. Integrates with Zeno design tokens CSS custom properties.
 *
 * Features:
 * - Detects prefers-color-scheme
 * - Persists choice to localStorage
 * - Uses data-theme attribute for CSS targeting
 * - Reactive theme state
 *
 * @returns Theme management utilities
 *
 * @example
 * ```vue
 * <template>
 *   <button @click="toggleTheme">
 *     {{ isDark ? 'Light' : 'Dark' }} Mode
 *   </button>
 * </template>
 *
 * <script setup>
 * import { useThemeToggle } from '@usezeno/composables';
 *
 * const { isDark, toggleTheme } = useThemeToggle();
 * </script>
 * ```
 */
export function useThemeToggle(): UseThemeToggleReturn {
  // Load initial theme from localStorage
  const theme = ref<Theme>(loadStoredTheme());

  /**
   * Check if user prefers dark mode from system
   */
  const prefersDark = computed(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /**
   * Resolve the current theme (auto becomes light/dark based on system preference)
   */
  const currentTheme = computed<'light' | 'dark'>(() => {
    if (theme.value === 'auto') {
      return prefersDark.value ? 'dark' : 'light';
    }
    return theme.value;
  });

  /**
   * Check if dark mode is currently active
   */
  const isDark = computed(() => currentTheme.value === 'dark');

  /**
   * Toggle between light and dark themes
   * If currently auto, switches to opposite of system preference
   */
  const toggleTheme = (): void => {
    if (theme.value === 'auto') {
      // If auto, switch to opposite of system preference
      theme.value = prefersDark.value ? 'light' : 'dark';
    } else {
      // Toggle between light and dark
      theme.value = theme.value === 'light' ? 'dark' : 'light';
    }
  };

  /**
   * Set a specific theme and persist to localStorage
   */
  const setTheme = (newTheme: Theme): void => {
    theme.value = newTheme;
  };

  // Watch theme changes and apply them
  watch(
    currentTheme,
    newTheme => {
      applyTheme(newTheme);
    },
    { immediate: true }
  );

  // Watch theme preference changes and save to storage
  watch(
    theme,
    newTheme => {
      saveThemeToStorage(newTheme);
    },
    { immediate: true }
  );

  // Listen for system theme changes when in auto mode
  onMounted(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // The computed will automatically update when prefersDark changes
      // which will trigger the theme application through the watcher
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  });

  return {
    theme,
    currentTheme,
    isDark,
    toggleTheme,
    setTheme,
  };
}
