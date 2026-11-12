// Common subset of Lucide icons used across components
export type IconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'check'
  | 'x'
  | 'plus'
  | 'minus'
  | 'search'
  | 'home'
  | 'user'
  | 'settings'
  | 'menu'
  | 'more-horizontal'
  | 'more-vertical'
  | 'edit'
  | 'trash-2'
  | 'copy'
  | 'external-link'
  | 'download'
  | 'upload'
  | 'file'
  | 'folder'
  | 'image'
  | 'star'
  | 'heart'
  | 'eye'
  | 'eye-off'
  | 'lock'
  | 'unlock'
  | 'mail'
  | 'phone'
  | 'calendar'
  | 'clock'
  | 'sun'
  | 'moon'
  | 'info'
  | 'alert-circle'
  | 'alert-triangle'
  | 'check-circle'
  | 'x-circle'
  | 'help-circle'
  | 'loader'
  | 'refresh-cw'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right';

import type { IconSize } from '../types/components.js';

export interface ZIconProps {
  name: IconName;
  size?: IconSize | string | number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const getIconSize = (size: IconSize | string | number): number => {
  if (typeof size === 'number') return size;

  const sizeMap: Record<IconSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  };

  // Handle IconSize values
  if (size in sizeMap) {
    return sizeMap[size as IconSize];
  }

  // For arbitrary strings, try to parse as number or return default
  const parsed = parseInt(size as string, 10);
  return isNaN(parsed) ? sizeMap['md'] : parsed;
};

export const getIconClasses = (props: {
  className?: string;
  size?: IconSize | string | number;
}): string => {
  const { className = '', size } = props;

  const baseClass = 'zeno-icon';
  const classes = [baseClass];

  if (typeof size === 'string') {
    classes.push(`${baseClass}--${size}`);
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};
