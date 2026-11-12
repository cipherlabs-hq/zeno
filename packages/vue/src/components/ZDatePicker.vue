<template>
  <div :class="datePickerClasses">
    <label v-if="label" :for="inputId" class="z-date-picker__label">
      {{ label }}
      <span
        v-if="required"
        class="z-date-picker__required"
        aria-label="required"
        >*</span
      >
    </label>

    <div class="z-date-picker__wrapper">
      <Datepicker
        :id="inputId"
        ref="datePickerRef"
        :model-value="currentValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :clearable="clearable"
        :close-on-scroll="closeOnScroll"
        :auto-apply="autoApply"
        :enable-time-picker="enableTimePicker"
        :time-picker="timePickerOnly"
        :range="range"
        :multi-calendars="multiCalendars"
        :inline="inline"
        :locale="locale"
        :format="formatString"
        :preview-format="previewFormat"
        :text-input="textInput"
        :select-text="selectText"
        :now-button-label="nowButtonLabel"
        :min-date="minDate"
        :max-date="maxDate"
        :start-date="startDate"
        :month-change-on-scroll="monthChangeOnScroll"
        :week-start="weekStart"
        :menu-class-name="menuClassName"
        :calendar-class-name="calendarClassName"
        :input-class-name="inputClassName"
        :teleport="teleport"
        :teleport-center="teleportCenter"
        :vertical="vertical"
        :offset="offset"
        :hide-offset-dates="hideOffsetDates"
        :position="position"
        :dark="isDark"
        :utc="utc"
        :timezone="timezone"
        :aria-label="ariaLabel"
        @update:model-value="handleDateChange"
        @open="handleOpen"
        @close="handleClose"
        @focus="handleFocus"
        @blur="handleBlur"
        @cleared="handleCleared"
        @text-submit="handleTextSubmit"
        @invalid-select="handleInvalidSelect"
        @internal-model-change="handleInternalModelChange"
      >
        <template v-if="hasInputIcon" #input-icon>
          <slot name="input-icon" />
        </template>

        <template v-if="hasClearIcon" #clear-icon>
          <slot name="clear-icon" />
        </template>

        <template v-if="hasCalendarIcon" #calendar-icon>
          <slot name="calendar-icon" />
        </template>

        <template
          v-if="hasActionRow"
          #action-row="{ internalModelValue, selectDate }"
        >
          <slot
            name="action-row"
            :internal-model-value="internalModelValue"
            :select-date="selectDate"
          />
        </template>
      </Datepicker>
    </div>

    <div v-if="error || hint" class="z-date-picker__help">
      <span v-if="error" class="z-date-picker__error">{{ error }}</span>
      <span v-else-if="hint" class="z-date-picker__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, useSlots } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import type { DateValue, ZDatePickerProps } from '../types/forms';
import type { ZDatePickerEmits } from '../types/events';

// Types are imported from centralized location

const props = withDefaults(defineProps<ZDatePickerProps>(), {
  size: 'md',
  disabled: false,
  required: false,
  readonly: false,
  clearable: true,
  closeOnScroll: true,
  autoApply: true,
  enableTimePicker: false,
  timePickerOnly: false,
  range: false,
  multiCalendars: false,
  inline: false,
  locale: 'en',
  textInput: false,
  monthChangeOnScroll: true,
  weekStart: 1,
  teleport: true,
  teleportCenter: false,
  vertical: false,
  offset: 10,
  hideOffsetDates: true,
  position: 'left',
  utc: false,
});

const emit = defineEmits<ZDatePickerEmits>();

// Get slots
const slots = useSlots();

// Slot checks
const hasInputIcon = computed(() => !!slots['input-icon']);
const hasClearIcon = computed(() => !!slots['clear-icon']);
const hasCalendarIcon = computed(() => !!slots['calendar-icon']);
const hasActionRow = computed(() => !!slots['action-row']);

const datePickerRef = ref();
const inputId = computed(
  () => props.id || `date-picker-${Math.random().toString(36).slice(2)}`
);

// Get theme context for dark mode detection
const themeContext = inject('theme', null) as any;
const isDark = computed(() => themeContext?.isDark?.value ?? false);

const currentValue = computed(() => props.modelValue);

const formatString = computed(() => {
  if (typeof props.format === 'string') return props.format;
  if (props.enableTimePicker) return 'MM/dd/yyyy HH:mm';
  if (props.timePickerOnly) return 'HH:mm';
  return 'MM/dd/yyyy';
});

const datePickerClasses = computed(() => [
  'z-date-picker',
  `z-date-picker--${props.size}`,
  {
    'z-date-picker--disabled': props.disabled,
    'z-date-picker--readonly': props.readonly,
    'z-date-picker--error': props.error,
    'z-date-picker--inline': props.inline,
  },
]);

const handleDateChange = (value: DateValue) => {
  emit('update:modelValue', value);
  emit('change', value);
};

const handleOpen = () => {
  emit('open');
};

const handleClose = () => {
  emit('close');
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

const handleCleared = () => {
  emit('cleared');
};

const handleTextSubmit = (value: string, preventDefault: () => void) => {
  emit('text-submit', value, preventDefault);
};

const handleInvalidSelect = (value: Date) => {
  emit('invalid-select', value);
};

const handleInternalModelChange = (value: DateValue) => {
  emit('internal-model-change', value);
};

// Expose methods for programmatic control
defineExpose({
  openMenu: () => datePickerRef.value?.openMenu(),
  closeMenu: () => datePickerRef.value?.closeMenu(),
  clearValue: () => datePickerRef.value?.clearValue(),
  selectDate: (date: Date) => datePickerRef.value?.selectDate(date),
  focus: () => datePickerRef.value?.focus(),
});
</script>

<style scoped>
.z-date-picker {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-1);
}

.z-date-picker__label {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
}

.z-date-picker--sm .z-date-picker__label {
  font-size: 0.75rem;
}

.z-date-picker--lg .z-date-picker__label {
  font-size: 1rem;
}

.z-date-picker__required {
  color: var(--zeno-color-danger-text);
  margin-left: var(--zeno-spacing-1);
}

.z-date-picker__wrapper {
  position: relative;
}

.z-date-picker__help {
  font-size: 0.75rem;
  line-height: 1.4;
}

.z-date-picker__error {
  color: var(--zeno-color-danger-text);
}

.z-date-picker__hint {
  color: var(--zeno-color-text-secondary);
}

/* Custom styles for vue-datepicker to match design tokens */
.z-date-picker :deep(.dp__input) {
  border: 2px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-md);
  background: var(--zeno-color-background-surface);
  color: var(--zeno-color-text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-date-picker--sm :deep(.dp__input) {
  font-size: 0.75rem;
}

.z-date-picker--md :deep(.dp__input) {
  font-size: 0.875rem;
}

.z-date-picker--lg :deep(.dp__input) {
  font-size: 1rem;
}

.z-date-picker :deep(.dp__input::placeholder) {
  color: var(--zeno-color-text-placeholder);
}

.z-date-picker :deep(.dp__input:focus) {
  outline: none;
  border-color: var(--zeno-color-focus-ring);
  box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle);
}

.z-date-picker--disabled :deep(.dp__input) {
  background: var(--zeno-color-background-disabled);
  color: var(--zeno-color-text-disabled);
  cursor: not-allowed;
}

.z-date-picker--readonly :deep(.dp__input) {
  background: var(--zeno-color-background-subtle);
  cursor: default;
}

.z-date-picker--error :deep(.dp__input) {
  border-color: var(--zeno-color-danger-solid);
}

.z-date-picker--error :deep(.dp__input:focus) {
  border-color: var(--zeno-color-danger-solid);
  box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle);
}

/* Override VuePic CSS variables for proper input padding and icon positioning */
.z-date-picker {
  --dp-input-padding: var(--zeno-spacing-3) 45px var(--zeno-spacing-3)
    var(--zeno-spacing-3);
  --dp-input-icon-padding: 45px;
}

.z-date-picker--sm {
  --dp-input-padding: var(--zeno-spacing-2) 40px var(--zeno-spacing-2)
    var(--zeno-spacing-2);
  --dp-input-icon-padding: 40px;
}

.z-date-picker--lg {
  --dp-input-padding: var(--zeno-spacing-4) 50px var(--zeno-spacing-4)
    var(--zeno-spacing-4);
  --dp-input-icon-padding: 50px;
}

/* Calendar dropdown styles */
.z-date-picker :deep(.dp__menu) {
  border: 1px solid var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-lg);
  background: var(--zeno-color-background-surface);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  color: var(--zeno-color-text-primary);
}

.z-date-picker :deep(.dp__calendar_header) {
  color: var(--zeno-color-text-primary);
}

.z-date-picker :deep(.dp__calendar_header_item) {
  color: var(--zeno-color-text-secondary);
  font-weight: var(--zeno-font-weight-medium);
}

.z-date-picker :deep(.dp__calendar_item) {
  color: var(--zeno-color-text-primary);
  border-radius: var(--zeno-radius-sm);
}

.z-date-picker :deep(.dp__cell_inner:hover) {
  background: var(--zeno-color-background-subtle);
  color: var(--zeno-color-text-primary);
}

.z-date-picker :deep(.dp__active_date) {
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-date-picker :deep(.dp__today) {
  border: 1px solid var(--zeno-color-accent-solid);
}

.z-date-picker :deep(.dp__range_start),
.z-date-picker :deep(.dp__range_end) {
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-date-picker :deep(.dp__range_between) {
  background: var(--zeno-color-accent-subtle);
  color: var(--zeno-color-text-primary);
}

.z-date-picker :deep(.dp__disabled) {
  color: var(--zeno-color-text-disabled);
}

.z-date-picker :deep(.dp__overlay_action) {
  color: var(--zeno-color-accent-text);
  border: 1px solid var(--zeno-color-accent-solid);
  border-radius: var(--zeno-radius-md);
  background: transparent;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-date-picker :deep(.dp__overlay_action:hover) {
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-date-picker :deep(.dp__action_button) {
  color: var(--zeno-color-accent-text);
  border: 1px solid var(--zeno-color-accent-solid);
  border-radius: var(--zeno-radius-md);
  background: transparent;
  padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
  font-size: 0.875rem;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-date-picker :deep(.dp__action_button:hover) {
  background: var(--zeno-color-accent-solid);
  color: var(--zeno-color-text-inverse);
}

.z-date-picker :deep(.dp__selection_preview) {
  color: var(--zeno-color-text-secondary);
}

/* Arrow navigation styles */
.z-date-picker :deep(.dp__arrow_top),
.z-date-picker :deep(.dp__arrow_bottom) {
  color: var(--zeno-color-text-secondary);
}

.z-date-picker :deep(.dp__arrow_top:hover),
.z-date-picker :deep(.dp__arrow_bottom:hover) {
  color: var(--zeno-color-text-primary);
  background: var(--zeno-color-background-subtle);
}

/* Icon styles using VuePic's built-in positioning */
.z-date-picker :deep(.dp__input_icon),
.z-date-picker :deep(.dp__clear_icon) {
  color: var(--zeno-color-text-secondary);
}

.z-date-picker :deep(.dp__clear_icon:hover) {
  color: var(--zeno-color-danger-text);
}
</style>
