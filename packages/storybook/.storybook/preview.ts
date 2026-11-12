import type { Preview } from '@storybook/web-components-vite';
import '@usezeno/tokens/css';
import './preview.css';
import '@usezeno/core/web-components';

type ThemeChoice = 'system' | 'light' | 'dark';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Theme: follow the system, or force light or dark',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (story, context) => {
      const theme = (context.globals.theme ?? 'light') as ThemeChoice;
      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      return story();
    },
  ],
};

export default preview;
