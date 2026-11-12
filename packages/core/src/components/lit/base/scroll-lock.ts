/**
 * Stops the page behind an open modal from scrolling. Several overlays can
 * hold the lock at once; the page scrolls again when the last one lets go.
 */

let holders = 0;
let previousOverflow = '';

/** Locks page scrolling and returns the function that releases this hold. */
export function lockScroll(): () => void {
  const root = document.documentElement;
  if (holders === 0) {
    previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
  }
  holders++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    holders--;
    if (holders === 0) {
      root.style.overflow = previousOverflow;
    }
  };
}
