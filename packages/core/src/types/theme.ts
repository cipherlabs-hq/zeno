/**
 * Theme Types
 * Types for theming and appearance customization
 */

// Re-export types from theme-utils.ts
export type { ThemeName, ThemePreference } from '../lib/theme-utils.js';

// Re-export from base.ts
export type { DepthLevel } from './base.js';

/**
 * Motion intensity levels for animations
 */
export type MotionIntensity = 'none' | 'subtle' | 'full';

/**
 * Density modes for component spacing
 */
export type DensityMode = 'comfort' | 'compact';

/**
 * Glass morphism configuration
 */
export interface GlassConfig {
  blur?: number;
  opacity?: number;
  saturation?: number;
}
