import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface CheckboxArgs {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}

const meta = {
  title: 'Elements/Checkbox',
  render: args => html`
    <zeno-checkbox
      label=${args.label}
      ?checked=${args.checked}
      ?indeterminate=${args.indeterminate}
      ?disabled=${args.disabled}
    ></zeno-checkbox>
  `,
  args: {
    label: 'Send me a copy',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<CheckboxArgs>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Indeterminate: Story = { args: { indeterminate: true } };
export const Disabled: Story = { args: { disabled: true } };
