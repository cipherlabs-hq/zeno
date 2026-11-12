/**
 * Component Types
 * Common component-related types shared across frameworks
 */

import type { ComponentSize } from './base.js';

// ==================== Button Types ====================
export type ButtonVariant =
  | 'primary' // High-emphasis primary actions
  | 'secondary' // Medium-emphasis secondary actions
  | 'tertiary' // Low-emphasis actions
  | 'outline' // Outlined variant (alias for secondary)
  | 'accent' // Accent actions
  | 'destructive' // Destructive actions (delete, remove)
  | 'ghost' // Minimal emphasis
  | 'link' // Text-like actions
  | 'glass';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// ==================== Icon Types ====================
export type IconSize = ComponentSize | string | number;
export type IconVariant =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

// ==================== Alert Types ====================
export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'glass';
export type AlertSize = 'sm' | 'md' | 'lg';
export type AlertAnimation =
  | 'fade'
  | 'slide-down'
  | 'slide-up'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'bounce'
  | 'none';

// ==================== Badge Types ====================
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'glass';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';
export type BadgePosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'corner'
  | 'inline';

// ==================== Avatar Types ====================
export type AvatarShape = 'circle' | 'square' | 'rounded';
export type AvatarSize = ComponentSize;
export type AvatarVariant = 'default' | 'glass' | 'gradient' | 'outline';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy' | 'none';

// ==================== Card Types ====================
export type CardElevation = 0 | 1 | 2 | 3 | 4 | 5;
export type CardVariant = 'default' | 'brand' | 'glass' | 'outlined';

// ==================== Paper Types ====================
export type PaperElevation = 0 | 1 | 2 | 3 | 4 | 5;
export type PaperRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type PaperVariant = 'default' | 'outlined' | 'glass';

// ==================== Modal Types ====================
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
export type ModalVariant =
  | 'default'
  | 'glass'
  | 'sheet'
  | 'minimal'
  | 'brand'
  | 'danger'
  | 'warning'
  | 'success';
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';
export type ModalAnimation =
  'fade' | 'scale' | 'slide' | 'zoom' | 'flip' | 'sheet';

// ==================== Drawer Types ====================
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ==================== Toast Types ====================
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ToastVariant = 'info' | 'success' | 'warning' | 'error' | 'default';

// ==================== Tooltip Types ====================
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';
export type TooltipVariant = 'default' | 'glass' | 'dark' | 'light';
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

// ==================== Progress Types ====================
export type ProgressVariant =
  'default' | 'primary' | 'success' | 'warning' | 'danger' | 'glass';
export type ProgressSize = 'xs' | 'sm' | 'md' | 'lg';

// ==================== Spinner Types ====================
export type SpinnerVariant =
  'default' | 'primary' | 'secondary' | 'glass' | 'brand';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ==================== Skeleton Types ====================
export type SkeletonVariant = 'default' | 'glass' | 'pulse' | 'wave';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

// ==================== Chip Types ====================
export type ChipVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'glass';
export type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

// ==================== Tag Types ====================
export type TagVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'glass';
export type TagSize = 'xs' | 'sm' | 'md' | 'lg';

// ==================== Divider Types ====================
export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'solid' | 'dashed' | 'dotted' | 'glass';
export type DividerLabelPlacement = 'start' | 'center' | 'end';

// ==================== Layout Types ====================
export type ContainerMaxWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type GridAlign = 'start' | 'center' | 'end' | 'stretch';
export type GridJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
