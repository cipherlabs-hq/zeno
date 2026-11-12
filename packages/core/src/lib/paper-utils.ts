/**
 * Shared utilities for Paper components across frameworks
 */

import type { PaperElevation, PaperRadius } from '../types/components.js';

/**
 * Paper component props interface
 */
export interface PaperProps {
  /** Shadow elevation level (0-5) */
  elevation?: PaperElevation;
  /** Border radius size */
  radius?: PaperRadius;
  /** Whether to show outline border */
  outlined?: boolean;
}

/**
 * Shadow elevation mapping to CSS custom properties with fallbacks
 */
export const PAPER_SHADOW_MAP: Record<PaperElevation, string> = {
  0: 'none',
  1: 'var(--zeno-shadow-sm)',
  2: 'var(--zeno-shadow-md)',
  3: 'var(--zeno-shadow-lg)',
  4: 'var(--zeno-shadow-xl)',
  5: 'var(--zeno-shadow-2xl)',
};

/**
 * Border radius mapping to CSS custom properties with fallbacks
 */
export const PAPER_RADIUS_MAP: Record<PaperRadius, string> = {
  none: '0',
  sm: 'var(--zeno-radius-sm)',
  md: 'var(--zeno-radius-md)',
  lg: 'var(--zeno-radius-lg)',
  xl: 'var(--zeno-radius-xl)',
  full: '9999px',
};

/**
 * Generate paper CSS styles object
 */
export function getPaperStyles(props: PaperProps): Record<string, string> {
  const { elevation = 1, radius = 'md', outlined = false } = props;

  const styles: Record<string, string> = {
    background: 'var(--zeno-color-background-surface)',
    color: 'var(--zeno-color-text-primary)',
    boxShadow: outlined ? 'none' : PAPER_SHADOW_MAP[elevation],
    borderRadius: PAPER_RADIUS_MAP[radius],
    border: outlined ? '1px solid var(--zeno-color-border-default)' : 'none',
    transition:
      'all var(--zeno-motion-duration-md) var(--zeno-motion-easing-ease-out)',
  };

  return styles;
}

/**
 * Generate paper CSS classes array
 */
export function getPaperClasses(
  props: PaperProps,
  prefix: string = 'paper',
  additionalClasses: (string | false | undefined)[] = []
): string[] {
  const { elevation = 1, radius = 'md', outlined = false } = props;

  return [
    `${prefix}`,
    `${prefix}--elevation-${elevation}`,
    `${prefix}--radius-${radius}`,
    outlined && `${prefix}--outlined`,
    ...additionalClasses,
  ].filter(Boolean) as string[];
}

/**
 * Default paper props
 */
export const DEFAULT_PAPER_PROPS: Required<PaperProps> = {
  elevation: 1,
  radius: 'md',
  outlined: false,
};

/**
 * Validate paper props
 */
export function validatePaperProps(props: PaperProps): string[] {
  const errors: string[] = [];

  if (
    props.elevation !== undefined &&
    (props.elevation < 0 || props.elevation > 5)
  ) {
    errors.push('Elevation must be between 0 and 5');
  }

  if (props.radius && !Object.keys(PAPER_RADIUS_MAP).includes(props.radius)) {
    errors.push(
      `Invalid radius: ${props.radius}. Must be one of: ${Object.keys(PAPER_RADIUS_MAP).join(', ')}`
    );
  }

  return errors;
}

/**
 * Paper animation utilities
 */
export const PAPER_ANIMATION = {
  /** Initial state for mount animation */
  initial: {
    opacity: 0,
    transform: 'scale(0.95)',
  },
  /** Final state for mount animation */
  visible: {
    opacity: 1,
    transform: 'scale(1)',
  },
  /** Transition duration */
  duration: 'var(--zeno-motion-duration-md)',
  /** Transition easing */
  easing: 'var(--zeno-motion-easing-ease-out)',
} as const;
