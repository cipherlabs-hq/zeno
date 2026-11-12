// The thin path: the Lit elements of @usezeno/core used directly in Vue
// templates, with no Vue component in between.
//
// This module is safe to import in a Vite config. It does not load or
// register the elements; import '@usezeno/core/web-components' in the app.

import { computed, type ComputedRef, type Ref } from 'vue';

export type { ZenoElements } from './generated.js';

/**
 * True for the tag of a Zeno element. Vue has to be told which tags are
 * custom elements, or it looks for a Vue component with that name.
 */
export function isZenoElement(tag: string): boolean {
  return tag.startsWith('zeno-');
}

/**
 * Compiler options that make Vue leave Zeno elements alone. Use them as
 * `template.compilerOptions` of @vitejs/plugin-vue, or copy `isCustomElement`
 * onto `app.config.compilerOptions` when templates are compiled in the
 * browser.
 */
export const zenoCompilerOptions = {
  isCustomElement: isZenoElement,
} as const;

/** What `v-bind` needs to keep a `checked` property and a ref in step. */
export interface CheckedBinding {
  '.checked': boolean;
  onChange: (event: Event) => void;
}

/**
 * Two-way binding for the elements whose state is `checked`: zeno-checkbox,
 * zeno-switch and zeno-radio. `v-model` on a custom element binds `value`,
 * which these elements use for what the form submits, not for their state.
 *
 *     const updates = ref(false);
 *     const updatesBinding = useCheckedModel(updates);
 *
 *     <zeno-checkbox v-bind="updatesBinding" label="Send me updates" />
 */
export function useCheckedModel(
  model: Ref<boolean>
): ComputedRef<CheckedBinding> {
  const onChange = (event: Event): void => {
    model.value = (
      event.currentTarget as HTMLElement & { checked: boolean }
    ).checked;
  };
  return computed(() => ({ '.checked': model.value, onChange }));
}
