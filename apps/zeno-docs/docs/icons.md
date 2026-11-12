---
title: Icons
description: The icons that come with Zeno, how to add your own, and what to use in place of an icon package.
slug: /icons
---

# Icons

`zeno-icon` draws an icon by name from a registry. Zeno ships 50 names, drawn
from [Feather](https://feathericons.com) (MIT): arrows and chevrons, common
actions (copy, download, external link, filter, refresh), status icons (info,
check, warning, error) and a few places and things (map, map pin, crosshair,
calendar). The other elements use these names, so an alert, a password field
or a date picker draws its icons with nothing to set up. The element docs list
every name.

## In an app

There is no separate icon package. Use the element, or the wrapper for your
framework:

```tsx
import { ZenoIcon } from '@usezeno/react';

<ZenoIcon name="download" />            // decoration: hidden from screen readers
<ZenoIcon name="map" label="Map" />     // an image with a name
<ZenoIcon name="search" size="16" />    // 16px, whatever the font size
```

An icon inside a button or a link is decoration: the button's text or
`aria-label` names it. Give an icon a `label` only when it stands alone and
means something.

## Your own icons

Add names to the registry once, at start-up. Draw them on a 24 by 24 grid with
2px round strokes so they sit with the built-in set. Lucide (ISC) and Feather
(MIT) icons fit as they are: copy the inside of the `<svg>`.

```ts
import { ZenoIcon } from '@usezeno/core/web-components';

ZenoIcon.registerIcons({
  square: '<rect x="3" y="3" width="18" height="18" rx="2"></rect>',
});
```

Two more ways, for a single icon:

- `src` loads an SVG file and uses it as a mask, so it takes the text colour
  and nothing in the file can run.
- An inline `<svg>` in the element's slot is shown as it is.

## Coming from Carbon icons

`@carbon/icons-react` ships each icon as a React component. With Zeno, map each
one to a name, for example `Launch` to `external-link`, `Information` to
`info`, `LocationCurrent` to `crosshair`, `Renew` to `refresh-cw`, `View` to
`eye`, `CheckmarkFilled` to `check-circle` and `WarningAltFilled` to
`alert-triangle`. Register a name for anything the set does not have.
