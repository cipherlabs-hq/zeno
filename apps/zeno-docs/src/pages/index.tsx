import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { brand, links } from '../brand';
import { elementCounts } from '../components/ElementIndex';
import { ReleaseStatus } from '../components/ReleaseStatus';
import tokens from '../generated/tokens.json';
import { loadZeno } from '../zeno';

const STATEMENT =
  'Zeno is an open-source design system: web components and design tokens that work in plain HTML, React, Vue and Svelte.';

const PLANS = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
  { value: 'company', label: 'Company' },
];

/** The sign-up form the example apps build, made of the real elements. */
function Demo(): ReactNode {
  const plan = useRef<HTMLElement & { options?: unknown; value?: unknown }>(
    null
  );
  const [sent, setSent] = useState('');

  useEffect(() => {
    void loadZeno().then(() => {
      // An array cannot be an attribute, so it is set as a property.
      if (plan.current) {
        plan.current.options = PLANS;
        plan.current.value = 'free';
      }
    });
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(
      [...data].map(([name, value]) => `${name}=${String(value)}`).join('&')
    );
  };

  return (
    <form className="home__demo" onSubmit={submit}>
      <zeno-input name="email" type="email" label="Email" required />
      <zeno-select ref={plan} name="plan" label="Plan" />
      <zeno-checkbox name="updates" label="Send me product updates" />
      <div>
        <zeno-button type="submit">Create account</zeno-button>
      </div>
      <output aria-live="polite">
        {sent ? `The form would send: ${sent}` : 'Nothing is sent anywhere.'}
      </output>
    </form>
  );
}

export default function Home(): ReactNode {
  const counts = elementCounts();
  const tokenCount = tokens.base.length + tokens.theme.length;

  return (
    <Layout description={STATEMENT}>
      <main className="home">
        <div className="home__hero">
          <div>
            <h1 className="home__title">{brand.name}</h1>
            <p className="home__statement">{STATEMENT}</p>
            <ReleaseStatus />
            <div className="home__install">
              <CodeBlock language="bash">
                npm install @usezeno/tokens @usezeno/core
              </CodeBlock>
            </div>
            <ul className="home__actions">
              <li>
                <Link
                  className="home__action home__action--primary"
                  to="/get-started"
                >
                  Get started
                </Link>
              </li>
              <li>
                <Link className="home__action" to="/elements">
                  Elements
                </Link>
              </li>
              <li>
                <Link className="home__action" href={links.repository}>
                  GitHub
                </Link>
              </li>
              <li>
                <Link className="home__action" href={links.npm}>
                  npm
                </Link>
              </li>
            </ul>
          </div>
          <ThemedImage
            className="home__mascot"
            alt="Zeno, the small black dog the project is named after"
            width={320}
            height={320}
            sources={{
              light: useBaseUrl(brand.mascot),
              dark: useBaseUrl(brand.mascotOnDark),
            }}
          />
        </div>

        <section className="home__section" aria-labelledby="one-form">
          <div className="home__split">
            <div>
              <h2 id="one-form">Real form controls</h2>
              <p>
                This form is made of Zeno elements inside a plain{' '}
                <code>&lt;form&gt;</code>. They carry a name and a value, take
                part in validation, and submit the way native controls do. Leave
                the email empty and press the button to see it.
              </p>
              <p>
                The same form is built four times in the repository, in plain
                HTML, React, Vue and Svelte, and one shared set of tests runs
                against all four. See <Link to="/frameworks">Frameworks</Link>.
              </p>
            </div>
            <Demo />
          </div>
        </section>

        <section className="home__section" aria-labelledby="what-is-here">
          <h2 id="what-is-here">What is here</h2>
          <ul className="home__facts">
            <li>
              <h3>{counts.total} elements</h3>
              <p>
                Each has a page written from its source: live examples,
                attributes, events, slots, parts, keyboard use and known gaps.{' '}
                <Link to="/elements">See the elements</Link>.
              </p>
            </li>
            <li>
              <h3>{tokenCount} tokens</h3>
              <p>
                Colour, type, spacing, radius, shadow and motion, as CSS custom
                properties with a light and a dark theme.{' '}
                <Link to="/tokens">See the tokens</Link>.
              </p>
            </li>
            <li>
              <h3>Where it stands</h3>
              <p>
                {counts.ownTests} of the {counts.total} elements have their own
                browser tests and are checked with axe-core. The others are only
                tested to render. No screen reader testing has been done.{' '}
                <Link to="/accessibility">
                  Read the accessibility statement
                </Link>
                .
              </p>
            </li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
