<template>
  <nav :class="classes" aria-label="Breadcrumb">
    <ol class="z-breadcrumb__list">
      <li
        v-for="(item, index) in visibleItems"
        :key="index"
        class="z-breadcrumb__list-item"
      >
        <!-- Ellipsis for collapsed items -->
        <template v-if="hasCollapsed && index === 1">
          <span class="z-breadcrumb__ellipsis" aria-hidden="true">...</span>
          <span class="z-breadcrumb__separator" aria-hidden="true">
            <slot name="separator">{{ separator }}</slot>
          </span>
        </template>

        <!-- Breadcrumb item -->
        <component
          :is="getItemComponent(item)"
          :key="`item-${index}`"
          v-bind="getItemProps(item, index)"
          :class="getItemClasses(item, index)"
          @click="handleItemClick(item, $event)"
        >
          {{ item.label }}
        </component>

        <!-- Separator (not for last item) -->
        <span
          v-if="index < visibleItems.length - 1"
          class="z-breadcrumb__separator"
          aria-hidden="true"
        >
          <slot name="separator">{{ separator }}</slot>
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getBreadcrumbClasses, processBreadcrumbItems } from '@usezeno/core';
import type { ZBreadcrumbProps, BreadcrumbItem } from '../types';

const props = withDefaults(defineProps<ZBreadcrumbProps>(), {
  maxItems: 4,
  separator: '/',
});

const classes = computed(() =>
  getBreadcrumbClasses({ className: props.className })
);

const breadcrumbData = computed(() =>
  processBreadcrumbItems(props.items ?? [], props.maxItems)
);

const visibleItems = computed(() => breadcrumbData.value.visibleItems);
const hasCollapsed = computed(() => breadcrumbData.value.hasCollapsed);

const getItemComponent = (item: BreadcrumbItem) => {
  if (item.href && !item.disabled) return 'a';
  if (item.onClick && !item.disabled) return 'button';
  return 'span';
};

const getItemProps = (item: BreadcrumbItem, index: number) => {
  const isLast = index === visibleItems.value.length - 1;
  const baseProps = {
    'aria-current': isLast ? 'page' : undefined,
  };

  if (item.href && !item.disabled) {
    return { ...baseProps, href: item.href };
  }

  if (item.onClick && !item.disabled) {
    return { ...baseProps, type: 'button' };
  }

  return baseProps;
};

const getItemClasses = (item: BreadcrumbItem, index: number) => {
  const isLast = index === visibleItems.value.length - 1;
  const classes = ['z-breadcrumb__item'];

  if (item.disabled) classes.push('z-breadcrumb__item--disabled');
  if (isLast) classes.push('z-breadcrumb__item--current');

  if (item.href && !item.disabled) classes.push('z-breadcrumb__link');
  if (item.onClick && !item.disabled) classes.push('z-breadcrumb__button');

  return classes.join(' ');
};

const handleItemClick = (item: BreadcrumbItem, event: Event) => {
  if (item.disabled) {
    event.preventDefault();
    return;
  }

  if (item.onClick) {
    event.preventDefault();
    item.onClick();
  }
};
</script>
