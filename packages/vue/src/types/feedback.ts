/**
 * Feedback Component Types
 * Alerts, Toasts, Progress, Spinners, etc.
 */

import type { ZComponentBase } from './base';
import type { BadgePosition } from './data';
import type {
  AlertVariant,
  AlertSize,
  AlertAnimation,
  AlertAction,
  BadgeVariant,
  BadgeSize,
  ProgressVariant as CoreProgressVariant,
  ProgressSize,
  SpinnerVariant,
  SpinnerSize,
  SkeletonAnimation,
  ToastPosition,
  ToastVariant as CoreToastVariant,
} from '@usezeno/core';

// ==================== Alert Types ====================
// Re-export from core for backward compatibility
export type {
  AlertVariant,
  AlertSize,
  AlertAnimation,
  AlertAction,
} from '@usezeno/core';

export interface ZAlertProps extends ZComponentBase {
  /** Visual variant for different alert types */
  variant?: AlertVariant;
  /** Size variant */
  size?: AlertSize;
  /** Alert title text */
  title?: string;
  /** Alert message content */
  message?: string;
  /** Whether alert can be dismissed */
  dismissible?: boolean;
  /** Whether alert is persistent (auto-dismiss disabled) */
  persistent?: boolean;
  /** Whether to show icon */
  showIcon?: boolean;
  /** Whether alert is disabled */
  disabled?: boolean;
  /** Action buttons configuration */
  actions?: AlertAction[];
  /** Auto-dismiss timeout in milliseconds */
  timeout?: number;
  /** Show progress bar for auto-dismiss */
  showProgress?: boolean;
  /** Animation type */
  animation?: AlertAnimation;
  /** Shadow elevation (0-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Whether alert is floating */
  floating?: boolean;
  /** Custom close button label for accessibility */
  closeButtonLabel?: string;
  /** Custom id attribute */
  id?: string;
  /** Test ID for automated testing */
  testId?: string;
  // Legacy props for compatibility
  closable?: boolean;
  icon?: boolean;
}

// ==================== Toast Types ====================
// Re-export from core for backward compatibility
export type { ToastPosition } from '@usezeno/core';
export type ToastVariant = CoreToastVariant | 'glass';

// Vue-specific toast types
export type ToastAnimation = 'slide' | 'fade' | 'scale' | 'bounce';
export type ToastActionVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ToastAction {
  label: string;
  handler: () => void;
  variant?: ToastActionVariant;
  dismissOnClick?: boolean;
}

export interface ToastData {
  id?: string;
  variant?: ToastVariant;
  title?: string;
  message: string;
  icon?: boolean;
  duration?: number;
  persistent?: boolean;
  closable?: boolean;
  dismissible?: boolean;
  action?: ToastAction;
  actions?: ToastAction[];
  showProgress?: boolean;
  animation?: ToastAnimation;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  onClose?: () => void;
}

export interface ZToastProps extends ZComponentBase {
  position?: ToastPosition;
  maxToasts?: number;
  persistent?: boolean;
  animation?: ToastAnimation;
  showProgress?: boolean;
  offset?: { x: number; y: number };
  swipeToDismiss?: boolean;
}

// ==================== Progress Types ====================
// Re-export from core for backward compatibility
export type { ProgressSize } from '@usezeno/core';
export type ProgressVariant = CoreProgressVariant | 'pulse';

// Vue-specific progress types
export type LabelPosition = 'top' | 'bottom' | 'inside' | 'none';

export interface ProgressSegment {
  value: number;
  color?: string;
  label?: string;
}

export interface ZProgressBarProps extends ZComponentBase {
  /** Whether the progress is indeterminate (unknown completion) */
  indeterminate?: boolean;
  /** Label text to display */
  label?: string;
  /** Maximum value */
  max?: number;
  /** Whether to show label */
  showLabel?: boolean;
  /** Show striped pattern */
  striped?: boolean;
  /** Current progress value */
  value?: number;
  /** Size variant */
  size?: ProgressSize;
  /** Visual variant */
  variant?: ProgressVariant;
  /** Label position */
  labelPosition?: LabelPosition;
  /** Whether to animate the progress bar */
  animated?: boolean;
  /** Progress segments for multi-segment progress */
  segments?: ProgressSegment[];
  /** Whether to use rounded corners */
  rounded?: boolean;
  /** Custom thickness */
  thickness?: string | number;
  /** Animation duration in ms */
  duration?: number;
  /** Whether to show the value percentage */
  showValue?: boolean;
}

// ==================== Spinner Types ====================
// Re-export from core for backward compatibility
export type { SpinnerSize, SpinnerVariant } from '@usezeno/core';

// Vue-specific spinner types
export type SpinnerType = 'ring' | 'dots' | 'pulse' | 'bars' | 'grid';
export type SpinnerLabelPosition = 'right' | 'bottom';

export interface ZSpinnerProps extends ZComponentBase {
  /** Loading label text */
  label?: string;
  /** Size variant or custom size */
  size?: SpinnerSize;
  /** Spinner animation type */
  type?: SpinnerType;
  /** Visual variant */
  variant?: SpinnerVariant;
  /** Label position */
  labelPosition?: SpinnerLabelPosition;
  /** Custom thickness */
  thickness?: number;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast' | number;
  /** Whether to show label */
  showLabel?: boolean;
  /** Show overlay background */
  overlay?: boolean;
  /** Fullscreen mode */
  fullscreen?: boolean;
}

// ==================== Skeleton Types ====================
// Re-export from core for backward compatibility
export type { SkeletonAnimation } from '@usezeno/core';

// Vue-specific skeleton types
export type SkeletonVariant =
  'rect' | 'circle' | 'text' | 'avatar' | 'card' | 'table' | 'list';
export type SkeletonSize = 'sm' | 'md' | 'lg';
export type SkeletonTheme = 'default' | 'pulse' | 'wave';

export interface ZSkeletonProps extends ZComponentBase {
  /** Animation type */
  animation?: SkeletonAnimation;
  /** Element height */
  height?: string | number;
  /** Visual variant */
  variant?: SkeletonVariant;
  /** Element width */
  width?: string | number;
  /** Size preset */
  size?: SkeletonSize;
  /** Theme variant */
  theme?: SkeletonTheme;
  /** Number of lines (for text variant) */
  lines?: number;
  /** Number of rows (for table/list variants) */
  rows?: number;
  /** Number of columns (for table variant) */
  columns?: number;
  /** Number of items (for list variant) */
  items?: number;
  /** Whether animation is active */
  animated?: boolean;
  /** Show image placeholder */
  showImage?: boolean;
  /** Show text placeholder */
  showText?: boolean;
  /** Custom border radius */
  radius?: string | number;
  /** Delay before showing skeleton */
  delay?: number;
  /** Show action buttons */
  showActions?: boolean;
  /** Show icon */
  showIcon?: boolean;
  /** Show action button */
  showAction?: boolean;
  /** Custom border radius */
  borderRadius?: string | number;
  /** Loading progress percentage */
  progress?: number;
  /** ARIA label */
  ariaLabel?: string;
  /** ARIA hidden */
  ariaHidden?: boolean;
  /** Custom ID */
  id?: string;
  /** Test ID */
  testId?: string;
}

// ==================== Tag Types ====================
// Re-export from core for backward compatibility
export type { TagVariant, TagSize } from '@usezeno/core';

// Vue-specific tag types
export type TagColor =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

export interface ZTagProps extends ZComponentBase {
  variant?: 'tonal' | 'default' | 'outline' | 'ghost';
  color?: TagColor;
}

// ==================== Chip Types ====================
export interface ZChipProps extends ZComponentBase {
  label?: string;
  removable?: boolean;
  disabled?: boolean;
}

// ==================== Badge Types ====================
// Re-export from core for backward compatibility
export type { BadgeVariant, BadgeSize } from '@usezeno/core';

// Vue-specific badge types
export type BadgeShape = 'rounded' | 'pill' | 'square';

export interface ZBadgeProps extends ZComponentBase {
  /** Badge content */
  content?: string | number;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: BadgeSize;
  /** Badge shape */
  shape?: BadgeShape;
  /** Position when overlaid */
  position?: BadgePosition;
  /** Show as dot only */
  dot?: boolean;
  /** Maximum number to display (shows + after) */
  max?: number;
  /** Whether badge is visible */
  show?: boolean;
  /** Interactive badge (hover effects) */
  interactive?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Outline style */
  outline?: boolean;
  /** Custom background color */
  color?: string;
  /** Custom text color */
  textColor?: string;
  /** Offset from edge */
  offset?: { x?: number; y?: number };
  /** Whether to show 0 values */
  showZero?: boolean;
  /** Pulsing animation */
  pulse?: boolean;
  /** ARIA label */
  ariaLabel?: string;
}
