import type { BreadcrumbItem } from '../types/data.js';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  separator?: unknown; // ReactNode for React, VNode for Vue
  className?: string;
}

export const getBreadcrumbClasses = (props: { className?: string }): string => {
  const { className = '' } = props;

  const baseClass = 'zeno-breadcrumb';
  const classes = [baseClass];

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};

export const processBreadcrumbItems = (
  items: BreadcrumbItem[],
  maxItems: number = 4
): { visibleItems: BreadcrumbItem[]; hasCollapsed: boolean } => {
  if (items.length <= maxItems) {
    return { visibleItems: items, hasCollapsed: false };
  }

  // Keep first item, ellipsis, and last (maxItems - 2) items
  const firstItem = items[0];
  const lastItems = items.slice(-(maxItems - 2));

  return {
    visibleItems: [firstItem, ...lastItems],
    hasCollapsed: true,
  };
};
