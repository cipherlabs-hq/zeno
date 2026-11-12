# @usezeno/vue

Zeno for Vue 3. The package has two parts:

- `@usezeno/vue/elements`: what a Vue app needs to use the Zeno elements
  directly. This is the way forward.
- `@usezeno/vue`: Vue single-file components from the 2025 code base. They are
  a second implementation and will be retired. See
  [docs/vue-sfc-retirement.md](../../docs/vue-sfc-retirement.md).

## Using the elements

Tell Vue's compiler that `zeno-` tags are custom elements:

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue';
import { zenoCompilerOptions } from '@usezeno/vue/elements';

export default {
  plugins: [vue({ template: { compilerOptions: zenoCompilerOptions } })],
};
```

Then register the elements and use them:

```vue
<script setup lang="ts">
import '@usezeno/tokens/css';
import '@usezeno/core/web-components';
import { ref } from 'vue';
import { useCheckedModel } from '@usezeno/vue/elements';

const email = ref('');
const updates = ref(false);
const updatesBinding = useCheckedModel(updates);
</script>

<template>
  <zeno-input v-model="email" name="email" type="email" label="Email" />
  <zeno-checkbox
    v-bind="updatesBinding"
    name="updates"
    label="Send me updates"
  />
</template>
```

### What works

- **`v-model`** on elements whose state is `value`. Tested on `zeno-input`
  and `zeno-select`. `zeno-textarea`, `zeno-slider`, `zeno-radio-group` and
  `zeno-date-picker` have the same `value` property and `input` event, which
  is all Vue's `v-model` uses.
- **`useCheckedModel(ref)`** for elements whose state is `checked`:
  `zeno-checkbox`, `zeno-switch`, `zeno-radio`. Spread the result with
  `v-bind`. Writing `type="checkbox"` on the tag makes plain `v-model` bind
  `checked` as well, because Vue picks the binding from that attribute.
- **Properties.** `:options="plans"` sets the property, so arrays and objects
  pass through.
- **Events** with `@`: `@change`, `@request-close`.
- **Type checking** with `vue-tsc`: importing `@usezeno/vue/elements` anywhere
  in the app types every `zeno-` tag's props and event handlers.

### What to watch for

- **Import the elements before the component renders.** Vue sets a property
  only when the element already has it. Before registration it sets an
  attribute, and an array becomes text.
- **Write a bound boolean in camelCase or with a dot:**
  `:hideRequiredIndicator="false"` or `.hideRequiredIndicator="false"`. The
  kebab-case form `:hide-required-indicator="false"` sets the attribute to the
  text `"false"`, which the element reads as true.
- **`vue-tsc` does not check `v-model`** on a custom element, and it does not
  flag an unknown prop.

`src/elements/generated.ts` is generated. Change the element, then run
`pnpm generate` at the repository root.

`examples/vue` is a working app. Its tests cover `v-model`, `useCheckedModel`,
`v-model` with `type="checkbox"`, an array property and events. The points
under "What to watch for" come from reading Vue's compiler and runtime source
and from `vue-tsc` runs, not from tests.

## The single-file components

The components (`ZButton`, `ZInput`, …) read the `--zeno-*` custom properties
from `@usezeno/tokens`, so load `@usezeno/tokens/css` once per page. Their
styles also contain colours that Sass computed from the light theme at build
time. Those do not change in the dark theme, so treat dark mode in these
components as incomplete.

Pre-release: the API can change in any 0.x minor release.
