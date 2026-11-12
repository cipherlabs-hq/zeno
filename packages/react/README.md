# @usezeno/react

React components for the Zeno elements. Each one wraps an element from
`@usezeno/core` with [`@lit/react`](https://www.npmjs.com/package/@lit/react),
so props and events are typed. Works with React 18 and 19.

```tsx
import '@usezeno/tokens/css';
import { useState } from 'react';
import { ZenoButton, ZenoInput } from '@usezeno/react';

export function SignUp() {
  const [email, setEmail] = useState('');
  return (
    <form>
      <ZenoInput
        name="email"
        type="email"
        label="Email"
        required
        value={email}
        onInput={event => setEmail(String(event.detail.value))}
      />
      <ZenoButton type="submit">Sign up</ZenoButton>
    </form>
  );
}
```

- A component is named after its element: `zeno-date-picker` is
  `ZenoDatePicker`.
- Props are the element's properties, so arrays and objects pass through as
  they are (`options={plans}`).
- An event is a prop named `on` plus the event name in PascalCase:
  `request-close` is `onRequestClose`. The handler gets the element's
  `CustomEvent`, with a typed `detail`.
- `onInput` runs on every change and `onChange` when the change is committed,
  as they do on the elements. That differs from React's own `onChange` on
  `<input>`.
- For a ref, the element classes are exported as types with an `Element`
  suffix: `useRef<ZenoModalElement>(null)`.
- Importing the package registers every element. There are no per-component
  entry points yet.

`src/index.ts` is generated. Change the element, then run `pnpm generate` at
the repository root.

`examples/react` is a working app with tests.

Pre-release: the API can change in any 0.x minor release.
