/**
 * Shared motion configuration and constants
 */

import { tokens } from '@usezeno/tokens';

const { duration, easing } = tokens.motion;

/**
 * Motion duration options mapped to design tokens
 */
export type MotionDuration = 0 | 75 | 150 | 200 | 300 | 500 | 700;

/**
 * Motion easing options mapped to design tokens
 */
export type MotionEasing =
  'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

/**
 * Motion animation options
 */
export interface MotionOptions {
  /** Animation duration in milliseconds */
  duration?: MotionDuration;
  /** Animation easing curve */
  easing?: MotionEasing;
  /** Custom delay before animation starts */
  delay?: number;
}

/**
 * Motion duration mapping using design tokens
 */
export const MOTION_DURATIONS: Record<MotionDuration, string> = {
  0: duration.instant,
  75: duration.xs,
  150: duration.sm,
  200: duration.md,
  300: duration.lg,
  500: duration.xl,
  700: duration['2xl'],
};

/**
 * Motion easing mapping using design tokens
 */
export const MOTION_EASING: Record<MotionEasing, string> = {
  linear: easing.linear,
  ease: easing.ease,
  'ease-in': easing.easeIn,
  'ease-out': easing.easeOut,
  'ease-in-out': easing.easeInOut,
};

/**
 * Default motion configurations for enter animations
 */
export const DEFAULT_ENTER_CONFIG: Required<MotionOptions> = {
  duration: 300,
  easing: 'ease-out',
  delay: 0,
};

/**
 * Default motion configurations for exit animations
 */
export const DEFAULT_EXIT_CONFIG: Required<MotionOptions> = {
  duration: 200,
  easing: 'ease-in',
  delay: 0,
};

/**
 * Default motion configurations for general transitions
 */
export const DEFAULT_TRANSITION_CONFIG: Required<MotionOptions> = {
  duration: 200,
  easing: 'ease',
  delay: 0,
};

/**
 * Get duration value from motion constants
 */
export function getDuration(duration: MotionDuration): string {
  return MOTION_DURATIONS[duration];
}

/**
 * Get easing value from motion constants
 */
export function getEasing(easing: MotionEasing): string {
  return MOTION_EASING[easing];
}

/**
 * Build CSS transition string from motion options
 */
export function buildTransition(options: MotionOptions): string {
  const config = { ...DEFAULT_TRANSITION_CONFIG, ...options };
  return `all ${getDuration(config.duration)} ${getEasing(config.easing)} ${config.delay}ms`;
}

/**
 * Parse duration value to number (for setTimeout usage)
 */
export function parseDuration(duration: MotionDuration): number {
  return parseInt(getDuration(duration).replace('ms', ''), 10);
}
