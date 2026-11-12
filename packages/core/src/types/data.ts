/**
 * Data Types
 * Types for data handling, forms, and tables
 */

import type { FormValue } from './base.js';

// ==================== Table Types ====================
// Re-export types from tableCore.ts to avoid duplication
export type {
  TableColumn,
  TableRow,
  SortDirection,
  SortState,
  PaginationState,
  TableState,
  TableOptions,
} from '../lib/tableCore.js';

// Import SortDirection for use in this file
import type { SortDirection } from '../lib/tableCore.js';

export interface TableSort {
  column: string;
  direction: SortDirection;
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
}

export type TableSize = 'sm' | 'md' | 'lg';
export type TableVariant = 'default' | 'bordered' | 'borderless' | 'striped';
export type DataTableDensity = 'compact' | 'comfortable' | 'spacious';

// ==================== Form Types ====================
export interface SelectOption {
  label: string;
  value: FormValue;
  disabled?: boolean;
  group?: string;
}

export interface RadioOption {
  label: string;
  value: FormValue;
  disabled?: boolean;
}

export interface AutocompleteOption {
  label: string;
  value: FormValue;
  disabled?: boolean;
  description?: string;
  icon?: string;
  group?: string;
}

// ==================== Navigation Types ====================
export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
  to?: string;
  href?: string;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
  href?: string;
  disabled?: boolean;
  icon?: string;
  onClick?: () => void;
}

export interface TabItem {
  id?: string | number;
  value: string | number;
  label: string;
  icon?: string;
  disabled?: boolean;
  badge?: string | number;
  description?: string;
  content?: string;
  closable?: boolean;
}

export interface AccordionItem {
  id: string;
  value?: string | number;
  title: string;
  subtitle?: string;
  icon?: string;
  disabled?: boolean;
  content?: string;
  badge?: string | number;
}

export interface StepperItem {
  id: string | number;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  error?: boolean;
  status?: StepStatus;
}

export type StepStatus = 'waiting' | 'active' | 'completed' | 'error';

// ==================== File Types ====================
export type FileUploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  status: FileUploadStatus;
  progress?: number;
  url?: string;
  error?: string;
  file?: File;
}

// ==================== Date/Time Types ====================
export type DateValue = Date | string | number | null | undefined | Date[];

export interface TimeValue {
  hours: number;
  minutes: number;
  seconds?: number;
}

// ==================== Color Types ====================
export interface ColorValue {
  hex?: string;
  rgb?: { r: number; g: number; b: number; a?: number };
  hsl?: { h: number; s: number; l: number; a?: number };
}

// ==================== Action Types ====================
export interface AlertAction {
  label: string;
  variant?: 'default' | 'primary' | 'danger';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  handler?: (_event: MouseEvent) => void | Promise<void>;
}

export interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'brand';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  handler?: () => void | Promise<void>;
}

export interface ToastItem {
  id: string;
  title?: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}
