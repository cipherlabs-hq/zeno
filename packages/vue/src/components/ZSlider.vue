<template>
  <div :class="sliderClasses">
    <label v-if="label" :for="inputId" class="z-slider__label">
      {{ label }}
    </label>
    <div class="z-slider__container">
      <input
        :id="inputId"
        ref="inputRef"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="currentValue"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedby"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="currentValue"
        class="z-slider__input"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mousemove="handleMouseMove"
      />
      <div class="z-slider__track">
        <div class="z-slider__fill" :style="{ width: `${fillPercentage}%` }" />
      </div>
      <div
        v-if="showTooltip"
        class="z-slider__tooltip"
        :style="{ left: `${fillPercentage}%` }"
      >
        {{ currentValue }}
      </div>
    </div>
    <div v-if="showMinMax" class="z-slider__range">
      <span class="z-slider__min">{{ min }}</span>
      <span class="z-slider__max">{{ max }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ZSliderProps, SliderSize } from '../types/forms';
import type { ZSliderEmits } from '../types/events';

// Re-export types for backward compatibility
export type { ZSliderProps, SliderSize, ZSliderEmits };

const props = withDefaults(defineProps<ZSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  size: 'md',
  disabled: false,
  required: false,
  showTooltip: false,
  showMinMax: false,
});

const emit = defineEmits<ZSliderEmits>();

const inputRef = ref<HTMLInputElement>();
const inputId = computed(
  () => props.id || `slider-${Math.random().toString(36).slice(2)}`
);
const isDragging = ref(false);

const isControlled = computed(() => props.modelValue !== undefined);
const currentValue = computed(() => {
  const val = isControlled.value ? props.modelValue : props.value;
  return val ?? props.min;
});

const fillPercentage = computed(() => {
  const range = props.max - props.min;
  const position = currentValue.value - props.min;
  return Math.max(0, Math.min(100, (position / range) * 100));
});

const showTooltip = computed(() => props.showTooltip || isDragging.value);

const sliderClasses = computed(() => [
  'z-slider',
  `z-slider--${props.size}`,
  {
    'z-slider--disabled': props.disabled,
    'z-slider--dragging': isDragging.value,
  },
]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = parseFloat(target.value);

  if (isControlled.value) {
    emit('update:modelValue', newValue);
  }

  emit('input', event, newValue);
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const newValue = parseFloat(target.value);
  emit('change', event, newValue);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isDragging.value = false;
  emit('blur', event);
};

const handleMouseDown = () => {
  isDragging.value = true;
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;

  // Update tooltip position during drag
  event.preventDefault();
};

// Expose methods for programmatic control
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped>
.z-slider {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-2);
  position: relative;
}

.z-slider__label {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
}

.z-slider--sm .z-slider__label {
  font-size: 0.75rem;
}

.z-slider--lg .z-slider__label {
  font-size: 1rem;
}

.z-slider__container {
  position: relative;
  width: 100%;
}

.z-slider__input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.z-slider--disabled .z-slider__input {
  cursor: not-allowed;
}

.z-slider__track {
  position: relative;
  width: 100%;
  background: var(--zeno-color-background-subtle);
  border-radius: var(--zeno-radius-full);
  overflow: hidden;
}

.z-slider--sm .z-slider__track {
  height: 4px;
}

.z-slider--md .z-slider__track {
  height: 6px;
}

.z-slider--lg .z-slider__track {
  height: 8px;
}

.z-slider__fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: var(--zeno-color-accent-solid);
  border-radius: inherit;
  transition: width var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-slider__input:focus + .z-slider__track {
  box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
}

.z-slider--disabled .z-slider__track {
  opacity: 0.6;
}

.z-slider--disabled .z-slider__fill {
  background: var(--zeno-color-background-muted);
}

.z-slider__tooltip {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: var(--zeno-spacing-2);
  padding: var(--zeno-spacing-1) var(--zeno-spacing-2);
  background: var(--zeno-color-background-inverse);
  color: var(--zeno-color-text-inverse);
  font-size: 0.75rem;
  border-radius: var(--zeno-radius-md);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  opacity: 0;
  transition: opacity var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-slider__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--zeno-color-background-inverse);
}

.z-slider--dragging .z-slider__tooltip,
.z-slider__input:focus + .z-slider__track + .z-slider__tooltip {
  opacity: 1;
}

.z-slider__range {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--zeno-color-text-secondary);
  margin-top: var(--zeno-spacing-1);
}

.z-slider--sm .z-slider__range {
  font-size: 0.6875rem;
}

.z-slider--lg .z-slider__range {
  font-size: 0.875rem;
}

/* Custom thumb styles */
.z-slider__input::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--zeno-color-accent-solid);
  border: 2px solid var(--zeno-color-background-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  z-index: 3;
}

.z-slider--sm .z-slider__input::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
}

.z-slider--lg .z-slider__input::-webkit-slider-thumb {
  width: 24px;
  height: 24px;
}

.z-slider__input::-moz-range-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--zeno-color-accent-solid);
  border: 2px solid var(--zeno-color-background-surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.z-slider--disabled .z-slider__input::-webkit-slider-thumb,
.z-slider--disabled .z-slider__input::-moz-range-thumb {
  background: var(--zeno-color-background-muted);
  cursor: not-allowed;
}

/* Error state */
.z-slider--error .z-slider__track {
  border: 1px solid var(--zeno-color-danger-solid);
}

.z-slider--error .z-slider__input:focus + .z-slider__track {
  border-color: var(--zeno-color-danger-solid);
  box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle);
}
</style>
