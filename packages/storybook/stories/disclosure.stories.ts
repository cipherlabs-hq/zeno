import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface DisclosureArgs {
  open: boolean;
}

const meta = {
  title: 'Elements/Disclosure',
  render: args => html`
    <zeno-disclosure ?open=${args.open}>
      <span slot="summary"><code>GET /facilities</code></span>
      <p>Lists facilities near a point. <a href="#">Get a key</a></p>
    </zeno-disclosure>
    <zeno-disclosure>
      <span slot="summary"><code>GET /coverage</code></span>
      <p>Coverage by county and city.</p>
    </zeno-disclosure>
  `,
  args: { open: false },
} satisfies Meta<DisclosureArgs>;

export default meta;
type Story = StoryObj<DisclosureArgs>;

export const Closed: Story = {};
export const Open: Story = { args: { open: true } };
