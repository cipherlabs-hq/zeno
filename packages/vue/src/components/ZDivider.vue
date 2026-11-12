<template>
  <div
    :class="classes"
    role="separator"
    :aria-orientation="orientation"
    :data-label-position="labelPosition"
    v-bind="$attrs"
  >
    <template v-if="hasLabel && orientation === 'horizontal'">
      <span class="z-divider__line z-divider__line--before" />
      <span class="z-divider__label">
        <slot>{{ label }}</slot>
      </span>
      <span class="z-divider__line z-divider__line--after" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type {
  ZDividerProps,
  DividerOrientation,
  DividerVariant,
  DividerSize,
  DividerLabelPosition,
} from '../types/layout';
import { getDividerClasses } from '@usezeno/core';

// Re-export types for backward compatibility
export type {
  ZDividerProps,
  DividerOrientation,
  DividerVariant,
  DividerSize,
  DividerLabelPosition,
};

const props = withDefaults(defineProps<ZDividerProps>(), {
  orientation: 'horizontal',
  variant: 'solid',
  size: 'md',
  labelPosition: 'center',
});

const slots = useSlots();

const hasLabel = computed(() => props.label || slots.default);

const classes = computed(() =>
  getDividerClasses({
    ...props,
    label: hasLabel.value ? 'labeled' : undefined,
  })
);
</script>
