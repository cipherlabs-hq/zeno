/**
 * Shared motion preset configurations for consistent animations across React and Vue
 */

export interface MotionPreset {
  /** Initial state for entering animations */
  initial: {
    opacity?: number;
    x?: number;
    y?: number;
    scale?: number;
  };
  /** Final state for exiting animations */
  exit: {
    opacity?: number;
    x?: number;
    y?: number;
    scale?: number;
  };
}

/**
 * Standard motion presets using design system values
 */
export const MOTION_PRESETS: Record<string, MotionPreset> = {
  'slide-up': {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  },
  'slide-down': {
    initial: { opacity: 0, y: -30, scale: 0.95 },
    exit: { opacity: 0, y: 15, scale: 0.98 },
  },
  'slide-left': {
    initial: { opacity: 0, x: 40, scale: 0.95 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
  },
  'slide-right': {
    initial: { opacity: 0, x: -40, scale: 0.95 },
    exit: { opacity: 0, x: 20, scale: 0.98 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    exit: { opacity: 0, scale: 1.1 },
  },
  fade: {
    initial: { opacity: 0 },
    exit: { opacity: 0 },
  },
  default: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
  },
};

/**
 * Gallery preset definitions with metadata
 */
export interface GalleryPreset {
  id: string;
  label: string;
  preset: keyof typeof MOTION_PRESETS;
  emoji: string;
}

/**
 * Standard gallery presets for motion demonstrations
 */
export const GALLERY_PRESETS: GalleryPreset[] = [
  { id: 'slideUp', label: 'Slide Up', preset: 'slide-up', emoji: '↗️' },
  { id: 'slideDown', label: 'Slide Down', preset: 'slide-down', emoji: '↙️' },
  { id: 'slideLeft', label: 'Slide Left', preset: 'slide-left', emoji: '⬅️' },
  {
    id: 'slideRight',
    label: 'Slide Right',
    preset: 'slide-right',
    emoji: '➡️',
  },
  { id: 'scale', label: 'Scale', preset: 'scale', emoji: '🔍' },
  { id: 'fade', label: 'Fade', preset: 'fade', emoji: '✨' },
];

/**
 * Get motion preset configuration by name
 */
export function getMotionPreset(presetName: string): MotionPreset {
  return MOTION_PRESETS[presetName] || MOTION_PRESETS['default'];
}

/**
 * Convert motion preset values to Vue-compatible string format
 */
export function toVueTransform(
  config: MotionPreset['initial'] | MotionPreset['exit']
) {
  return {
    opacity: config.opacity,
    translateX: config.x ? `${config.x}px` : '0',
    translateY: config.y ? `${config.y}px` : '0',
    scale: config.scale || 1,
  };
}

/**
 * Build CSS transform string from motion values
 */
export function buildTransform(x = 0, y = 0, scale = 1): string {
  return `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

/**
 * Build Vue-style transform string from motion values
 */
export function buildVueTransform(
  translateX = '0',
  translateY = '0',
  scale = 1
): string {
  return `translateX(${translateX}) translateY(${translateY}) scale(${scale})`;
}
