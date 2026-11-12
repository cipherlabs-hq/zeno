<script setup lang="ts">
// A second way to bind `checked`. Vue picks its checkbox v-model for a custom
// element that carries a static type="checkbox" attribute. The element ignores
// the attribute. test/v-model.test.ts shows that this works.

import '@usezeno/core/web-components';
import { ref } from 'vue';
import '@usezeno/vue/elements';

const on = ref(false);
defineExpose({ on });
</script>

<template>
  <zeno-switch v-model="on" type="checkbox" label="Notifications" />
  <span data-testid="on">{{ on ? 'on' : 'off' }}</span>
</template>
