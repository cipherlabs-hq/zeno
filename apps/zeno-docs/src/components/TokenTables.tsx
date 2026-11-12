import { type CSSProperties, type ReactNode, useState } from 'react';
import tokens from '../generated/tokens.json';
import { ScrollTable } from './ScrollTable';

interface Token {
  name: string;
  variable: string;
  type: string;
  value: string;
  dark: string | null;
}

const all: Token[] = [...tokens.base, ...tokens.theme];

const inGroup = (group: string): Token[] =>
  all.filter(token => token.name.startsWith(`${group}.`));

/** A length as a number of pixels, to put a scale in order. */
function pixels(value: string): number {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith('rem') || value.endsWith('em') ? amount * 16 : amount;
}

const shown = (token: Token, value: string): string =>
  token.type === 'cubicBezier'
    ? `cubic-bezier(${value.replaceAll(',', ', ')})`
    : value;

const use = (token: Token): string => `var(${token.variable})`;

/** A colour or shadow as it looks in one theme. */
function Themed({
  theme,
  token,
  value,
}: {
  theme: 'light' | 'dark';
  token: Token;
  value: string;
}): ReactNode {
  const style: CSSProperties =
    token.type === 'shadow'
      ? { boxShadow: use(token) }
      : { background: use(token) };
  return (
    <span className="token-theme">
      {/* data-theme makes the token inside resolve for that theme. */}
      <span data-theme={theme}>
        <span
          className={
            token.type === 'shadow'
              ? 'token-chip token-chip--shadow'
              : 'token-chip'
          }
          style={style}
        />
      </span>
      <code>{value}</code>
    </span>
  );
}

/** The tokens of one group that change with the theme, shown in both. */
export function ThemeTokens({ group }: { group: string }): ReactNode {
  const rows = inGroup(group);
  return (
    <ScrollTable label={group}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Light</th>
          <th scope="col">Dark</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(token => (
          <tr key={token.name}>
            <td>
              <code>{token.variable}</code>
            </td>
            <td>
              <Themed theme="light" token={token} value={token.value} />
            </td>
            <td>
              <Themed
                theme="dark"
                token={token}
                value={token.dark ?? token.value}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

type Sample =
  | 'none'
  | 'width'
  | 'radius'
  | 'square'
  | 'line'
  | 'size'
  | 'weight'
  | 'family'
  | 'tracking'
  | 'opacity';

function sample(kind: Sample, token: Token): ReactNode {
  switch (kind) {
    case 'width':
      return <span className="token-bar" style={{ width: use(token) }} />;
    case 'radius':
      return (
        <span className="token-box" style={{ borderRadius: use(token) }} />
      );
    case 'square':
      return (
        <span
          className="token-box"
          style={{ width: use(token), height: use(token) }}
        />
      );
    case 'line':
      return <span className="token-rule" style={{ height: use(token) }} />;
    case 'size':
      return (
        <span className="token-sample" style={{ fontSize: use(token) }}>
          Zeno
        </span>
      );
    case 'weight':
      return (
        <span className="token-sample" style={{ fontWeight: use(token) }}>
          A small black dog
        </span>
      );
    case 'family':
      return (
        <span className="token-sample" style={{ fontFamily: use(token) }}>
          A small black dog 0123
        </span>
      );
    case 'tracking':
      return (
        <span className="token-sample" style={{ letterSpacing: use(token) }}>
          A small black dog
        </span>
      );
    case 'opacity':
      return (
        <span
          className="token-box"
          style={{ opacity: use(token), background: use(ACCENT) }}
        />
      );
    case 'none':
      return null;
  }
}

const ACCENT: Token = {
  name: 'color.accent.solid',
  variable: '--zeno-color-accent-solid',
  type: 'color',
  value: '',
  dark: null,
};

/** The tokens of one group that are the same in both themes. */
export function ScaleTokens({
  group,
  show = 'none',
  ordered = false,
}: {
  group: string;
  show?: Sample;
  ordered?: boolean;
}): ReactNode {
  const rows = inGroup(group);
  if (ordered) rows.sort((a, b) => pixels(a.value) - pixels(b.value));
  return (
    <ScrollTable label={group}>
      <thead>
        <tr>
          <th scope="col">Token</th>
          <th scope="col">Value</th>
          {show !== 'none' && <th scope="col">Sample</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(token => (
          <tr key={token.name}>
            <td>
              <code>{token.variable}</code>
            </td>
            <td>
              <code>{shown(token, token.value)}</code>
            </td>
            {show !== 'none' && <td>{sample(show, token)}</td>}
          </tr>
        ))}
      </tbody>
    </ScrollTable>
  );
}

/**
 * Durations or easings. The button moves a marker along each row with that
 * row's token, so the difference can be seen.
 */
export function MotionTokens({
  group,
}: {
  group: 'motion.duration' | 'motion.easing';
}): ReactNode {
  const [moved, setMoved] = useState(false);
  const rows = inGroup(group);
  const transition = (token: Token): string =>
    group === 'motion.duration'
      ? `transform ${use(token)} var(--zeno-motion-easing-standard)`
      : `transform var(--zeno-motion-duration-2xl) ${use(token)}`;

  return (
    <>
      <p>
        <button
          type="button"
          className="site-button"
          aria-pressed={moved}
          onClick={() => setMoved(!moved)}
        >
          Play
        </button>
      </p>
      <ScrollTable label={group}>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Value</th>
            <th scope="col">Sample</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(token => (
            <tr key={token.name}>
              <td>
                <code>{token.variable}</code>
              </td>
              <td>
                <code>{shown(token, token.value)}</code>
              </td>
              <td>
                <span
                  className={
                    moved ? 'token-motion token-motion--moved' : 'token-motion'
                  }
                >
                  <span
                    className="token-motion__marker"
                    style={{ transition: transition(token) }}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </ScrollTable>
    </>
  );
}

/** The raw colour steps. They are the same in both themes. */
export function Palette(): ReactNode {
  const families = [
    ...new Set(inGroup('palette').map(token => token.name.split('.')[1])),
  ];
  return (
    <div className="palette">
      {families.map(family => (
        <div
          key={family}
          className="palette__row"
          role="group"
          aria-label={family}
        >
          <span className="palette__name">{family}</span>
          {inGroup(`palette.${family}`).map(token => (
            <span key={token.name} className="palette__step">
              <span
                className="palette__colour"
                style={{ background: use(token) }}
                title={`${token.variable}: ${token.value}`}
              />
              <span className="palette__label">
                {token.name.split('.').pop()}
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** How many tokens there are, for a sentence in a page. */
export function TokenCount(): ReactNode {
  return all.length;
}
