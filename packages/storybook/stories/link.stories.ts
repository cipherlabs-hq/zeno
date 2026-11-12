import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface LinkArgs {
  label: string;
  external: boolean;
  standalone: boolean;
  newTab: boolean;
}

const meta = {
  title: 'Elements/Link',
  render: args => html`
    <p>
      Read the
      <zeno-link
        href="#"
        target=${args.newTab ? '_blank' : '_self'}
        ?external=${args.external}
        ?standalone=${args.standalone}
        >${args.label}</zeno-link
      >
      before you cite a score.
    </p>
  `,
  args: {
    label: 'methodology',
    external: false,
    standalone: false,
    newTab: false,
  },
} satisfies Meta<LinkArgs>;

export default meta;
type Story = StoryObj<LinkArgs>;

export const InText: Story = {};
export const External: Story = {
  args: { label: 'OpenAPI spec', external: true, newTab: true },
};
export const Standalone: Story = { args: { standalone: true } };
export const AroundARouterLink: Story = {
  render: () => html`<zeno-link><a href="#coverage">Coverage</a></zeno-link>`,
};
