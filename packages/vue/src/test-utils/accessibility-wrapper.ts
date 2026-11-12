import { mount, type VueWrapper } from '@vue/test-utils';
import { type Component } from 'vue';

/**
 * Wraps a component in a section landmark for accessibility testing
 * Uses section instead of main to avoid duplicate main landmark issues
 */
export function mountWithLandmark(
  component: Component,
  options: Record<string, unknown> = {}
): VueWrapper {
  const WrapperComponent = {
    components: {
      TestComponent: component,
    },
    template: `
      <section role="main">
        <TestComponent v-bind="$attrs">
          <template v-for="(_, slot) in $slots" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </TestComponent>
      </section>
    `,
  };

  return mount(WrapperComponent, options);
}
