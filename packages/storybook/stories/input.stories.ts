import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface InputArgs {
  label: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  required: boolean;
}

const meta = {
  title: 'Elements/Input',
  render: args => html`
    <zeno-input
      label=${args.label}
      placeholder=${args.placeholder}
      .value=${args.value}
      ?disabled=${args.disabled}
      ?required=${args.required}
    ></zeno-input>
  `,
  args: {
    label: 'Email',
    placeholder: 'name@example.com',
    value: '',
    disabled: false,
    required: false,
  },
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<InputArgs>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: 'name@example.com' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true } };
