import type {
  DividerOrientation,
  DividerVariant,
} from '../types/components.js';

// Vue-specific divider size type
export type DividerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface DividerProps {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  size?: DividerSize;
  className?: string;
  label?: string;
  labelPosition?: 'start' | 'center' | 'end';
}

export const getDividerClasses = (props: DividerProps): string => {
  const {
    orientation = 'horizontal',
    variant = 'solid',
    size = 'md',
    className = '',
    label,
  } = props;

  const baseClass = 'zeno-divider';
  const classes = [
    baseClass,
    `${baseClass}--${orientation}`,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
  ];

  if (label) {
    classes.push(`${baseClass}--labeled`);
  }

  if (className) {
    classes.push(className);
  }

  return classes.join(' ');
};
