import CodeBlock from '@theme/CodeBlock';
import { type ReactNode } from 'react';
import sources from '../generated/sources.json';
import site from '../generated/site.json';

const LANGUAGES: Record<string, string> = {
  html: 'html',
  ts: 'ts',
  tsx: 'tsx',
  vue: 'html',
  svelte: 'html',
};

/**
 * A file from the example apps, read from the repository when the site is
 * built. It is the file the example's tests run against.
 */
export function SourceFile({
  path,
  open = false,
}: {
  path: keyof typeof sources;
  open?: boolean;
}): ReactNode {
  const extension = path.split('.').pop() ?? '';
  return (
    <details className="source-file" open={open}>
      <summary>
        <code>{path}</code>
      </summary>
      <CodeBlock language={LANGUAGES[extension] ?? 'text'} title={path}>
        {sources[path]}
      </CodeBlock>
      <p>
        <a href={`${site.repository}/blob/main/${path}`}>
          Open this file in the repository
        </a>
      </p>
    </details>
  );
}
