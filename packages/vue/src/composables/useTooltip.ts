import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  readonly,
  type Ref,
  type ComputedRef,
} from 'vue';

export interface TooltipPosition {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export interface UseTooltipOptions {
  delay?: number;
  offset?: number;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface UseTooltipReturn {
  isVisible: Readonly<Ref<boolean>>;
  position: Readonly<Ref<TooltipPosition>>;
  tooltipId: string;
  show: () => void;
  hide: () => void;
  triggerRef: Ref<HTMLElement | null>;
  tooltipRef: Ref<HTMLElement | null>;
  triggerProps: ComputedRef<Record<string, unknown>>;
  tooltipProps: ComputedRef<Record<string, string | boolean>>;
}

let tooltipCounter = 0;

export function useTooltip(options: UseTooltipOptions = {}): UseTooltipReturn {
  const { delay = 200, offset = 8, placement = 'auto' } = options;

  const isVisible = ref(false);
  const position = ref<TooltipPosition>({
    x: -9999,
    y: -9999,
    placement: 'top',
  });
  const triggerRef = ref<HTMLElement | null>(null);
  const tooltipRef = ref<HTMLElement | null>(null);
  const tooltipId = `tooltip-${++tooltipCounter}`;

  let showTimeout: number | null = null;
  let hideTimeout: number | null = null;

  const calculatePosition = () => {
    if (!triggerRef.value || !tooltipRef.value) return;

    // Get the actual trigger element (might be a child of the wrapper)
    const trigger = triggerRef.value.getBoundingClientRect();
    const tooltip = tooltipRef.value.getBoundingClientRect();

    // If tooltip doesn't have dimensions yet, use a default size for calculation
    const tooltipWidth = tooltip.width || 120;
    const tooltipHeight = tooltip.height || 40;

    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let finalPlacement: 'top' | 'bottom' | 'left' | 'right' =
      placement === 'auto' ? 'top' : placement;
    let x = 0;
    let y = 0;

    // Auto-placement logic
    if (placement === 'auto') {
      const spaceTop = trigger.top;
      const spaceBottom = viewport.height - trigger.bottom;
      const spaceLeft = trigger.left;
      const spaceRight = viewport.width - trigger.right;

      if (spaceTop >= tooltipHeight + offset) {
        finalPlacement = 'top';
      } else if (spaceBottom >= tooltipHeight + offset) {
        finalPlacement = 'bottom';
      } else if (spaceRight >= tooltipWidth + offset) {
        finalPlacement = 'right';
      } else if (spaceLeft >= tooltipWidth + offset) {
        finalPlacement = 'left';
      } else {
        // Fallback to the side with most space
        finalPlacement = spaceTop > spaceBottom ? 'top' : 'bottom';
      }
    }

    // Position calculation using fixed positioning (relative to viewport)
    switch (finalPlacement) {
      case 'top':
        x = trigger.left + trigger.width / 2 - tooltipWidth / 2;
        y = trigger.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = trigger.left + trigger.width / 2 - tooltipWidth / 2;
        y = trigger.bottom + offset;
        break;
      case 'left':
        x = trigger.left - tooltipWidth - offset;
        y = trigger.top + trigger.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = trigger.right + offset;
        y = trigger.top + trigger.height / 2 - tooltipHeight / 2;
        break;
    }

    // Viewport constraints
    x = Math.max(8, Math.min(x, viewport.width - tooltipWidth - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipHeight - 8));

    position.value = { x, y, placement: finalPlacement };
  };

  const show = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }

    showTimeout = window.setTimeout(async () => {
      isVisible.value = true;
      await nextTick();
      calculatePosition();
      // Recalculate after a brief delay to account for any layout changes
      setTimeout(calculatePosition, 16); // One frame at 60fps
    }, delay);
  };

  const hide = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }

    hideTimeout = window.setTimeout(() => {
      isVisible.value = false;
    }, delay);
  };

  const handleMouseEnter = () => show();
  const handleMouseLeave = () => hide();
  const handleFocus = () => show();
  const handleBlur = () => hide();
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hide();
    }
  };

  const triggerProps = computed(() => ({
    'aria-describedby': isVisible.value ? tooltipId : undefined,
    onMouseenter: handleMouseEnter,
    onMouseleave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onKeydown: handleKeydown,
  }));

  const tooltipProps = computed(() => ({
    id: tooltipId,
    role: 'tooltip',
    'aria-hidden': !isVisible.value,
  }));

  onMounted(() => {
    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);
  });

  onUnmounted(() => {
    if (showTimeout) clearTimeout(showTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);
    window.removeEventListener('scroll', calculatePosition, true);
    window.removeEventListener('resize', calculatePosition);
  });

  return {
    isVisible: readonly(isVisible),
    position: readonly(position),
    tooltipId,
    show,
    hide,
    triggerRef,
    tooltipRef,
    triggerProps,
    tooltipProps,
  };
}
