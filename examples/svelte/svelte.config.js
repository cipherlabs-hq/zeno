import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Svelte's accessibility checks cannot see inside a custom element, so they
// take a zeno-button with a click handler for a plain element that is not a
// button. The element is a real button. Leave those two checks out for
// zeno-* tags and keep them for everything else.
const NOT_FOR_ELEMENTS = new Set([
  'a11y_click_events_have_key_events',
  'a11y_no_static_element_interactions',
]);

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    warningFilter: warning =>
      !(
        NOT_FOR_ELEMENTS.has(warning.code) && warning.message.includes('<zeno-')
      ),
  },
};
