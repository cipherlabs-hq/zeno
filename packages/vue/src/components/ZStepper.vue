<template>
  <div :class="stepperClasses">
    <div class="z-stepper__steps">
      <div
        v-for="(step, index) in steps"
        :key="step.value"
        class="z-stepper__step"
        :class="{
          'z-stepper__step--active': index === currentStep,
          'z-stepper__step--completed': index < currentStep,
          'z-stepper__step--disabled': step.disabled,
          'z-stepper__step--error': step.error,
        }"
      >
        <!-- Step indicator -->
        <div class="z-stepper__indicator">
          <button
            v-if="interactive && !step.disabled"
            type="button"
            class="z-stepper__button"
            :aria-label="`Go to step ${index + 1}: ${step.title}`"
            @click="handleStepClick(index)"
          >
            <span class="z-stepper__indicator-content">
              <slot
                :name="`step-icon-${step.value}`"
                :step="step"
                :index="index"
              >
                <span
                  v-if="step.icon && !isCompleted(index)"
                  class="z-stepper__icon"
                >
                  {{ step.icon }}
                </span>
                <svg
                  v-else-if="isCompleted(index) && !step.error"
                  class="z-stepper__check-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
                <svg
                  v-else-if="step.error"
                  class="z-stepper__error-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  />
                </svg>
                <span v-else class="z-stepper__number">{{ index + 1 }}</span>
              </slot>
            </span>
          </button>
          <div v-else class="z-stepper__static-indicator">
            <span class="z-stepper__indicator-content">
              <slot
                :name="`step-icon-${step.value}`"
                :step="step"
                :index="index"
              >
                <span
                  v-if="step.icon && !isCompleted(index)"
                  class="z-stepper__icon"
                >
                  {{ step.icon }}
                </span>
                <svg
                  v-else-if="isCompleted(index) && !step.error"
                  class="z-stepper__check-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </svg>
                <svg
                  v-else-if="step.error"
                  class="z-stepper__error-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  />
                </svg>
                <span v-else class="z-stepper__number">{{ index + 1 }}</span>
              </slot>
            </span>
          </div>
        </div>

        <!-- Step content -->
        <div v-if="showLabels" class="z-stepper__content">
          <div class="z-stepper__title">{{ step.title }}</div>
          <div v-if="step.description" class="z-stepper__description">
            {{ step.description }}
          </div>
        </div>

        <!-- Connector line -->
        <div
          v-if="index < steps.length - 1"
          class="z-stepper__connector"
          :class="{
            'z-stepper__connector--completed': index < currentStep,
          }"
        />
      </div>
    </div>

    <!-- Step content panels -->
    <div v-if="showContent" class="z-stepper__panels">
      <div
        v-for="(step, index) in steps"
        :key="`panel-${step.value}`"
        class="z-stepper__panel"
        :class="{
          'z-stepper__panel--active': index === currentStep,
        }"
        :hidden="index !== currentStep"
      >
        <slot :name="step.value" :step="step" :index="index">
          <div v-if="step.content">{{ step.content }}</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ZStepperProps as BaseZStepperProps,
  StepperItem as BaseStepperItem,
} from '../types';

// Local StepItem interface with 'value' instead of 'id'
interface StepItem extends Omit<BaseStepperItem, 'id' | 'label'> {
  value: string;
  title: string;
  content?: string;
}

// Extend the base props with additional local props
interface ZStepperProps extends Omit<
  BaseZStepperProps,
  'steps' | 'activeStep'
> {
  modelValue: number;
  steps: StepItem[];
  interactive?: boolean;
  showLabels?: boolean;
  showContent?: boolean;
  allowSkip?: boolean;
}

export interface ZStepperEmits {
  'update:modelValue': [value: number];
  'step-change': [newStep: number, oldStep: number];
  'step-click': [step: StepItem, index: number];
}

const props = withDefaults(defineProps<ZStepperProps>(), {
  modelValue: 0,
  steps: () => [],
  orientation: 'horizontal',
  size: 'md',
  variant: 'default',
  interactive: false,
  showLabels: true,
  showContent: false,
  allowSkip: false,
  clickable: false,
  showNumbers: true,
  linear: false,
  alternativeLabel: false,
});

const emit = defineEmits<ZStepperEmits>();

// Computed
const stepperClasses = computed(() => [
  'z-stepper',
  `z-stepper--${props.orientation}`,
  `z-stepper--${props.size}`,
  `z-stepper--${props.variant}`,
  {
    'z-stepper--interactive': props.interactive,
    'z-stepper--no-labels': !props.showLabels,
  },
]);

const currentStep = computed(() =>
  Math.max(0, Math.min(props.modelValue, props.steps.length - 1))
);

// Methods
const isCompleted = (index: number): boolean => {
  return index < currentStep.value;
};

const canNavigateToStep = (index: number): boolean => {
  if (!props.interactive) return false;
  if (props.steps[index]?.disabled) return false;

  if (props.allowSkip) {
    return true;
  }

  // Only allow navigation to completed steps or the next step
  return index <= currentStep.value + 1;
};

const handleStepClick = (index: number) => {
  if (!canNavigateToStep(index)) return;

  const step = props.steps[index];
  if (!step) return;

  emit('step-click', step, index);

  if (index !== currentStep.value) {
    const oldStep = currentStep.value;
    emit('update:modelValue', index);
    emit('step-change', index, oldStep);
  }
};

// Expose methods
defineExpose({
  next: () => {
    const nextIndex = currentStep.value + 1;
    if (nextIndex < props.steps.length && !props.steps[nextIndex]?.disabled) {
      handleStepClick(nextIndex);
    }
  },
  previous: () => {
    const prevIndex = currentStep.value - 1;
    if (prevIndex >= 0) {
      handleStepClick(prevIndex);
    }
  },
  goToStep: (index: number) => {
    if (canNavigateToStep(index)) {
      handleStepClick(index);
    }
  },
  getCurrentStep: () => currentStep.value,
  isStepCompleted: (index: number) => isCompleted(index),
  canNext: () => currentStep.value < props.steps.length - 1,
  canPrevious: () => currentStep.value > 0,
});
</script>

<style scoped>
.z-stepper {
  display: flex;
  gap: var(--zeno-spacing-4);
}

.z-stepper--horizontal {
  flex-direction: column;
}

.z-stepper--vertical {
  flex-direction: row;
}

.z-stepper__steps {
  display: flex;
  position: relative;
}

.z-stepper--horizontal .z-stepper__steps {
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.z-stepper--vertical .z-stepper__steps {
  flex-direction: column;
  align-items: flex-start;
  min-width: 250px;
}

.z-stepper__step {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.z-stepper--horizontal .z-stepper__step {
  flex-direction: column;
  text-align: center;
  gap: var(--zeno-spacing-2);
}

.z-stepper--vertical .z-stepper__step {
  flex-direction: row;
  text-align: left;
  gap: var(--zeno-spacing-3);
  padding: var(--zeno-spacing-3) 0;
  width: 100%;
}

.z-stepper__indicator {
  position: relative;
  z-index: 2;
}

.z-stepper__button,
.z-stepper__static-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--zeno-color-border-default);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-secondary);
  font-weight: var(--zeno-font-weight-semibold);
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-stepper__button {
  cursor: pointer;

  &:hover:not(:disabled) {
    border-color: var(--zeno-color-accent-solid);
    background: var(--zeno-color-accent-subtle);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
  }
}

.z-stepper--sm .z-stepper__button,
.z-stepper--sm .z-stepper__static-indicator {
  width: 32px;
  height: 32px;
  font-size: 0.75rem;
}

.z-stepper--lg .z-stepper__button,
.z-stepper--lg .z-stepper__static-indicator {
  width: 48px;
  height: 48px;
  font-size: 1.125rem;
}

.z-stepper__indicator-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.z-stepper__number,
.z-stepper__icon {
  font-size: 0.875rem;
  line-height: 1;
}

.z-stepper__check-icon,
.z-stepper__error-icon {
  width: 20px;
  height: 20px;
}

.z-stepper--sm .z-stepper__check-icon,
.z-stepper--sm .z-stepper__error-icon {
  width: 16px;
  height: 16px;
}

.z-stepper--lg .z-stepper__check-icon,
.z-stepper--lg .z-stepper__error-icon {
  width: 24px;
  height: 24px;
}

/* Step states */
.z-stepper__step--active .z-stepper__button,
.z-stepper__step--active .z-stepper__static-indicator {
  border-color: var(--zeno-color-accent-solid);
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-stepper__step--completed .z-stepper__button,
.z-stepper__step--completed .z-stepper__static-indicator {
  border-color: var(--zeno-color-accent-solid);
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-stepper__step--error .z-stepper__button,
.z-stepper__step--error .z-stepper__static-indicator {
  border-color: var(--zeno-color-danger-solid);
  background: var(--zeno-color-danger-solid);
  color: var(--zeno-color-text-inverse);
}

.z-stepper__step--disabled .z-stepper__button,
.z-stepper__step--disabled .z-stepper__static-indicator {
  border-color: var(--zeno-color-border-default);
  background: var(--zeno-color-background-disabled);
  color: var(--zeno-color-text-disabled);
  cursor: not-allowed;
}

.z-stepper__content {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-1);
  max-width: 120px;
}

.z-stepper--vertical .z-stepper__content {
  flex: 1;
  max-width: none;
}

.z-stepper__title {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
  line-height: 1.4;
}

.z-stepper__description {
  font-size: 0.75rem;
  color: var(--zeno-color-text-secondary);
  line-height: 1.4;
}

.z-stepper--sm .z-stepper__title {
  font-size: 0.75rem;
}

.z-stepper--sm .z-stepper__description {
  font-size: 0.6875rem;
}

.z-stepper--lg .z-stepper__title {
  font-size: 1rem;
}

.z-stepper--lg .z-stepper__description {
  font-size: 0.875rem;
}

/* Step states for content */
.z-stepper__step--active .z-stepper__title {
  color: var(--zeno-color-accent-text);
}

.z-stepper__step--completed .z-stepper__title {
  color: var(--zeno-color-accent-text);
  font-weight: var(--zeno-font-weight-semibold);
}

.z-stepper__step--error .z-stepper__title {
  color: var(--zeno-color-danger-text);
}

.z-stepper__step--disabled .z-stepper__title,
.z-stepper__step--disabled .z-stepper__description {
  color: var(--zeno-color-text-disabled);
}

/* Connectors */
.z-stepper__connector {
  position: absolute;
  background: var(--zeno-color-border-default);
  transition: background-color var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-stepper--horizontal .z-stepper__connector {
  top: 20px;
  left: calc(50% + 20px);
  right: calc(-50% + 20px);
  height: 2px;
  transform: translateY(-50%);
}

.z-stepper--vertical .z-stepper__connector {
  top: 40px;
  left: 20px;
  bottom: 0;
  width: 2px;
  transform: translateX(-50%);
}

.z-stepper__connector--completed {
  background: var(--zeno-color-accent-solid);
}

/* Panels */
.z-stepper__panels {
  flex: 1;
}

.z-stepper__panel {
  padding: var(--zeno-spacing-4);

  &:not(&.z-input--active) {
    display: none;
  }

  &.z-input--active {
    display: block;
  }
}

/* Variant styles */
.z-stepper--outline .z-stepper__button,
.z-stepper--outline .z-stepper__static-indicator {
  background: transparent;
}

.z-stepper--outline .z-stepper__step--active .z-stepper__button,
.z-stepper--outline .z-stepper__step--active .z-stepper__static-indicator {
  background: transparent;
  color: var(--zeno-color-accent-text);
}

.z-stepper--solid .z-stepper__button,
.z-stepper--solid .z-stepper__static-indicator {
  border: none;
  background: var(--zeno-color-background-muted);
}

.z-stepper--solid .z-stepper__step--active .z-stepper__button,
.z-stepper--solid .z-stepper__step--active .z-stepper__static-indicator {
  background: var(--zeno-color-accent-solid);
}

.z-stepper--solid .z-stepper__step--completed .z-stepper__button,
.z-stepper--solid .z-stepper__step--completed .z-stepper__static-indicator {
  background: var(--zeno-color-accent-solid);
}

/* No labels variant */
.z-stepper--no-labels.z-stepper--horizontal .z-stepper__step {
  flex: none;
}

.z-stepper--no-labels .z-stepper__connector {
  display: none;
}
</style>
