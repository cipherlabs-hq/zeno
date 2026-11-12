import type { PrismTheme } from 'prism-react-renderer';

/**
 * One code theme for light and dark. The colours are CSS variables, set in
 * src/css/custom.css from the Zeno palette, so they follow the theme switch
 * and are chosen once for contrast.
 */
export const codeTheme: PrismTheme = {
  plain: {
    color: 'var(--site-code-text)',
    backgroundColor: 'var(--site-code-background)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--site-code-comment)' },
    },
    {
      types: ['punctuation', 'operator'],
      style: { color: 'var(--site-code-punctuation)' },
    },
    {
      types: ['keyword', 'atrule', 'important', 'selector', 'rule'],
      style: { color: 'var(--site-code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted', 'regex'],
      style: { color: 'var(--site-code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol', 'builtin'],
      style: { color: 'var(--site-code-number)' },
    },
    {
      types: ['tag', 'function', 'class-name', 'deleted'],
      style: { color: 'var(--site-code-tag)' },
    },
    {
      types: ['attr-name', 'property', 'variable'],
      style: { color: 'var(--site-code-attribute)' },
    },
  ],
};
