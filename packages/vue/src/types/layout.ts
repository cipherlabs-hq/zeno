/**
 * Layout Component Types
 * Container, Grid, Paper, etc.
 */

import type { ZComponentBase, ResponsiveValue } from './base';

export type { ResponsiveValue };
import type {
  ContainerMaxWidth,
  GridAlign,
  GridJustify,
  PaperElevation,
  PaperRadius,
  CardElevation,
  DividerOrientation,
  DividerVariant,
  DividerLabelPlacement,
} from '@usezeno/core';

// ==================== Container Types ====================
// Re-export from core for backward compatibility
export type { ContainerMaxWidth } from '@usezeno/core';

export interface ZContainerProps extends ZComponentBase {
  /** Whether the container should be fluid (full width) */
  fluid?: boolean;
  /** Maximum width of the container */
  maxWidth?: ContainerMaxWidth;
}

// ==================== Grid Types ====================
// Re-export from core for backward compatibility
export type { GridAlign, GridJustify } from '@usezeno/core';

export interface ZGridProps extends ZComponentBase {
  /** Number of columns */
  cols?: ResponsiveValue<number>;
  /** Gap between grid items */
  gap?: ResponsiveValue<string | number>;
  /** Align items (legacy name for alignItems) */
  align?: GridAlign;
  /** Justify content (legacy name for justifyContent) */
  justify?: GridJustify;
  /** Align items */
  alignItems?: GridAlign;
  /** Justify content */
  justifyContent?: GridJustify;
  /** Whether grid is responsive */
  responsive?: boolean;
}

// ==================== Paper Types ====================
// Re-export from core for backward compatibility
export type { PaperElevation, PaperRadius } from '@usezeno/core';

export interface ZPaperProps extends ZComponentBase {
  /** Elevation shadow level */
  elevation?: PaperElevation;
  /** Padding inside the paper */
  padding?: string;
  /** Border radius */
  radius?: PaperRadius;
  /** Whether paper is rounded */
  rounded?: boolean;
  /** Whether to use outline instead of elevation */
  outlined?: boolean;
}

// ==================== Card Types ====================
// Re-export from core for backward compatibility
export type { CardElevation, CardVariant } from '@usezeno/core';

export interface ZCardProps extends ZComponentBase {
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Elevation shadow level */
  elevation?: CardElevation;
  /** Whether the card shows hover effects */
  hoverable?: boolean;
  /** Padding inside the card */
  padding?: string;
  /** Whether the card is selected */
  selected?: boolean;
  /** Card visual variant */
  variant?:
    'default' | 'outlined' | 'elevated' | 'brand' | 'glass' | 'gradient';
  /** Whether to show outline border instead of shadow */
  outlined?: boolean;
  /** Whether the card is interactive (hover effects) */
  interactive?: boolean;
  /** Whether the card is selectable */
  selectable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Hide content when loading */
  hideContentOnLoad?: boolean;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Whether the card should take full width */
  fullWidth?: boolean;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Cover image URL */
  coverImage?: string;
  /** Cover image alt text */
  coverImageAlt?: string;
  /** Show overlay on cover image */
  coverOverlay?: boolean;
  /** Avatar image URL */
  avatar?: string;
  /** Avatar alt text */
  avatarAlt?: string;
  /** Disable animations */
  noAnimation?: boolean;
}

// ==================== Divider Types ====================
// Re-export from core for backward compatibility
export type {
  DividerOrientation,
  DividerVariant,
  DividerLabelPlacement,
} from '@usezeno/core';

// Vue-specific divider types
export type DividerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type DividerLabelPosition = DividerLabelPlacement; // Alias for backward compatibility

export interface ZDividerProps extends ZComponentBase {
  /** Orientation of the divider */
  orientation?: DividerOrientation;
  /** Visual variant of the divider */
  variant?: DividerVariant;
  /** Size/thickness of the divider */
  size?: DividerSize;
  /** Spacing around the divider */
  spacing?: string;
  /** Label text to display on the divider */
  label?: string;
  /** Position of the label */
  labelPosition?: DividerLabelPosition;
}
