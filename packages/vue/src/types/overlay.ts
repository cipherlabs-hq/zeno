/**
 * Overlay Component Types
 * Modal, Drawer, Tooltip, Popover, etc.
 */

import type { Component } from 'vue';
import type { ZComponentBase, ComponentSize } from './base';
import type {
  ModalSize,
  ModalVariant,
  ModalPosition,
  ModalAnimation,
  ModalAction,
  DrawerPosition,
  TooltipPlacement,
  TooltipVariant,
  TooltipTrigger,
} from '@usezeno/core';

// ==================== Modal Types ====================
// Re-export from core for backward compatibility
export type {
  ModalSize,
  ModalVariant,
  ModalPosition,
  ModalAnimation,
  ModalAction,
} from '@usezeno/core';

export interface ZModalProps extends ZComponentBase {
  /** v-model binding for modal visibility */
  modelValue: boolean;
  /** Modal size variant */
  size?: ModalSize;
  /** Visual variant */
  variant?: ModalVariant;
  /** Position on screen */
  position?: ModalPosition;
  /** Animation type */
  animation?: ModalAnimation;
  /** Modal title */
  title?: string;
  /** Modal subtitle */
  subtitle?: string;
  /** Icon component or element */
  icon?: Component | string;
  /** Whether modal is centered vertically */
  centered?: boolean;
  /** Close on ESC key press */
  closeOnEsc?: boolean;
  /** Close on overlay click */
  closeOnOverlay?: boolean;
  /** Whether to hide the close button */
  hideCloseButton?: boolean;
  /** Show close button (legacy) */
  showClose?: boolean;
  /** Custom label for close button (accessibility) */
  closeButtonLabel?: string;
  /** Fullscreen mode */
  fullscreen?: boolean;
  /** Persistent (prevents closing) */
  persistent?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading text to display */
  loadingText?: string;
  /** Body loading state */
  bodyLoading?: boolean;
  /** Whether modal is scrollable */
  scrollable?: boolean;
  /** Footer actions */
  footerActions?: ModalAction[];
  /** Footer alignment */
  footerAlign?: 'start' | 'center' | 'end' | 'between';
  /** Always show header */
  showHeader?: boolean;
  /** Always show footer */
  showFooter?: boolean;
  /** Custom width */
  width?: string | number;
  /** Custom max width */
  maxWidth?: string | number;
  /** Custom height */
  height?: string | number;
  /** Custom max height */
  maxHeight?: string | number;
  /** Z-index */
  zIndex?: number;
  /** Custom id attribute */
  id?: string;
  /** Test ID for automated testing */
  testId?: string;
  /** Shadow elevation level (0-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Blur amount for glass variant */
  blurAmount?: number;
  /** Whether modal can be dragged (sheet variant) */
  draggable?: boolean;
  /** Minimum height for sheet variant */
  sheetMinHeight?: number;
  /** Maximum height for sheet variant */
  sheetMaxHeight?: number;
  /** Current step (for multi-step modals) */
  currentStep?: number;
  /** Total steps (for multi-step modals) */
  steps?: number;
  /** Disable focus trap */
  disableFocusTrap?: boolean;
  /** Custom overlay opacity */
  overlayOpacity?: number;
  /** Enable backdrop blur */
  backdropBlur?: boolean;
  /** Teleport target */
  teleportTo?: string | HTMLElement;
  /** Focus trap enabled */
  focusTrap?: boolean;
  /** Return focus on close */
  returnFocus?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Sticky footer */
  stickyFooter?: boolean;
  /** Custom overlay class */
  overlayClass?: string;
  /** Custom content class */
  contentClass?: string;
  /** Transition duration */
  transitionDuration?: number;
}

// ==================== Drawer Types ====================
// Re-export from core for backward compatibility
export type { DrawerPosition, DrawerSize } from '@usezeno/core';

// Vue-specific drawer types (legacy compatibility)
export type DrawerSide = 'left' | 'right';
export type DrawerAnchor = DrawerPosition; // Alias for backward compatibility
export type DrawerVariant = 'default' | 'glass' | 'minimal';

export interface ZDrawerProps extends ZComponentBase {
  /** v-model binding for drawer visibility */
  modelValue: boolean;
  /** Side position */
  side?: DrawerSide;
  /** Width of the drawer */
  width?: string;
  /** Anchor position (legacy) */
  anchor?: DrawerAnchor;
  /** Size (width for left/right, height for top/bottom) */
  size?: string | number;
  /** Visual variant */
  variant?: DrawerVariant;
  /** Show overlay backdrop */
  overlay?: boolean;
  /** Close on overlay click */
  closeOnOverlay?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Persistent (prevents closing) */
  persistent?: boolean;
  /** Show close button */
  showClose?: boolean;
  /** Hide close button */
  hideCloseButton?: boolean;
  /** Close button label for accessibility */
  closeButtonLabel?: string;
  /** Title */
  title?: string;
  /** Push content instead of overlay */
  push?: boolean;
  /** Z-index */
  zIndex?: number;
  /** Teleport target */
  teleportTo?: string | HTMLElement;
  /** Focus trap enabled */
  focusTrap?: boolean;
  /** Custom overlay class */
  overlayClass?: string;
  /** Custom content class */
  contentClass?: string;
  /** Header sticky */
  stickyHeader?: boolean;
  /** Footer sticky */
  stickyFooter?: boolean;
}

// ==================== Tooltip Types ====================
// Re-export from core for backward compatibility
export type {
  TooltipPlacement,
  TooltipTrigger,
  TooltipVariant,
} from '@usezeno/core';

// Vue-specific tooltip types
export type TooltipAnimation = 'fade' | 'scale' | 'slide' | 'bounce';

export interface ZTooltipProps extends ZComponentBase {
  /** Tooltip content */
  content?: string;
  /** Tooltip title */
  title?: string;
  /** Placement relative to target */
  placement?: TooltipPlacement;
  /** Trigger event */
  trigger?: TooltipTrigger;
  /** Visual variant */
  variant?: TooltipVariant;
  /** Size variant */
  size?: ComponentSize;
  /** Animation type */
  animation?: TooltipAnimation;
  /** Show/hide delay in ms */
  delay?: number | { show?: number; hide?: number };
  /** Show arrow */
  showArrow?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Offset from target (can be number or [x, y]) */
  offset?: number | [number, number];
  /** Maximum width */
  maxWidth?: string | number;
  /** Z-index */
  zIndex?: number;
  /** Teleport target */
  teleportTo?: string | HTMLElement;
  /** Interactive (can hover over tooltip) */
  interactive?: boolean;
  /** Custom classes */
  tooltipClass?: string;
  /** Open state (for manual trigger) */
  open?: boolean;
}

// ==================== Popover Types ====================
export type PopoverTrigger = 'hover' | 'click' | 'focus' | 'manual';
export type PopoverVariant = 'default' | 'glass' | 'minimal';

export interface ZPopoverProps extends ZComponentBase {
  /** v-model binding for visibility */
  modelValue?: boolean;
  /** Popover title */
  title?: string;
  /** Placement relative to target */
  placement?: TooltipPlacement;
  /** Trigger event */
  trigger?: PopoverTrigger;
  /** Visual variant */
  variant?: PopoverVariant;
  /** Show arrow */
  showArrow?: boolean;
  /** Width */
  width?: string | number;
  /** Max width */
  maxWidth?: string | number;
  /** Offset from target */
  offset?: [number, number];
  /** Show/hide delay */
  delay?: number | { show?: number; hide?: number };
  /** Disabled state */
  disabled?: boolean;
  /** Z-index */
  zIndex?: number;
  /** Teleport target */
  teleportTo?: string | HTMLElement;
  /** Custom classes */
  popoverClass?: string;
  /** Close on click outside */
  closeOnClickOutside?: boolean;
  /** Close on ESC */
  closeOnEsc?: boolean;
}
