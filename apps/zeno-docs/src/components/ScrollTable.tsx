import { type ReactNode } from 'react';

/**
 * A table that scrolls sideways inside itself on a narrow screen, so the page
 * never does. The wrapper can be focused so the keyboard can scroll it.
 */
export function ScrollTable({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      className="scroll-table"
      role="region"
      aria-label={`${label} table`}
      // A scrolling region has to be reachable by keyboard.
      tabIndex={0}
    >
      <table>{children}</table>
    </div>
  );
}
