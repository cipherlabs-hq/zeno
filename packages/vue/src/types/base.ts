/**
 * Base Types and Shared Definitions
 * Common types used across all Vue components
 */

// Re-export core types for backward compatibility
export type {
  FormValue,
  FormValueArray,
  ComponentSize,
  ColorMode,
  DepthLevel,
  AnimationType,
  ResponsiveValue,
} from '@usezeno/core';

// Vue-specific base component interface
export interface ZComponentBase {
  /** Content density mode for different use cases */
  density?: 'comfort' | 'compact';
  /** Enable glass morphism variant */
  glass?: boolean;
  /** Motion intensity preference */
  motionIntensity?: 'none' | 'subtle' | 'full';
}
