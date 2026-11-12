/**
 * Navigation Types
 * Types for navigation-related components
 */

// ==================== NavRail Types ====================
export type NavRailPosition = 'left' | 'right';
export type NavRailVariant = 'default' | 'glass' | 'minimal';

// ==================== Breadcrumb Types ====================
export type BreadcrumbSeparator = 'slash' | 'arrow' | 'chevron' | 'dot';

// ==================== Tabs Types ====================
export type TabsVariant =
  | 'default'
  | 'pills'
  | 'underline'
  | 'boxed'
  | 'glass'
  | 'line'
  | 'soft-rounded'
  | 'solid-rounded';
export type TabsSize = 'sm' | 'md' | 'lg';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsAlignment = 'start' | 'center' | 'end' | 'stretch';

// ==================== Accordion Types ====================
export type AccordionVariant = 'default' | 'bordered' | 'separated' | 'glass';
export type AccordionSize = 'sm' | 'md' | 'lg';

// ==================== Stepper Types ====================
export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperVariant = 'default' | 'dots' | 'progress' | 'minimal';
export type StepperSize = 'sm' | 'md' | 'lg';

// ==================== Pagination Types ====================
export type PaginationVariant = 'default' | 'rounded' | 'minimal' | 'dots';
export type PaginationSize = 'sm' | 'md' | 'lg';
