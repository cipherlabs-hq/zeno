import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface InlineLoadingArgs {
  status: 'active' | 'finished' | 'error';
  description: string;
}

const meta = {
  title: 'Elements/Inline loading',
  render: args => html`
    <zeno-inline-loading
      status=${args.status}
      description=${args.description}
    ></zeno-inline-loading>
  `,
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['active', 'finished', 'error'],
    },
  },
  args: { status: 'active', description: 'Sending…' },
} satisfies Meta<InlineLoadingArgs>;

export default meta;
type Story = StoryObj<InlineLoadingArgs>;

export const Active: Story = {};
export const Finished: Story = {
  args: { status: 'finished', description: 'Sent' },
};
export const Failed: Story = {
  args: { status: 'error', description: 'Not sent' },
};
