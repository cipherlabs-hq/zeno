import CodeBlock from '@theme/CodeBlock';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { loadZeno } from '../../zeno';
import { Inline } from '../Inline';
import { ScrollTable } from '../ScrollTable';

export interface ExampleData {
  title: string;
  description: string;
  html: string;
  script: string;
  held?: string;
}

interface Row {
  name: string | null;
  description: string;
  attribute?: string | null;
  type?: string;
  default?: string | null;
  reflects?: boolean;
  readonly?: boolean;
  from?: string | null;
  signature?: string;
  detail?: string;
}

export interface ElementData {
  name: string;
  tag: string;
  className: string;
  title: string;
  category: string;
  description: string;
  source: string;
  sourceUrl: string;
  formControl: boolean;
  formField: boolean;
  properties: Row[];
  methods: Row[];
  events: Row[];
  slots: Row[];
  parts: Row[];
  cssProperties: Row[];
  types: { name: string; declaration: string }[];
  tokens: string[];
  examples: ExampleData[];
  keyboard: { keys: string[]; action: string }[];
  accessibility: string[];
  gaps: string[];
  docGaps: string[];
  undescribed: string[];
  apiItems: number;
  tests: { smoke: boolean; files: string[]; axe: boolean; story: boolean };
}

/** The tag, what the element is, and how to load it. */
export function ElementIntro({ data }: { data: ElementData }): ReactNode {
  return (
    <div className="element-intro">
      <p className="element-intro__meta">
        <code>{`<${data.tag}>`}</code>
        <span>{data.category}</span>
        {data.formControl && <span>Form control</span>}
        <a href={data.sourceUrl}>Source</a>
      </p>
      <p className="element-intro__lead">
        <Inline text={data.description} />
      </p>
      <CodeBlock language="js">
        {`import '@usezeno/tokens/css';\nimport '@usezeno/core/web-components';`}
      </CodeBlock>
    </div>
  );
}

/** Displays that sit in a line. Anything else starts a new row. */
const IN_LINE = /^(inline|contents|none)/;

/**
 * The markup of one example, rendered by the real elements. The script, when
 * there is one, runs once the elements are registered, with `document`
 * standing for this example only.
 */
function Preview({
  html,
  run,
}: {
  html: string;
  run?: ((root: Element) => void) | null;
}): ReactNode {
  const preview = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = preview.current;
    if (!root) return undefined;
    let current = true;
    let frame = 0;
    void loadZeno().then(() => {
      if (!current) return;
      run?.(root);
      // Blocks that follow something would touch it. Space them once the
      // elements have drawn, so an element that draws nothing adds no gap.
      frame = requestAnimationFrame(() => {
        for (const child of root.children) {
          if (
            child.previousElementSibling &&
            !IN_LINE.test(getComputedStyle(child).display) &&
            child.getBoundingClientRect().height > 0
          ) {
            child.classList.add('example__stacked');
          }
        }
      });
    });
    return () => {
      current = false;
      cancelAnimationFrame(frame);
      // Fresh nodes, so listeners from this run are gone.
      root.innerHTML = html;
    };
  }, [html, run]);

  return (
    <div
      ref={preview}
      className="example__preview"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * One example: the live preview, then the same markup as code. An example
 * that is `held` changes the page around it, so it is rendered only when the
 * reader asks.
 */
export function Example({
  example,
  run,
}: {
  example: ExampleData;
  run?: ((root: Element) => void) | null;
}): ReactNode {
  const [running, setRunning] = useState(!example.held);

  return (
    <div className="example">
      {example.description && (
        <p>
          <Inline text={example.description} />
        </p>
      )}
      {running ? (
        <Preview html={example.html} run={run} />
      ) : (
        <div className="example__preview example__held">
          <p>{example.held}</p>
          <button
            type="button"
            className="site-button"
            onClick={() => setRunning(true)}
          >
            Run this example
          </button>
        </div>
      )}
      <CodeBlock language="html">{example.html}</CodeBlock>
      {example.script && <CodeBlock language="js">{example.script}</CodeBlock>}
    </div>
  );
}

/** A live preview with its markup, for the hand-written pages. */
export function Live({ html }: { html: string }): ReactNode {
  const markup = html.trim();
  return (
    <div className="example">
      <Preview html={markup} />
      <CodeBlock language="html">{markup}</CodeBlock>
    </div>
  );
}

const COLUMNS = {
  properties: ['Property', 'Attribute', 'Type', 'Default', 'Description'],
  methods: ['Method', 'Description'],
  events: ['Event', 'Detail', 'Description'],
  slots: ['Slot', 'Description'],
  parts: ['Part', 'Description'],
  cssProperties: ['Property', 'Default', 'Description'],
} as const;

type Kind = keyof typeof COLUMNS;

function cells(kind: Kind, row: Row): ReactNode[] {
  const description = (
    <>
      <Inline text={row.description} />
      {row.from && <span className="api-table__from"> From {row.from}.</span>}
    </>
  );
  const code = (text: string | null | undefined): ReactNode =>
    text ? <code>{text}</code> : <span aria-hidden="true">–</span>;

  switch (kind) {
    case 'properties':
      return [
        <>
          {code(row.name)}
          {row.readonly && <span className="api-table__flag">read only</span>}
        </>,
        <>
          {code(row.attribute)}
          {row.reflects && <span className="api-table__flag">reflects</span>}
        </>,
        code(row.type),
        code(row.default),
        description,
      ];
    case 'methods':
      return [code(row.signature), description];
    case 'events':
      return [code(row.name), code(row.detail), description];
    case 'slots':
      return [row.name ? code(row.name) : 'Default', description];
    case 'parts':
      return [code(row.name), description];
    case 'cssProperties':
      return [code(row.name), code(row.default), description];
  }
}

/** A table of one kind of API. Columns with nothing in them are left out. */
export function ApiTable({
  kind,
  rows,
}: {
  kind: Kind;
  rows: Row[];
}): ReactNode {
  const body = rows.map(row => cells(kind, row));
  const last = COLUMNS[kind].length - 1;
  const hasText = rows.some(row => row.description || row.from);
  const shown = COLUMNS[kind]
    .map((heading, index) => ({ heading, index }))
    .filter(({ index }) => index !== last || hasText);

  return (
    <ScrollTable label={COLUMNS[kind][0]}>
      <thead>
        <tr>
          {shown.map(({ heading }) => (
            <th key={heading} scope="col">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((row, at) => (
          <tr key={at}>
            {shown.map(({ heading, index }) => (
              <td key={heading}>{row[index]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

/** The tokens the element's own source reads. */
export function Tokens({ tokens }: { tokens: string[] }): ReactNode {
  if (tokens.length === 0) {
    return <p>The element&apos;s own source reads no tokens.</p>;
  }
  return (
    <details className="token-list">
      <summary>
        The {tokens.length} tokens this element reads, from its source
      </summary>
      <ul>
        {tokens.map(token => (
          <li key={token}>
            <code>{token}</code>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function TypeList({
  types,
}: {
  types: ElementData['types'];
}): ReactNode {
  return (
    <CodeBlock language="ts">
      {types.map(type => type.declaration).join('\n\n')}
    </CodeBlock>
  );
}

export function Keyboard({
  rows,
}: {
  rows: ElementData['keyboard'];
}): ReactNode {
  if (rows.length === 0) {
    return <p>This element handles no keys of its own.</p>;
  }
  return (
    <ScrollTable label="Keyboard">
      <thead>
        <tr>
          <th scope="col">Key</th>
          <th scope="col">What it does</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, at) => (
          <tr key={at}>
            <td className="keys">
              {row.keys.map(key => (
                <kbd key={key}>{key}</kbd>
              ))}
            </td>
            <td>
              <Inline text={row.action} />
            </td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

/** What the element does in a form. Worked out from the source. */
export function FormNotes({ data }: { data: ElementData }): ReactNode {
  if (!data.formControl) {
    return (
      <p>
        This element is not a form control. It adds nothing to a form&apos;s
        data.
      </p>
    );
  }
  if (!data.formField) {
    return (
      <p>
        This element is form-associated. See its properties above for what it
        does in a form.
      </p>
    );
  }
  return (
    <ul>
      <li>
        With a <code>name</code>, the element adds its value to the data of the
        form it is in, and is left out while it is disabled.
      </li>
      <li>
        It is labelled by its <code>label</code> attribute or by a{' '}
        <code>&lt;label for&gt;</code> that points at its <code>id</code>.
      </li>
      <li>
        It takes part in validation: <code>checkValidity()</code>,{' '}
        <code>reportValidity()</code> and <code>setCustomValidity()</code> work,
        and an invalid element blocks the submit and matches{' '}
        <code>:invalid</code>.
      </li>
      <li>
        It follows a <code>&lt;fieldset disabled&gt;</code> around it and goes
        back to its first value when the form is reset.
      </li>
      <li>
        The messages it writes itself, such as “Please fill out this field.”,
        are in English only.
      </li>
    </ul>
  );
}

export function Notes({
  items,
  empty,
}: {
  items: string[];
  empty: string;
}): ReactNode {
  if (items.length === 0) return <p>{empty}</p>;
  return (
    <ul>
      {items.map((item, at) => (
        <li key={at}>
          <Inline text={item} />
        </li>
      ))}
    </ul>
  );
}

/** How the element is tested, then everything known to be missing or wrong. */
export function Coverage({ data }: { data: ElementData }): ReactNode {
  const { tests } = data;
  const own = tests.files.length > 0;
  return (
    <>
      <ul>
        <li>
          {own ? (
            <>
              Tested in a real browser by{' '}
              {tests.files.map((file, at) => (
                <span key={file}>
                  {at > 0 && ', '}
                  <code>{file.split('/').pop()}</code>
                </span>
              ))}
              .
            </>
          ) : (
            <>
              No tests of its own. The only check is that the element registers
              and renders (<code>smoke.test.ts</code>).
            </>
          )}
        </li>
        <li>
          {tests.axe
            ? 'Checked with axe-core in the light and the dark theme.'
            : 'Not checked with axe-core.'}
        </li>
        <li>
          {tests.story ? 'Has a Storybook story.' : 'Has no Storybook story.'}
        </li>
      </ul>
      {data.undescribed.length > 0 && (
        <details className="token-list">
          <summary>
            {data.undescribed.length} of the {data.apiItems} properties,
            methods, events, slots and parts above have no description in the
            source
          </summary>
          <Notes items={data.undescribed} empty="" />
        </details>
      )}
      {data.gaps.length + data.docGaps.length === 0 ? (
        <p>No gaps are known.</p>
      ) : (
        <>
          <p>Known gaps:</p>
          <Notes items={[...data.gaps, ...data.docGaps]} empty="" />
        </>
      )}
    </>
  );
}
