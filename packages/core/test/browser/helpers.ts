import axe from 'axe-core';
import { afterEach, expect } from 'vitest';
import { userEvent } from 'vitest/browser';

interface Updatable {
  updateComplete?: Promise<unknown>;
}

const mounted: HTMLElement[] = [];

afterEach(async () => {
  for (const node of mounted.splice(0)) node.remove();
  document.documentElement.removeAttribute('data-theme');
  await parkPointer();
});

/**
 * Moves the pointer to the bottom-right corner of the viewport. The browser
 * keeps the pointer where the last test left it, and the next test's
 * fixture is mounted at the same place: without this, an element can start
 * a test in its :hover state, depending on which test file ran before.
 */
async function parkPointer(): Promise<void> {
  const corner = document.createElement('div');
  corner.style.cssText =
    'position: fixed; right: 0; bottom: 0; width: 2px; height: 2px; z-index: 2147483647';
  document.body.append(corner);
  try {
    await userEvent.hover(corner);
  } finally {
    corner.remove();
  }
}

export function nextFrame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

/** Waits until every Lit element under `root` has finished rendering. */
export async function settle(root: ParentNode = document): Promise<void> {
  for (let pass = 0; pass < 3; pass++) {
    const elements = [...root.querySelectorAll<HTMLElement & Updatable>('*')];
    await Promise.all(elements.map(element => element.updateComplete));
    await nextFrame();
  }
}

/** Adds markup to the page inside a <main> landmark and returns that node. */
export async function mount(markup: string): Promise<HTMLElement> {
  const main = document.createElement('main');
  main.style.cssText =
    'background: var(--zeno-color-background-page); color: var(--zeno-color-text-primary); padding: 16px';
  main.innerHTML = markup;
  document.body.append(main);
  mounted.push(main);
  await settle(main);
  return main;
}

export function entries(form: HTMLFormElement): [string, string][] {
  return [...new FormData(form).entries()].map(([name, value]) => [
    name,
    value instanceof File ? `file:${value.name}` : value,
  ]);
}

function runningAnimations(root: Document | ShadowRoot): Animation[] {
  // Transitions only: a spinner's animation never finishes.
  const found = root
    .getAnimations()
    .filter(animation => animation instanceof CSSTransition);
  for (const element of root.querySelectorAll('*')) {
    if (element.shadowRoot)
      found.push(...runningAnimations(element.shadowRoot));
  }
  return found;
}

/**
 * Colours move to a new theme over a short transition, which starts with a
 * later style pass. Waits until nothing has been moving for a few frames.
 */
async function transitionsEnd(): Promise<void> {
  for (let quietFrames = 0; quietFrames < 3;) {
    await nextFrame();
    const running = runningAnimations(document);
    if (running.length > 0) {
      await Promise.allSettled(running.map(animation => animation.finished));
      quietFrames = 0;
    } else {
      quietFrames++;
    }
  }
}

/** Runs axe over `node` in the light theme and again in the dark theme. */
export async function expectAccessible(node: Element): Promise<void> {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-theme', theme);
    await transitionsEnd();
    const { violations } = await axe.run(node, {
      // The fixture is a fragment, not a whole page.
      rules: { region: { enabled: false } },
    });
    const summary = violations.map(
      violation =>
        `${theme}: ${violation.id} (${violation.nodes
          .map(found => found.target.join(' '))
          .join(', ')}): ${violation.help}`
    );
    expect(summary).toEqual([]);
  }
}
