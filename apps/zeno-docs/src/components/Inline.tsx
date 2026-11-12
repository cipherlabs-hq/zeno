import { type ReactNode } from 'react';

/** Text with `code spans`, as the notes and the source comments write them. */
export function Inline({ text }: { text: string }): ReactNode {
  return text
    .split(/(`[^`]+`)/)
    .map((piece, at) =>
      piece.startsWith('`') && piece.endsWith('`') && piece.length > 2 ? (
        <code key={at}>{piece.slice(1, -1)}</code>
      ) : (
        piece
      )
    );
}
