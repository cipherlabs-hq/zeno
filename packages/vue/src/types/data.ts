/**
 * Data Display Component Types
 * DataTable, Avatar, Badge, Icon, etc.
 */

import type { Component } from 'vue';
import type { ZComponentBase } from './base';
import type {
  TableColumn,
  SortDirection,
  TableSize,
  TableVariant,
  DataTableDensity,
  AvatarShape,
  AvatarSize,
  AvatarVariant,
  AvatarStatus,
  IconSize,
  IconVariant,
} from '@usezeno/core';

// ==================== Avatar Types ====================
// Re-export from core for backward compatibility
export type {
  AvatarShape,
  AvatarSize,
  AvatarVariant,
  AvatarStatus,
} from '@usezeno/core';

export interface ZAvatarProps extends ZComponentBase {
  /** Image source URL */
  src?: string;
  /** Alternative text for image */
  alt?: string;
  /** User name (used for initials if no image) */
  name?: string;
  /** Avatar shape */
  shape?: AvatarShape;
  /** Size variant */
  size?: AvatarSize;
  /** Visual variant */
  variant?: AvatarVariant;
  /** User status indicator */
  status?: AvatarStatus;
  /** Badge content (number or text) */
  badge?: string | number;
  /** Badge position */
  badgePosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Badge color */
  badgeColor?: string;
  /** Custom icon component */
  icon?: Component | string;
  /** Background color (when no image) */
  color?: string;
  /** Text color (for initials) */
  textColor?: string;
  /** Border color */
  borderColor?: string;
  /** Show border */
  showBorder?: boolean;
  /** Whether avatar is clickable */
  clickable?: boolean;
  /** Loading state */
  loading?: boolean;
}

// Badge types - re-export from core
export type { BadgePosition } from '@usezeno/core';

// ==================== Icon Types ====================
// Re-export from core for backward compatibility
export type { IconSize, IconVariant } from '@usezeno/core';

export interface ZIconProps extends ZComponentBase {
  /** Icon name */
  name: string;
  /** Icon component or element (alternative to name) */
  icon?: Component | string;
  /** Size (preset or custom) */
  size?: IconSize;
  /** Color variant or custom color */
  color?: IconVariant | string;
  /** Stroke width (for line icons) */
  strokeWidth?: number | string;
  /** Custom CSS class */
  className?: string;
  /** Whether icon should spin */
  spin?: boolean;
  /** Rotation angle in degrees */
  rotate?: number;
  /** Flip horizontally or vertically */
  flip?: 'horizontal' | 'vertical' | 'both';
  /** Custom class for the icon */
  iconClass?: string;
}

// ==================== DataTable Types ====================
// Re-export from core for backward compatibility
export type {
  TableSize,
  TableVariant,
  DataTableDensity,
  TableSort,
  TablePagination,
  SortDirection,
} from '@usezeno/core';

export interface ZDataTableProps<T = Record<string, unknown>> extends Omit<
  ZComponentBase,
  'density'
> {
  /** Table data */
  data?: T[];
  /** Legacy prop name for data */
  rows?: T[];
  /** Column definitions */
  columns?: TableColumn<T>[];
  /** Loading state */
  loading?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Selected rows */
  selectedRows?: T[];
  /** Enable sorting */
  sortable?: boolean;
  /** Current sort configuration */
  sort?: { column: string; direction: SortDirection };
  /** Enable filtering */
  filterable?: boolean;
  /** Global filter value */
  globalFilter?: string;
  /** Enable global filter/search */
  enableGlobalFilter?: boolean;
  /** Enable pagination */
  paginated?: boolean;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Items per page */
  pageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Total number of items (for server-side pagination) */
  totalItems?: number;
  /** Enable virtualization for large datasets */
  virtualized?: boolean;
  /** Row height for virtualization */
  rowHeight?: number;
  /** Virtual scroll height */
  virtualHeight?: number;
  /** Table size variant */
  size?: TableSize;
  /** Visual variant */
  variant?: TableVariant;
  /** Content density mode */
  density?: DataTableDensity;
  /** Show table borders */
  bordered?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hover effect on rows */
  hoverable?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Show table header */
  showHeader?: boolean;
  /** Show pagination controls */
  showPagination?: boolean;
  /** Show page size selector */
  showPageSizeSelector?: boolean;
  /** Table caption */
  caption?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Custom row key field */
  rowKey?: keyof T | ((_row: T) => string | number);
  /** Get row ID function */
  getRowId?: (_row: T, _index: number) => string;
  /** Expandable rows */
  expandable?: boolean;
  /** Expanded row keys */
  expandedRows?: (string | number)[];
  /** Custom ID */
  id?: string;
  /** Test ID for automation */
  testId?: string;
}
