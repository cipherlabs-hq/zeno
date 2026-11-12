import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

interface CodeSnippetArgs {
  type: 'single' | 'multi';
  wrap: boolean;
  code: string;
}

const meta = {
  title: 'Elements/Code snippet',
  render: args => html`
    <zeno-code-snippet type=${args.type} ?wrap=${args.wrap} label="Example"
      >${args.code}</zeno-code-snippet
    >
  `,
  argTypes: {
    type: { control: 'inline-radio', options: ['single', 'multi'] },
  },
  args: {
    type: 'single',
    wrap: false,
    code: 'https://api.example.com/v1/facilities?q=taco&page_size=5',
  },
} satisfies Meta<CodeSnippetArgs>;

export default meta;
type Story = StoryObj<CodeSnippetArgs>;

export const SingleLine: Story = {};
export const MultiLine: Story = {
  args: {
    type: 'multi',
    code: 'curl -H "X-API-Key: $KEY" \\\n  "https://api.example.com/v1/facilities?q=taco"',
  },
};
export const Wrapped: Story = {
  args: { type: 'multi', wrap: true, code: 'x'.repeat(160) },
};
