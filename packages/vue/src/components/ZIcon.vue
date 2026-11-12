<template>
  <component
    :is="iconComponent"
    :class="classes"
    :size="iconSize"
    :color="color"
    :stroke-width="strokeWidth"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import { getIconSize, getIconClasses } from '@usezeno/core';
import type { ZIconProps } from '../types';

const props = withDefaults(defineProps<ZIconProps>(), {
  size: 'md',
  strokeWidth: 2,
});

// Map of icon names to Lucide components
const iconMap: Record<string, any> = {
  'chevron-down': LucideIcons.ChevronDown,
  'chevron-up': LucideIcons.ChevronUp,
  'chevron-left': LucideIcons.ChevronLeft,
  'chevron-right': LucideIcons.ChevronRight,
  check: LucideIcons.Check,
  x: LucideIcons.X,
  plus: LucideIcons.Plus,
  minus: LucideIcons.Minus,
  search: LucideIcons.Search,
  home: LucideIcons.Home,
  user: LucideIcons.User,
  settings: LucideIcons.Settings,
  menu: LucideIcons.Menu,
  'more-horizontal': LucideIcons.MoreHorizontal,
  'more-vertical': LucideIcons.MoreVertical,
  edit: LucideIcons.Edit,
  'trash-2': LucideIcons.Trash2,
  copy: LucideIcons.Copy,
  'external-link': LucideIcons.ExternalLink,
  download: LucideIcons.Download,
  upload: LucideIcons.Upload,
  file: LucideIcons.File,
  folder: LucideIcons.Folder,
  image: LucideIcons.Image,
  star: LucideIcons.Star,
  heart: LucideIcons.Heart,
  eye: LucideIcons.Eye,
  'eye-off': LucideIcons.EyeOff,
  lock: LucideIcons.Lock,
  unlock: LucideIcons.Unlock,
  mail: LucideIcons.Mail,
  phone: LucideIcons.Phone,
  calendar: LucideIcons.Calendar,
  clock: LucideIcons.Clock,
  sun: LucideIcons.Sun,
  moon: LucideIcons.Moon,
  info: LucideIcons.Info,
  'alert-circle': LucideIcons.AlertCircle,
  'alert-triangle': LucideIcons.AlertTriangle,
  'check-circle': LucideIcons.CheckCircle,
  'x-circle': LucideIcons.XCircle,
  'help-circle': LucideIcons.HelpCircle,
  loader: LucideIcons.Loader,
  'refresh-cw': LucideIcons.RefreshCw,
  'arrow-up': LucideIcons.ArrowUp,
  'arrow-down': LucideIcons.ArrowDown,
  'arrow-left': LucideIcons.ArrowLeft,
  'arrow-right': LucideIcons.ArrowRight,
};

const iconComponent = computed(() => {
  const component = iconMap[props.name];
  if (!component) {
    console.warn(`Icon "${props.name}" not found in ZIcon`);
    return 'span';
  }
  return component;
});

const iconSize = computed(() => getIconSize(props.size));

const classes = computed(() =>
  getIconClasses({
    className: props.className,
    size: typeof props.size === 'string' ? props.size : undefined,
  })
);
</script>
