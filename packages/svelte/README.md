# @usezeno/svelte

Zeno for Svelte 5. Svelte renders custom elements directly, so this package
does two things: it registers the elements, and it tells Svelte's type checker
their properties and events.

```svelte
<script lang="ts">
  import '@usezeno/tokens/css';
  import '@usezeno/svelte';

  let email = $state('');
</script>

<zeno-input
  name="email"
  type="email"
  label="Email"
  required
  value={email}
  oninput={event => (email = String(event.detail.value))}
></zeno-input>
```

## What works

- **Properties.** Svelte sets a property when the element has one, so arrays
  and objects pass through (`options={plans}`).
- **Events.** Write `on` plus the event name: `oninput`, `onchange`,
  `onrequest-close`. The handler's `event.detail` is typed.
- **`bind:this`**, to call methods such as `modal.show()`.
- **Type checking** with `svelte-check`: an unknown value for a typed property
  or a wrong `detail` field is an error.

## What does not work

- **`bind:value` and `bind:checked`.** Svelte's compiler allows them only on
  native form controls and rejects them on a custom element. Use the property
  and the event together, as in the example above. For a checkbox, switch or
  radio that is `checked={on}` with
  `onchange={event => (on = event.detail.checked)}`.
- **Rendering before the elements are registered.** Svelte then sets strings,
  numbers and booleans as attributes. A boolean `false` becomes the attribute
  text `"false"`, which the element reads as true. Import `@usezeno/svelte` in
  the component that uses the elements, or earlier.
- **Svelte's accessibility hints** do not know that `zeno-button` is a button.
  `<zeno-button onclick={…}>` gets two warnings about click handlers on
  non-interactive elements. `examples/svelte/svelte.config.js` shows a
  `warningFilter` that drops them for `zeno-` tags only.

`src/elements.ts` is generated. Change the element, then run `pnpm generate`
at the repository root.

`examples/svelte` is a working app. Its tests cover properties, events,
`bind:this`, a hyphenated cancelable event, and the compiler's refusal of
`bind:value` and `bind:checked`. The point about registration order comes from
reading Svelte's source (`set_custom_element_data`), not from a test.

Pre-release: the API can change in any 0.x minor release.
