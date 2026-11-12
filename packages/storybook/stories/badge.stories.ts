import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface BadgeArgs {
  label: string;
  variant: string;
  outline: boolean;
  subtle: boolean;
}

const meta = {
  title: 'Elements/Badge',
  render: args => html`
    <zeno-badge
      variant=${args.variant}
      ?outline=${args.outline}
      ?subtle=${args.subtle}
      >${args.label}</zeno-badge
    >
  `,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'success',
        'warning',
        'danger',
        'info',
        'neutral',
      ],
    },
  },
  args: { label: 'New', variant: 'primary', outline: false, subtle: false },
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<BadgeArgs>;

export const Default: Story = {};
export const Subtle: Story = { args: { subtle: true } };
export const Outline: Story = { args: { outline: true } };
