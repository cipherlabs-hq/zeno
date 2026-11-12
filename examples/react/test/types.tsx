// Compile-time checks, run by `pnpm typecheck`. Each @ts-expect-error line
// fails the typecheck if the mistake below it stops being an error.

import { ZenoButton, ZenoCheckbox, ZenoSelect } from '@usezeno/react';

export const typed = (
  <>
    {/* @ts-expect-error 'nope' is not a button variant */}
    <ZenoButton variant="nope" />
    {/* @ts-expect-error options takes an array of options */}
    <ZenoSelect options={42} />
    <ZenoCheckbox
      onChange={event => {
        const checked: boolean = event.detail.checked;
        // @ts-expect-error the detail of change has no such field
        void event.detail.nope;
        return checked;
      }}
    />
  </>
);
