---
title: Using the elements
description: How attributes, properties, events, forms and overlays work across every Zeno element.
slug: /using-the-elements
---

# Using the elements

Zeno's elements are custom elements with the tag prefix `zeno-`. They work in
plain HTML and in any framework that renders HTML.

## Load them

```js
import '@usezeno/tokens/css';
import '@usezeno/core/web-components';
```

The first line loads the design tokens. The elements have no colours of their
own without it. The second line registers every element. There is one entry
point for all of them, so an app that uses two elements still loads them all.

```html
<zeno-button variant="primary">Save</zeno-button>
```

## Attributes and properties

Text, numbers and on/off settings can be written as attributes:

```html
<zeno-input label="Email" type="email" required></zeno-input>
```

A property with a two-word name has a kebab-case attribute: the property
`fullWidth` is the attribute `full-width`.

Arrays, objects and functions have to be set as properties from script:

```js
document.querySelector('zeno-select').options = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
];
```

An on/off attribute is on whenever it is present. `disabled="false"` still
disables the element. Remove the attribute, or set the property to `false`.

## Events

Listen with `addEventListener`, or with your framework's event syntax.

- `input` and `change` come from form controls. They bubble and cross shadow
  boundaries, like the native events, so one listener on a form hears every
  control inside it. `input` fires on each change and `change` when the change
  is committed.
- Every other event (`open`, `close`, `request-close`, `sort`, …) does not
  bubble. Listen on the element itself.
- Events are `CustomEvent`s. The new state is in `event.detail`, for example
  `event.detail.value` or `event.detail.checked`.
- Clickable elements such as `zeno-button` and `zeno-chip` send the browser's
  own `click` event. There is no separate custom click event.

## Forms

These elements are form controls: `zeno-input`, `zeno-textarea`,
`zeno-select`, `zeno-checkbox`, `zeno-switch`, `zeno-radio`,
`zeno-radio-group`, `zeno-slider`, `zeno-date-picker` and `zeno-file-upload`.
They take part in a `<form>` the way native controls do:

```html
<form>
  <zeno-input name="email" type="email" label="Email" required></zeno-input>
  <zeno-checkbox name="updates" label="Send me updates"></zeno-checkbox>
  <zeno-button type="submit">Sign up</zeno-button>
  <zeno-button type="reset" variant="ghost">Clear</zeno-button>
</form>
```

- **Submitting.** A control with a `name` adds its value to the form's data.
  `zeno-button` with `type="submit"` submits the form, and `type="reset"`
  resets it.
- **Labels.** Set the `label` attribute, or point a `<label for>` at the
  element's `id`. Clicking either one focuses or toggles the control, and
  screen readers announce it as the control's name.
- **Validation.** `required`, `type`, `pattern`, `min`, `max`, `minlength` and
  `maxlength` are checked as the browser checks them. An invalid control
  blocks the submit and matches the `:invalid` CSS selector. The message shows
  under the control once the user has left it or a submit was refused.
- **From script.** `checkValidity()`, `reportValidity()` and
  `setCustomValidity(message)` work as on a native input, and `validity`,
  `validationMessage`, `form` and `labels` are there to read. Set the `error`
  property to show a message of your own, for example one a server returned.
- **Disabled.** A control is disabled by its own `disabled` attribute or by a
  `<fieldset disabled>` around it. A disabled control is left out of the
  form's data.
- **Reset.** Resetting the form puts each control back to the value it had
  when it was added to the page.

The validation messages that Zeno writes itself, such as "Please fill out
this field.", are in English only for now.

## Overlays

`zeno-modal` and `zeno-drawer` are built on the browser's `<dialog>` element.
While one is open the rest of the page cannot be reached by mouse, keyboard or
screen reader, and focus returns to where it was when it closes.

```html
<zeno-modal heading="Delete this file?">
  <p>This cannot be undone.</p>
  <zeno-button slot="footer" variant="destructive">Delete</zeno-button>
</zeno-modal>
```

```js
const modal = document.querySelector('zeno-modal');
modal.show();
modal.addEventListener('close', () => console.log('closed'));
```

- Open with `show()` or by setting `open`. Close with `close()`.
- The close button, a click on the backdrop and the Escape key each ask to
  close. They send a `request-close` event first, with `event.detail.source`
  set to `close-button`, `backdrop` or `escape`. Call `event.preventDefault()`
  to keep the dialog open, for example while a form has unsaved changes.
- `no-backdrop-close`, `no-escape-close` and `no-close-button` switch each
  route off.

`zeno-tooltip`, the list of `zeno-select` and the calendar of
`zeno-date-picker` use the browser's popover feature. They show above
everything else on the page and are never cut off by a scrolling container.

## Styling

- **Tokens.** Change a `--zeno-*` custom property on `:root`, or on any
  element to affect what is inside it. See [Tokens and theming](./tokens.mdx).
- **Parts.** Elements expose their inner pieces as CSS parts:
  `zeno-button::part(base)`. Each [element page](/elements) lists that
  element's parts, slots, properties and events. The same data is in the
  custom-elements manifest, `@usezeno/core/custom-elements.json`, for editors
  and tools.
