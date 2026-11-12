// Checks for fixes made for the CleanPlated site: icons the elements ask
// for, pixel icon sizes, the input's help text and buttons, tags, the
// slider's thumb and the hamburger's state.
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoInput } from '../../src/components/lit/input/zeno-input.js';
import type { ZenoHamburger } from '../../src/components/lit/hamburger/zeno-hamburger.js';
import { ZenoIcon } from '../../src/components/lit/icon/zeno-icon.js';
import { expectAccessible, mount, settle } from './helpers.js';

describe('zeno-icon built-in set', () => {
  it('has every name the other elements ask for', () => {
    for (const name of [
      'info',
      'check-circle',
      'alert-triangle',
      'alert-circle',
      'x-circle',
      'eye',
      'eye-off',
      'more-horizontal',
      'upload-cloud',
      'calendar',
      'sun',
      'moon',
      'file',
      'file-text',
      'image',
      'copy',
      'external-link',
    ]) {
      expect(ZenoIcon.getIcon(name), name).toBeTruthy();
    }
  });

  it('takes a size in pixels', async () => {
    const main = await mount(
      `<p style="font-size: 32px"><zeno-icon name="map" size="16"></zeno-icon></p>`
    );
    const svg = main
      .querySelector('zeno-icon')!
      .shadowRoot!.querySelector('svg')!;
    expect(svg.getBoundingClientRect().width).toBe(16);
  });
});

describe('zeno-input help text and buttons', () => {
  it('describes the field with its help text', async () => {
    const main = await mount(
      `<zeno-input label="Organization" help-text="Newsroom, agency or university"></zeno-input>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    const control = input.shadowRoot!.querySelector('input')!;
    const help = input.shadowRoot!.querySelector('[part="help-text"]')!;
    expect(help.textContent!.trim()).toBe('Newsroom, agency or university');
    expect(control.getAttribute('aria-describedby')).toBe(help.id);
    input.error = 'Required';
    await settle(main);
    expect(control.getAttribute('aria-describedby')).toBe(
      'field-help field-error'
    );
  });

  it('shows and hides the password from the keyboard', async () => {
    const main = await mount(
      `<zeno-input label="API key" type="password" show-password-toggle value="abc"></zeno-input>`
    );
    const input = main.querySelector<ZenoInput>('zeno-input')!;
    const control = input.shadowRoot!.querySelector('input')!;
    control.focus();
    await userEvent.keyboard('{Tab}');
    const toggle = input.shadowRoot!.activeElement as HTMLElement;
    expect(toggle.getAttribute('part')).toBe('password-toggle');
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(
      toggle.querySelector('zeno-icon')!.shadowRoot!.querySelector('svg')
    ).not.toBeNull();
    await userEvent.keyboard('{Enter}');
    await settle(main);
    expect(control.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    await expectAccessible(main);
  });
});

describe('zeno-tag', () => {
  it('has a background with the default variant and shape, and is not a live region', async () => {
    const main = await mount(`<zeno-tag>Closures only</zeno-tag>`);
    const base = main
      .querySelector('zeno-tag')!
      .shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    expect(base.classList.contains('tag--default')).toBe(true);
    expect(getComputedStyle(base).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(base.hasAttribute('role')).toBe(false);
  });

  it('shows content in its prefix slot', async () => {
    const main = await mount(
      `<zeno-tag><zeno-icon slot="prefix" name="check"></zeno-icon>Full data</zeno-tag>`
    );
    const prefix = main
      .querySelector('zeno-tag')!
      .shadowRoot!.querySelector<HTMLElement>('[part="prefix"]')!;
    expect(prefix.hidden).toBe(false);
    expect(prefix.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});

describe('zeno-slider thumb', () => {
  it('is not clipped by the track and shows keyboard focus', async () => {
    const main = await mount(
      `<zeno-slider label="Radius" min="0" max="10" value="0"></zeno-slider>`
    );
    const slider = main.querySelector('zeno-slider')!;
    const root = slider.shadowRoot!;
    const track = root.querySelector<HTMLElement>('[part="track"]')!;
    const thumb = root.querySelector<HTMLElement>('[part="thumb"]')!;
    expect(getComputedStyle(track).overflow).toBe('visible');
    // At the minimum the whole thumb sits inside the track's width.
    expect(thumb.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      track.getBoundingClientRect().left - 0.5
    );
    root.querySelector('input')!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(getComputedStyle(thumb).outlineStyle).toBe('solid');
  });
});

describe('zeno-hamburger', () => {
  it('reports the menu state with aria-expanded and keeps its name', async () => {
    const main = await mount(`<zeno-hamburger></zeno-hamburger>`);
    const burger = main.querySelector<ZenoHamburger>('zeno-hamburger')!;
    const button = burger.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('aria-label')).toBe('Menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.hasAttribute('aria-pressed')).toBe(false);
    await userEvent.click(button);
    await settle(main);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Menu');
  });
});

describe('zeno-button state for assistive technology', () => {
  it('names an icon-only button and reports expanded and pressed', async () => {
    const main = await mount(`
      <zeno-button id="icon" icon-only label="Show on the map"><zeno-icon name="map"></zeno-icon></zeno-button>
      <zeno-button id="filters" expanded="false">Filters</zeno-button>
      <zeno-button id="list" variant="ghost" pressed>List</zeno-button>
      <zeno-button id="plain">Plain</zeno-button>`);
    const inner = (id: string) =>
      main.querySelector(`#${id}`)!.shadowRoot!.querySelector('button')!;
    expect(inner('icon').getAttribute('aria-label')).toBe('Show on the map');
    expect(inner('filters').getAttribute('aria-expanded')).toBe('false');
    expect(inner('list').getAttribute('aria-pressed')).toBe('true');
    expect(inner('plain').hasAttribute('aria-pressed')).toBe(false);
    expect(inner('plain').hasAttribute('aria-expanded')).toBe(false);
    const filters = main.querySelector('#filters') as HTMLElement & {
      expanded?: boolean;
    };
    filters.expanded = true;
    await settle(main);
    expect(inner('filters').getAttribute('aria-expanded')).toBe('true');
    await expectAccessible(main);
  });
});
