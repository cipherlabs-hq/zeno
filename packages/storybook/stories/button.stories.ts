import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';

interface ButtonArgs {
  label: string;
  variant: string;
  size: string;
  disabled: boolean;
  loading: boolean;
}

const meta = {
  title: 'Elements/Button',
  render: args => html`
    <zeno-button
      variant=${ifDefined(args.variant)}
      size=${ifDefined(args.size)}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      >${args.label}</zeno-button
    >
  `,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'outline',
        'ghost',
        'destructive',
      ],
    },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
  },
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
