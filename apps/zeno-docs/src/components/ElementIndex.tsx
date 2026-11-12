import Link from '@docusaurus/Link';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import elements from '../generated/elements.json';
import site from '../generated/site.json';
import { loadZeno } from '../zeno';
import { Inline } from './Inline';
import { ScrollTable } from './ScrollTable';

type Entry = (typeof elements)[number];

const matches = (entry: Entry, query: string): boolean =>
  query === '' ||
  [entry.name, entry.tag, entry.title, entry.summary, entry.category].some(
    text => text.toLowerCase().includes(query)
  );

/** Every element, grouped by what it is for, with a filter. */
export function ElementIndex(): ReactNode {
  const [query, setQuery] = useState('');
  const filter = useRef<HTMLElement>(null);

  // The filter is a Zeno input. Its `input` event is listened to directly,
  // which works the same in every version of React.
  useEffect(() => {
    const input = filter.current;
    if (!input) return undefined;
    void loadZeno();
    const onInput = (event: Event): void => {
      const { value } = event.target as HTMLInputElement;
      setQuery(
        String(value ?? '')
          .trim()
          .toLowerCase()
      );
    };
    input.addEventListener('input', onInput);
    return () => input.removeEventListener('input', onInput);
  }, []);

  const shown = elements.filter(entry => matches(entry, query));

  return (
    <div className="element-index">
      <div className="element-index__filter">
        <zeno-input
          ref={filter}
          type="search"
          label="Filter elements"
          clearable
        />
      </div>
      <p className="element-index__empty" role="status">
        {query === ''
          ? `${elements.length} elements.`
          : `${shown.length} of ${elements.length} elements match.`}
      </p>
      {site.categories.map(category => {
        const inCategory = shown.filter(entry => entry.category === category);
        if (inCategory.length === 0) return null;
        return (
          <section key={category} aria-label={category}>
            <h2 id={category.toLowerCase().replaceAll(' ', '-')}>{category}</h2>
            <ul className="element-index__list">
              {inCategory.map(entry => (
                <li key={entry.name}>
                  <Link
                    className="element-index__item"
                    to={`/elements/${entry.name}`}
                  >
                    <span className="element-index__name">{entry.title}</span>
                    <span className="element-index__summary">
                      <Inline text={entry.summary} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** What is tested and what is missing, element by element. */
export function ElementStatus(): ReactNode {
  return (
    <ScrollTable label="Element status">
      <thead>
        <tr>
          <th scope="col">Element</th>
          <th scope="col">Form control</th>
          <th scope="col">Browser tests</th>
          <th scope="col">axe-core</th>
          <th scope="col">Story</th>
          <th scope="col">Known gaps</th>
          <th scope="col">No description</th>
        </tr>
      </thead>
      <tbody>
        {elements.map(entry => (
          <tr key={entry.name}>
            <th scope="row">
              <Link to={`/elements/${entry.name}`}>{entry.title}</Link>
            </th>
            <td>{entry.formControl ? 'Yes' : 'No'}</td>
            <td>{entry.tests.files.length > 0 ? 'Its own' : 'Renders only'}</td>
            <td>{entry.tests.axe ? 'Checked' : 'Not checked'}</td>
            <td>{entry.tests.story ? 'Yes' : 'No'}</td>
            <td>{entry.gaps + entry.docGaps.length}</td>
            <td>
              {entry.undescribed} of {entry.apiItems}
            </td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

/** The counts behind the sentences on the home and accessibility pages. */
export function elementCounts(): {
  total: number;
  ownTests: number;
  axe: number;
  stories: number;
  formControls: number;
  gaps: number;
} {
  return {
    total: elements.length,
    ownTests: elements.filter(entry => entry.tests.files.length > 0).length,
    axe: elements.filter(entry => entry.tests.axe).length,
    stories: elements.filter(entry => entry.tests.story).length,
    formControls: elements.filter(entry => entry.formControl).length,
    gaps: elements.reduce((sum, entry) => sum + entry.gaps, 0),
  };
}

/** One count, for a sentence in a page. */
export function Count({
  of,
}: {
  of: keyof ReturnType<typeof elementCounts>;
}): ReactNode {
  return elementCounts()[of];
}
