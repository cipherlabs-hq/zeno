import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import type { ZenoSlider } from '../../src/components/lit/slider/zeno-slider.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const control = (el: Element) => el.shadowRoot!.querySelector('input')!;

describe('zeno-slider in a form', () => {
  it('submits its value, and the minimum when it has none', async () => {
    const main = await mount(`<form>
      <zeno-slider name="a" label="A" value="30"></zeno-slider>
      <zeno-slider name="b" label="B" min="10" max="20"></zeno-slider>
      <zeno-slider name="c" label="C" value="0" min="-5" max="5"></zeno-slider>
    </form>`);
    expect(entries(main.querySelector('form')!)).toEqual([
      ['a', '30'],
      ['b', '10'],
      ['c', '0'],
    ]);
  });

  it('moves with the arrow keys and reports a number', async () => {
    const main = await mount(
      `<form><zeno-slider name="a" label="Volume" value="50" step="5"></zeno-slider></form>`
    );
    const slider = main.querySelector<ZenoSlider>('zeno-slider')!;
    const seen: unknown[] = [];
    slider.addEventListener('input', event =>
      seen.push((event as CustomEvent).detail.value)
    );
    control(slider).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}');
    await settle(main);
    expect(seen).toEqual([55, 60, 55]);
    expect(entries(main.querySelector('form')!)).toEqual([['a', '55']]);
  });

  it('takes its name from an outside label and focuses when that label is clicked', async () => {
    const main = await mount(
      `<label for="s">Brightness</label><zeno-slider id="s"></zeno-slider>`
    );
    const slider = main.querySelector<ZenoSlider>('zeno-slider')!;
    expect(control(slider).getAttribute('aria-label')).toBe('Brightness');
    await userEvent.click(main.querySelector('label')!);
    expect(slider.shadowRoot!.activeElement).toBe(control(slider));
  });

  it('is disabled by an ancestor fieldset and submits nothing while disabled', async () => {
    const main = await mount(
      `<form><fieldset disabled><zeno-slider name="a" label="A" value="3"></zeno-slider></fieldset></form>`
    );
    expect(control(main.querySelector('zeno-slider')!).disabled).toBe(true);
    expect(entries(main.querySelector('form')!)).toEqual([]);
  });

  it('goes back to its first value when the form is reset', async () => {
    const main = await mount(
      `<form><zeno-slider name="a" label="A" value="40"></zeno-slider></form>`
    );
    const slider = main.querySelector<ZenoSlider>('zeno-slider')!;
    control(slider).focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(main);
    expect(Number(slider.value)).toBe(41);
    main.querySelector('form')!.reset();
    await settle(main);
    expect(Number(slider.value)).toBe(40);
    expect(control(slider).value).toBe('40');
  });

  it('has no axe violations', async () => {
    const main = await mount(`
      <zeno-slider label="Volume" value="30"></zeno-slider>
      <zeno-slider label="With marks" value="50" show-marks step="25" show-tooltip></zeno-slider>
      <zeno-slider label="Disabled" value="30" disabled></zeno-slider>
    `);
    await expectAccessible(main);
  });
});
