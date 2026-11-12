/**
 * Navigation Component Types
 * Tabs, NavRail, Breadcrumb, Accordion, etc.
 */

import type { Component } from 'vue';
import type { ZComponentBase } from './base';
import type {
  NavItem,
  BreadcrumbItem,
  BreadcrumbSeparator,
  TabItem,
  TabsVariant,
  TabsSize,
  TabsOrientation,
  TabsAlignment,
  AccordionItem,
  AccordionVariant,
  AccordionSize,
  StepperItem,
  StepperOrientation,
  StepperVariant,
  StepperSize,
  NavRailPosition,
  NavRailVariant,
  PaginationVariant,
  PaginationSize,
} from '@usezeno/core';

// ==================== NavRail Types ====================
// Re-export from core for backward compatibility
export type { NavItem, NavRailPosition, NavRailVariant } from '@usezeno/core';

export interface ZNavRailProps extends ZComponentBase {
  /** Currently active item ID */
  activeItem?: string;
  /** Whether the rail is collapsed */
  collapsed?: boolean;
  /** Navigation items */
  items?: NavItem[];
  /** Secondary navigation items */
  secondaryItems?: NavItem[];
  /** Position of the rail */
  position?: NavRailPosition;
  /** Visual variant */
  variant?: NavRailVariant;
  /** Whether to show labels when collapsed */
  showCollapsedLabels?: boolean;
  /** Custom width when expanded */
  width?: string | number;
  /** Custom collapsed width */
  collapsedWidth?: string | number;
  /** Whether the rail is floating */
  floating?: boolean;
  /** Whether the rail is elevated */
  elevated?: boolean;
  /** Whether the rail is collapsible */
  collapsible?: boolean;
  /** ARIA label for navigation */
  ariaLabel?: string;
}

// ==================== Breadcrumb Types ====================
// Re-export from core for backward compatibility
export type { BreadcrumbItem, BreadcrumbSeparator } from '@usezeno/core';

export interface ZBreadcrumbProps extends ZComponentBase {
  /** Breadcrumb items */
  items?: BreadcrumbItem[];
  /** Separator between items */
  separator?: BreadcrumbSeparator | string;
  /** Maximum items to display (with ellipsis) */
  maxItems?: number;
  /** Custom separator component */
  separatorComponent?: Component;
  /** Custom CSS class name */
  className?: string;
}

// ==================== Tabs Types ====================
// Re-export from core for backward compatibility
export type {
  TabsVariant,
  TabsSize,
  TabsOrientation,
  TabsAlignment,
  TabItem,
} from '@usezeno/core';

export interface ZTabsProps extends ZComponentBase {
  /** v-model binding for active tab */
  modelValue?: string | number;
  /** Tab items */
  tabs?: TabItem[];
  /** Visual variant */
  variant?: TabsVariant;
  /** Size variant */
  size?: TabsSize;
  /** Tab orientation */
  orientation?: TabsOrientation;
  /** Tab alignment */
  alignment?: TabsAlignment;
  /** Whether tabs should scroll when overflowing */
  scrollable?: boolean;
  /** Show tab icons */
  showIcons?: boolean;
  /** Icon position */
  iconPosition?: 'start' | 'end' | 'top' | 'bottom';
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether tabs are centered */
  centered?: boolean;
  /** Whether tabs should fit the container width */
  fitted?: boolean;
  /** Whether tabs can be closed */
  closable?: boolean;
  /** Whether to lazy load tab content */
  lazy?: boolean;
  /** Whether to keep alive tab content */
  keepAlive?: boolean;
  /** Custom ID for the component */
  id?: string;
  /** Test ID for automated testing */
  testId?: string;
}

// ==================== Accordion Types ====================
// Re-export from core for backward compatibility
export type {
  AccordionVariant,
  AccordionSize,
  AccordionItem,
} from '@usezeno/core';

export interface ZAccordionProps extends ZComponentBase {
  /** v-model binding for active keys */
  modelValue?: string[] | string;
  /** Currently active/expanded keys */
  activeKeys?: string[];
  /** Accordion items (when not using slots) */
  items?: AccordionItem[];
  /** Allow multiple panels to be expanded */
  multiple?: boolean;
  /** Visual variant */
  variant?: AccordionVariant;
  /** Size variant */
  size?: AccordionSize;
  /** Custom expand icon */
  expandIcon?: Component | string;
  /** Position of expand icon */
  expandIconPosition?: 'start' | 'end';
  /** Whether to show dividers between items */
  dividers?: boolean;
  /** Whether the accordion is disabled */
  disabled?: boolean;
  /** Whether expanded panels can be collapsed */
  collapsible?: boolean;
  /** Reduce motion for animations */
  reduceMotion?: boolean;
}

// ==================== Stepper Types ====================
// Re-export from core for backward compatibility
export type {
  StepperOrientation,
  StepperVariant,
  StepperSize,
  StepStatus,
  StepperItem,
} from '@usezeno/core';

export interface ZStepperProps extends ZComponentBase {
  /** Currently active step (0-indexed) */
  activeStep?: number;
  /** Stepper items */
  steps?: StepperItem[];
  /** Layout orientation */
  orientation?: StepperOrientation;
  /** Visual variant */
  variant?: StepperVariant;
  /** Size variant */
  size?: StepperSize;
  /** Allow clicking on steps to navigate */
  clickable?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
  /** Linear progression (must complete steps in order) */
  linear?: boolean;
  /** Alternative labels placement */
  alternativeLabel?: boolean;
}

// ==================== Pagination Types ====================
// Re-export from core for backward compatibility
export type { PaginationVariant, PaginationSize } from '@usezeno/core';

export interface ZPaginationProps extends ZComponentBase {
  /** Current page number */
  currentPage?: number;
  /** Total number of items */
  total?: number;
  /** Items per page */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Show quick jumper input */
  showJumper?: boolean;
  /** Show page size selector */
  showSizeChanger?: boolean;
  /** Show total items text */
  showTotal?: boolean;
  /** Visual variant */
  variant?: PaginationVariant;
  /** Size variant */
  size?: PaginationSize;
  /** Number of pages to display */
  pageCount?: number;
  /** Whether to show first/last buttons */
  showBoundaryButtons?: boolean;
  /** Custom text formatter for total */
  totalFormatter?: (_total: number, _range: [number, number]) => string;
}
