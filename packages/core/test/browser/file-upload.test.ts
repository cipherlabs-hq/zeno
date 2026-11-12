import { describe, expect, it } from 'vitest';
import type { ZenoFileUpload } from '../../src/components/lit/file-upload/zeno-file-upload.js';
import { entries, expectAccessible, mount, settle } from './helpers.js';

const browse = (el: Element) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('.upload__browse')!;

/** Puts files on the native input the way the file chooser would. */
async function choose(el: Element, ...files: File[]) {
  const input =
    el.shadowRoot!.querySelector<HTMLInputElement>('input[type="file"]')!;
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  await settle();
}

const text = (name: string, body = 'hello') =>
  new File([body], name, { type: 'text/plain' });

async function mountUpload(markup: string) {
  const main = await mount(markup);
  const upload = main.querySelector<ZenoFileUpload>('zeno-file-upload')!;
  return { main, upload, form: main.querySelector('form') };
}

describe('zeno-file-upload in a form', () => {
  it('submits the chosen files under its name', async () => {
    const { upload, form } = await mountUpload(
      `<form><zeno-file-upload name="docs" label="Documents" multiple></zeno-file-upload></form>`
    );
    expect(entries(form!)).toEqual([]);
    const seen: number[] = [];
    upload.addEventListener('change', event =>
      seen.push((event as CustomEvent).detail.files.length)
    );
    await choose(upload, text('a.txt'), text('b.txt'));
    expect(entries(form!)).toEqual([
      ['docs', 'file:a.txt'],
      ['docs', 'file:b.txt'],
    ]);
    expect(upload.files.map(file => file.name)).toEqual(['a.txt', 'b.txt']);
    expect(seen).toEqual([2]);
    const submitted = new FormData(form!).get('docs') as File;
    expect(await submitted.text()).toBe('hello');
  });

  it('keeps only the newest file unless multiple', async () => {
    const { upload, form } = await mountUpload(
      `<form><zeno-file-upload name="doc" label="Document"></zeno-file-upload></form>`
    );
    await choose(upload, text('a.txt'));
    await choose(upload, text('b.txt'));
    expect(entries(form!)).toEqual([['doc', 'file:b.txt']]);
  });

  it('turns away files that are too large or of the wrong type', async () => {
    const { upload, form } = await mountUpload(
      `<form><zeno-file-upload name="docs" label="Documents" multiple accept=".txt" max-size="10"></zeno-file-upload></form>`
    );
    const errors: string[] = [];
    upload.addEventListener('file-error', event =>
      errors.push((event as CustomEvent).detail.file.name)
    );
    await choose(
      upload,
      text('ok.txt', 'short'),
      text('big.txt', 'much too long for this'),
      new File(['x'], 'photo.png', { type: 'image/png' })
    );
    expect(errors).toEqual(['big.txt', 'photo.png']);
    expect(entries(form!)).toEqual([['docs', 'file:ok.txt']]);
  });

  it('removes a file with its remove button', async () => {
    const { upload, form } = await mountUpload(
      `<form><zeno-file-upload name="docs" label="Documents" multiple></zeno-file-upload></form>`
    );
    await choose(upload, text('a.txt'), text('b.txt'));
    const remove =
      upload.shadowRoot!.querySelector<HTMLButtonElement>(
        '.file-item__remove'
      )!;
    expect(remove.getAttribute('aria-label')).toBe('Remove a.txt');
    remove.click();
    await settle();
    expect(entries(form!)).toEqual([['docs', 'file:b.txt']]);
  });

  it('is invalid while required with no file', async () => {
    const { main, upload, form } = await mountUpload(
      `<form><zeno-file-upload name="doc" label="Document" required></zeno-file-upload></form>`
    );
    expect(upload.validity.valueMissing).toBe(true);
    expect(upload.invalid).toBe(false);
    form!.requestSubmit();
    await settle(main);
    expect(upload.invalid).toBe(true);
    expect(upload.shadowRoot!.querySelector('#field-error')).not.toBeNull();
    await choose(upload, text('a.txt'));
    expect(upload.validity.valid).toBe(true);
    expect(upload.invalid).toBe(false);
  });

  it('names its button from the label, inside or outside', async () => {
    const { main, upload } = await mountUpload(
      `<label for="u">Passport scan</label><zeno-file-upload id="u"></zeno-file-upload>
       <zeno-file-upload label="Proof of address"></zeno-file-upload>`
    );
    expect(browse(upload).getAttribute('aria-label')).toBe(
      'Passport scan: Drop files here or browse'
    );
    const second = main.querySelectorAll('zeno-file-upload')[1];
    expect(browse(second).getAttribute('aria-label')).toBe(
      'Proof of address: Drop files here or browse'
    );
  });

  it('is disabled by an ancestor fieldset', async () => {
    const { upload } = await mountUpload(
      `<form><fieldset disabled><zeno-file-upload name="doc" label="Document"></zeno-file-upload></fieldset></form>`
    );
    expect(browse(upload).disabled).toBe(true);
  });

  it('drops its files when the form is reset', async () => {
    const { main, upload, form } = await mountUpload(
      `<form><zeno-file-upload name="doc" label="Document"></zeno-file-upload></form>`
    );
    await choose(upload, text('a.txt'));
    form!.reset();
    await settle(main);
    expect(upload.files).toEqual([]);
    expect(entries(form!)).toEqual([]);
  });

  it('has no axe violations, empty or with files', async () => {
    const { main, upload } = await mountUpload(`
      <zeno-file-upload label="Documents" multiple max-size="1048576"></zeno-file-upload>
      <zeno-file-upload label="Disabled" disabled></zeno-file-upload>
      <zeno-file-upload label="Wrong" error="Add a file"></zeno-file-upload>
    `);
    await expectAccessible(main);
    await choose(upload, text('a.txt'), text('b.txt'));
    await expectAccessible(main);
  });
});
