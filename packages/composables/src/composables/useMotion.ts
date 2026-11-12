import {
  type MotionOptions,
  DEFAULT_ENTER_CONFIG,
  DEFAULT_EXIT_CONFIG,
  getDuration,
  getEasing,
  parseDuration,
} from '@usezeno/core';

/**
 * Enter animation configuration
 */
export interface EnterOptions extends MotionOptions {
  /** Initial transform for enter animation */
  from?: {
    opacity?: number;
    translateX?: string;
    translateY?: string;
    scale?: number;
  };
}

/**
 * Exit animation configuration
 */
export interface ExitOptions extends MotionOptions {
  /** Final transform for exit animation */
  to?: {
    opacity?: number;
    translateX?: string;
    translateY?: string;
    scale?: number;
  };
}

/**
 * Vue transition hooks interface
 */
export interface TransitionHooks {
  onBeforeEnter: (_el: Element) => void;
  onEnter: (_el: Element, _done: () => void) => void;
  onLeave: (_el: Element, _done: () => void) => void;
}

/**
 * Return type for useMotion composable
 */
export interface UseMotionReturn extends TransitionHooks {
  enter: (_el: Element, _options?: EnterOptions) => Promise<void>;
  exit: (_el: Element, _options?: ExitOptions) => Promise<void>;
}

/**
 * Apply CSS transform and transition to element
 */
function applyTransition(
  el: Element,
  transform: string,
  options: MotionOptions
): void {
  const htmlEl = el as HTMLElement;
  const duration = getDuration(options.duration || 300);
  const easing = getEasing(options.easing || 'ease-out');
  const delay = options.delay || 0;

  htmlEl.style.transform = transform;
  htmlEl.style.transition = `all ${duration} ${easing} ${delay}ms`;
}

/**
 * Motion composable that provides enter/exit animations using Vue transitions
 * and Zeno design token motion values.
 *
 * Features:
 * - Uses motion design tokens for duration and easing
 * - Physics-based animations with smooth transitions
 * - Configurable transform properties
 * - Vue Transition component integration
 *
 * @param defaultOptions - Default animation options
 * @returns Motion utilities and transition hooks
 *
 * @example
 * ```vue
 * <template>
 *   <Transition
 *     @before-enter="onBeforeEnter"
 *     @enter="onEnter"
 *     @leave="onLeave"
 *   >
 *     <div v-if="visible" class="card">
 *       Animated content
 *     </div>
 *   </Transition>
 * </template>
 *
 * <script setup>
 * import { ref } from 'vue';
 * import { useMotion } from '@usezeno/composables';
 *
 * const visible = ref(false);
 * const { enter, exit, onBeforeEnter, onEnter, onLeave } = useMotion();
 * </script>
 * ```
 */
export function useMotion(defaultOptions: MotionOptions = {}) {
  const defaultEnterOptions: EnterOptions = {
    ...DEFAULT_ENTER_CONFIG,
    from: {
      opacity: 0,
      translateY: '20px',
      scale: 0.95,
    },
    ...defaultOptions,
  };

  const defaultExitOptions: ExitOptions = {
    ...DEFAULT_EXIT_CONFIG,
    to: {
      opacity: 0,
      translateY: '-10px',
      scale: 0.98,
    },
    ...defaultOptions,
  };

  /**
   * Execute enter animation on element
   */
  const enter = (el: Element, options: EnterOptions = {}): Promise<void> => {
    return new Promise(resolve => {
      const opts: EnterOptions & Required<MotionOptions> = {
        ...defaultEnterOptions,
        ...options,
        duration:
          options.duration ??
          defaultEnterOptions.duration ??
          DEFAULT_ENTER_CONFIG.duration,
        easing:
          options.easing ??
          defaultEnterOptions.easing ??
          DEFAULT_ENTER_CONFIG.easing,
        delay:
          options.delay ??
          defaultEnterOptions.delay ??
          DEFAULT_ENTER_CONFIG.delay,
      };
      const htmlEl = el as HTMLElement;

      // Set initial state
      if (opts.from) {
        const {
          opacity = 1,
          translateX = '0',
          translateY = '0',
          scale = 1,
        } = opts.from;
        htmlEl.style.opacity = opacity.toString();
        htmlEl.style.transform = `translateX(${translateX}) translateY(${translateY}) scale(${scale})`;
      }

      // Trigger reflow
      void htmlEl.offsetHeight;

      // Apply enter transition
      applyTransition(el, 'translateX(0) translateY(0) scale(1)', opts);
      htmlEl.style.opacity = '1';

      // Resolve after animation completes
      const duration = parseDuration(opts.duration);
      setTimeout(resolve, duration + opts.delay);
    });
  };

  /**
   * Execute exit animation on element
   */
  const exit = (el: Element, options: ExitOptions = {}): Promise<void> => {
    return new Promise(resolve => {
      const opts: ExitOptions & Required<MotionOptions> = {
        ...defaultExitOptions,
        ...options,
        duration:
          options.duration ??
          defaultExitOptions.duration ??
          DEFAULT_EXIT_CONFIG.duration,
        easing:
          options.easing ??
          defaultExitOptions.easing ??
          DEFAULT_EXIT_CONFIG.easing,
        delay:
          options.delay ??
          defaultExitOptions.delay ??
          DEFAULT_EXIT_CONFIG.delay,
      };
      const htmlEl = el as HTMLElement;

      // Apply exit transition
      if (opts.to) {
        const {
          opacity = 0,
          translateX = '0',
          translateY = '0',
          scale = 1,
        } = opts.to;
        applyTransition(
          el,
          `translateX(${translateX}) translateY(${translateY}) scale(${scale})`,
          opts
        );
        htmlEl.style.opacity = opacity.toString();
      }

      // Resolve after animation completes
      const duration = parseDuration(opts.duration);
      setTimeout(resolve, duration + opts.delay);
    });
  };

  /**
   * Vue Transition hooks for seamless integration
   */
  const transitionHooks: TransitionHooks = {
    onBeforeEnter: (el: Element) => {
      const htmlEl = el as HTMLElement;
      const {
        opacity = 0,
        translateX = '0',
        translateY = '20px',
        scale = 0.95,
      } = defaultEnterOptions.from || {};

      htmlEl.style.opacity = opacity.toString();
      htmlEl.style.transform = `translateX(${translateX}) translateY(${translateY}) scale(${scale})`;
      htmlEl.style.transition = 'none';
    },

    onEnter: (el: Element, done: () => void) => {
      enter(el, defaultEnterOptions).then(done);
    },

    onLeave: (el: Element, done: () => void) => {
      exit(el, defaultExitOptions).then(done);
    },
  };

  return {
    enter,
    exit,
    ...transitionHooks,
  };
}
