<template>
  <div :class="fileUploadClasses">
    <label v-if="label" :for="inputId" class="z-file-upload__label">
      {{ label }}
      <span
        v-if="required"
        class="z-file-upload__required"
        aria-label="required"
        >*</span
      >
    </label>

    <div
      class="z-file-upload__dropzone"
      :class="{
        'z-file-upload__dropzone--dragover': isDragOver,
        'z-file-upload__dropzone--disabled': disabled,
        'z-file-upload__dropzone--error': error,
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="handleClick"
    >
      <input
        :id="inputId"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        :required="required"
        :aria-describedby="ariaDescribedby"
        class="z-file-upload__input"
        @change="handleFileSelect"
      />

      <div v-if="!files.length" class="z-file-upload__placeholder">
        <svg
          class="z-file-upload__icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
          />
          <polyline points="14,2 14,8 20,8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        <div class="z-file-upload__text">
          <span class="z-file-upload__primary">
            {{
              isDragOver
                ? 'Drop files here'
                : 'Click to upload or drag and drop'
            }}
          </span>
          <span v-if="accept" class="z-file-upload__secondary">
            {{ acceptText }}
          </span>
          <span v-if="maxSize" class="z-file-upload__secondary">
            Max file size: {{ formatFileSize(maxSize) }}
          </span>
        </div>
      </div>

      <div v-else class="z-file-upload__files">
        <div
          v-for="(file, index) in files"
          :key="`${file.name}-${index}`"
          class="z-file-upload__file"
        >
          <div
            v-if="showPreview && isImageFile(file)"
            class="z-file-upload__preview"
          >
            <img
              :src="getFilePreview(file)"
              :alt="file.name"
              class="z-file-upload__preview-image"
            />
          </div>
          <div v-else class="z-file-upload__file-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
              />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div class="z-file-upload__file-info">
            <span class="z-file-upload__file-name">{{ file.name }}</span>
            <span class="z-file-upload__file-size">{{
              formatFileSize(file.size)
            }}</span>
          </div>
          <button
            type="button"
            class="z-file-upload__remove"
            :aria-label="`Remove ${file.name}`"
            @click.stop="removeFile(index)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div v-if="error || hint" class="z-file-upload__help">
      <span v-if="error" class="z-file-upload__error">{{ error }}</span>
      <span v-else-if="hint" class="z-file-upload__hint">{{ hint }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue';
import type { ZFileUploadProps } from '../types/advanced';
import type { ZFileUploadEmits } from '../types/events';

// Types are imported from centralized location

const props = withDefaults(defineProps<ZFileUploadProps>(), {
  multiple: false,
  size: 'md',
  disabled: false,
  required: false,
  showPreview: true,
  maxFiles: 10,
});

const emit = defineEmits<ZFileUploadEmits>();

const fileInputRef = ref<HTMLInputElement>();
const inputId = computed(
  () => props.id || `file-upload-${Math.random().toString(36).slice(2)}`
);
const isDragOver = ref(false);
const dragCounter = ref(0);
const previewUrls = ref<Map<File, string>>(new Map());

const files = computed(() => {
  if (!props.modelValue) return [];
  if (Array.isArray(props.modelValue)) return props.modelValue;
  return [props.modelValue];
});

const acceptText = computed(() => {
  if (!props.accept) return '';

  const types = props.accept.split(',').map(type => type.trim());
  const extensions = types.filter(type => type.startsWith('.'));
  const mimeTypes = types.filter(type => !type.startsWith('.'));

  if (extensions.length > 0) {
    return `Accepted formats: ${extensions.join(', ')}`;
  }

  if (mimeTypes.includes('image/*')) {
    return 'Images only';
  }

  return '';
});

const fileUploadClasses = computed(() => [
  'z-file-upload',
  `z-file-upload--${props.size}`,
  {
    'z-file-upload--disabled': props.disabled,
    'z-file-upload--error': props.error,
  },
]);

const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFilePreview = (file: File): string => {
  if (previewUrls.value.has(file)) {
    return previewUrls.value.get(file)!;
  }

  const url = URL.createObjectURL(file);
  previewUrls.value.set(file, url);
  return url;
};

const validateFile = (file: File): string | null => {
  if (props.maxSize && file.size > props.maxSize) {
    return `File "${file.name}" is too large. Maximum size is ${formatFileSize(props.maxSize)}.`;
  }

  if (props.accept) {
    const acceptedTypes = props.accept.split(',').map(type => type.trim());
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isAccepted) {
      return `File "${file.name}" is not an accepted file type.`;
    }
  }

  return null;
};

const updateModelValue = (newFiles: File[]) => {
  if (props.multiple) {
    emit('update:modelValue', newFiles);
  } else {
    emit('update:modelValue', newFiles.length > 0 ? newFiles[0] : null);
  }
};

const addFiles = (newFiles: File[]) => {
  const currentFiles = [...files.value];

  for (const file of newFiles) {
    const error = validateFile(file);
    if (error) {
      emit('file-error', error, file);
      continue;
    }

    if (props.maxFiles && currentFiles.length >= props.maxFiles) {
      emit('file-error', `Maximum ${props.maxFiles} files allowed.`, file);
      continue;
    }

    currentFiles.push(file);
    emit('file-added', file);
  }

  updateModelValue(currentFiles);
};

const removeFile = (index: number) => {
  const currentFiles = [...files.value];
  const removedFile = currentFiles[index];

  // Clean up preview URL
  if (previewUrls.value.has(removedFile)) {
    URL.revokeObjectURL(previewUrls.value.get(removedFile)!);
    previewUrls.value.delete(removedFile);
  }

  currentFiles.splice(index, 1);
  emit('file-removed', removedFile, index);
  updateModelValue(currentFiles);
};

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const newFiles = Array.from(input.files);
    addFiles(newFiles);
    emit('change', event, newFiles);
  }

  // Reset input value to allow selecting the same file again
  input.value = '';
};

const handleClick = () => {
  if (!props.disabled) {
    fileInputRef.value?.click();
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value++;
  isDragOver.value = true;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value--;
  if (dragCounter.value === 0) {
    isDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragCounter.value = 0;
  isDragOver.value = false;

  if (props.disabled) return;

  const droppedFiles = Array.from(event.dataTransfer?.files || []);
  if (droppedFiles.length > 0) {
    addFiles(droppedFiles);
    emit('change', event as any, droppedFiles);
  }
};

// Clean up preview URLs on unmount
onUnmounted(() => {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url));
  previewUrls.value.clear();
});

// Expose methods for programmatic control
defineExpose({
  openFilePicker: () => fileInputRef.value?.click(),
  clearFiles: () => updateModelValue([]),
});
</script>

<style scoped>
.z-file-upload {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-2);
}

.z-file-upload__label {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
}

.z-file-upload--sm .z-file-upload__label {
  font-size: 0.75rem;
}

.z-file-upload--lg .z-file-upload__label {
  font-size: 1rem;
}

.z-file-upload__required {
  color: var(--zeno-color-danger-text);
  margin-left: var(--zeno-spacing-1);
}

.z-file-upload__dropzone {
  position: relative;
  border: 2px dashed var(--zeno-color-border-default);
  border-radius: var(--zeno-radius-lg);
  background: var(--zeno-color-background-surface);
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
  cursor: pointer;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.z-file-upload--sm .z-file-upload__dropzone {
  min-height: 80px;
}

.z-file-upload--lg .z-file-upload__dropzone {
  min-height: 160px;
}

.z-file-upload__dropzone:hover:not(.z-file-upload__dropzone--disabled) {
  border-color: var(--zeno-color-focus-ring);
  background: var(--zeno-color-background-subtle);
}

.z-file-upload__dropzone--dragover {
  border-color: var(--zeno-color-accent-solid);
  background: var(--zeno-color-accent-subtle);
}

.z-file-upload__dropzone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: var(--zeno-color-background-disabled);
}

.z-file-upload__dropzone--error {
  border-color: var(--zeno-color-danger-solid);
}

.z-file-upload__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
}

.z-file-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--zeno-spacing-3);
  text-align: center;
  padding: var(--zeno-spacing-4);
}

.z-file-upload__icon {
  color: var(--zeno-color-text-secondary);
}

.z-file-upload--sm .z-file-upload__icon {
  width: 32px;
  height: 32px;
}

.z-file-upload--lg .z-file-upload__icon {
  width: 64px;
  height: 64px;
}

.z-file-upload__text {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-1);
}

.z-file-upload__primary {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
}

.z-file-upload--sm .z-file-upload__primary {
  font-size: 0.75rem;
}

.z-file-upload--lg .z-file-upload__primary {
  font-size: 1rem;
}

.z-file-upload__secondary {
  font-size: 0.75rem;
  color: var(--zeno-color-text-secondary);
}

.z-file-upload__files {
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-2);
  padding: var(--zeno-spacing-3);
  width: 100%;
}

.z-file-upload__file {
  display: flex;
  align-items: center;
  gap: var(--zeno-spacing-3);
  padding: var(--zeno-spacing-2);
  background: var(--zeno-color-background-subtle);
  border-radius: var(--zeno-radius-md);
  border: 1px solid var(--zeno-color-border-default);
}

.z-file-upload__preview {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: var(--zeno-radius-md);
  overflow: hidden;
  background: var(--zeno-color-background-muted);
}

.z-file-upload--sm .z-file-upload__preview {
  width: 32px;
  height: 32px;
}

.z-file-upload--lg .z-file-upload__preview {
  width: 64px;
  height: 64px;
}

.z-file-upload__preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.z-file-upload__file-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: var(--zeno-color-text-secondary);
  background: var(--zeno-color-background-muted);
  border-radius: var(--zeno-radius-md);
}

.z-file-upload--sm .z-file-upload__file-icon {
  width: 32px;
  height: 32px;
}

.z-file-upload--lg .z-file-upload__file-icon {
  width: 64px;
  height: 64px;
}

.z-file-upload__file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--zeno-spacing-1);
  min-width: 0;
}

.z-file-upload__file-name {
  font-size: 0.875rem;
  font-weight: var(--zeno-font-weight-medium);
  color: var(--zeno-color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.z-file-upload__file-size {
  font-size: 0.75rem;
  color: var(--zeno-color-text-secondary);
}

.z-file-upload__remove {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--zeno-color-text-secondary);
  border-radius: var(--zeno-radius-sm);
  cursor: pointer;
  transition: all var(--zeno-motion-duration-md)
    var(--zeno-motion-easing-ease-out);
}

.z-file-upload__remove:hover {
  background: var(--zeno-color-danger-subtle);
  color: var(--zeno-color-danger-text);
}

.z-file-upload__help {
  font-size: 0.75rem;
  line-height: 1.4;
}

.z-file-upload__error {
  color: var(--zeno-color-danger-text);
}

.z-file-upload__hint {
  color: var(--zeno-color-text-secondary);
}
</style>
