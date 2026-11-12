<template>
  <div class="z-avatar-container" :style="containerStyles">
    <div :class="avatarClasses" :style="avatarStyles">
      <img
        v-if="src && !imageError"
        :src="src"
        :alt="alt || name"
        @error="handleImageError"
        @load="handleImageLoad"
      />
      <span
        v-else-if="initials"
        class="z-avatar__initials"
        :style="initialsStyles"
      >
        {{ initials }}
      </span>
      <component
        :is="UserIcon"
        v-else
        :size="iconSize"
        :stroke-width="1.5"
        class="z-avatar__fallback"
      />
    </div>
    <span
      v-if="status !== 'none'"
      class="z-avatar__status"
      :style="statusStyles"
      :aria-label="`Status: ${status}`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { User as UserIcon } from 'lucide-vue-next';
import type {
  ZAvatarProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
} from '../types/data';

// Re-export types for backward compatibility
export type { ZAvatarProps, AvatarSize, AvatarShape, AvatarStatus };

const props = withDefaults(defineProps<ZAvatarProps>(), {
  size: 'md',
  shape: 'circle',
  status: 'none',
  showBorder: true,
});

const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

const handleImageLoad = () => {
  imageError.value = false;
};

const initials = computed(() => {
  if (!props.name) return '';
  return props.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const sizeMap = {
  xs: { size: '32px', fontSize: '12px', borderWidth: '2px', statusSize: '8px' },
  sm: {
    size: '40px',
    fontSize: '14px',
    borderWidth: '2px',
    statusSize: '10px',
  },
  md: {
    size: '48px',
    fontSize: '16px',
    borderWidth: '3px',
    statusSize: '12px',
  },
  lg: {
    size: '64px',
    fontSize: '20px',
    borderWidth: '3px',
    statusSize: '14px',
  },
  xl: {
    size: '80px',
    fontSize: '24px',
    borderWidth: '4px',
    statusSize: '16px',
  },
};

const statusColors = {
  online: 'var(--zeno-color-success-solid)',
  offline: 'var(--zeno-color-neutral-border)',
  away: 'var(--zeno-color-warning-solid)',
  busy: 'var(--zeno-color-danger-solid)',
  none: 'transparent',
};

const currentSize = computed(() => sizeMap[props.size]);

const iconSize = computed(() => parseInt(currentSize.value.size) * 0.5);

const containerStyles = computed(() => ({
  position: 'relative' as const,
  display: 'inline-block' as const,
}));

const avatarClasses = computed(() => [
  'z-avatar',
  `z-avatar--${props.size}`,
  `z-avatar--${props.shape}`,
]);

const avatarStyles = computed(() => ({
  width: currentSize.value.size,
  height: currentSize.value.size,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  background:
    props.src && !imageError.value
      ? 'transparent'
      : 'linear-gradient(135deg, var(--zeno-color-background-subtle), var(--zeno-color-background-subtle))',
  color: 'var(--zeno-color-text-secondary)',
  overflow: 'hidden' as const,
  flexShrink: 0,
  userSelect: 'none' as const,
  borderRadius: props.shape === 'circle' ? '50%' : 'var(--zeno-radius-lg)',
  border: props.showBorder
    ? `${currentSize.value.borderWidth} solid ${props.borderColor || 'var(--zeno-color-background-surface)'}`
    : 'none',
  boxShadow: props.showBorder
    ? '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)'
    : 'none',
  transition: 'transform 0.2s var(--zeno-motion-easing-standard)',
}));

const initialsStyles = computed(() => ({
  fontWeight: 'var(--zeno-font-weight-semibold)',
  fontSize: currentSize.value.fontSize,
  lineHeight: 1,
  letterSpacing: '0.025em',
  textTransform: 'uppercase' as const,
}));

const statusStyles = computed(() => ({
  position: 'absolute' as const,
  bottom: '0',
  right: '0',
  width: currentSize.value.statusSize,
  height: currentSize.value.statusSize,
  backgroundColor: statusColors[props.status],
  border: '2px solid var(--zeno-color-background-surface)',
  borderRadius: '50%',
  zIndex: 1,
}));
</script>

<style scoped>
.z-avatar-container {
  position: relative;
  display: inline-block;
}

.z-avatar {
  position: relative;
}

.z-avatar:hover {
  transform: scale(1.02);
}

.z-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.z-avatar__initials {
  display: block;
}

.z-avatar__fallback {
  opacity: 0.6;
}

.z-avatar__status {
  display: block;
}
</style>
