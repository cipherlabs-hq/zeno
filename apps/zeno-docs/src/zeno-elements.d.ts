// Lets TSX files write Zeno tags. The attributes are not checked here: the
// examples on the element pages are checked against the manifest instead.
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ZenoTag = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> &
  Record<string, unknown>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [tag: `zeno-${string}`]: ZenoTag;
    }
  }
}
