import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface ToggletipArgs {
  label: string;
  note: string;
}

const meta = {
  title: 'Elements/Toggletip',
  render: args => html`
    <p style="padding: 2rem 0">
      Not enough data
      <zeno-toggletip label=${args.label}>
        <p>${args.note} <a href="#">How scores work</a></p>
      </zeno-toggletip>
    </p>
  `,
  args: {
    label: 'Why there is no score',
    note: 'A score needs at least two inspections in the last three years.',
  },
} satisfies Meta<ToggletipArgs>;

export default meta;
type Story = StoryObj<ToggletipArgs>;

export const Basic: Story = {};
