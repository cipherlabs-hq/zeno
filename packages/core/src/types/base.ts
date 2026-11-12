/**
 * Base Types and Shared Definitions
 * Common types used across all frameworks and components
 */

// Form value types
export type FormValue = string | number | boolean | Date | null | undefined;
export type FormValueArray = FormValue[];

// Common size definitions
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Theme variants
export type ColorMode = 'light' | 'dark';

// Spatial depth levels
export type DepthLevel = 'near' | 'default' | 'mid' | 'far' | 'horizon';

// Animation types
export type AnimationType =
  'none' | 'fade' | 'scale' | 'slide' | 'bounce' | 'glass-morph';

// Responsive value type for grid system and other responsive properties
export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };
