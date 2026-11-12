/**
 * Shows an element in the top layer, placed against an anchor.
 *
 * The element carries `popover="manual"`, so the browser lifts it above the
 * page and no ancestor can clip it. Where the popover API is missing the
 * element is still fixed to the anchor; it is only not in the top layer.
 * Placement is done here because CSS anchor positioning is not yet available
 * in every current browser.
 */

export interface AnchoredPopoverOptions {
  anchor: () => HTMLElement | null | undefined;
  popover: () => HTMLElement | null | undefined;
  /** Runs on a press outside the host element. */
  onOutsidePress: () => void;
  /** Make the popover as wide as the anchor. */
  matchWidth?: boolean;
  /** Custom property that receives the height left for the popover. */
  heightProperty?: string;
}

const GAP = 4;

/**
 * True when the element is an open popover. A browser without the popover
 * API (or a test DOM such as jsdom) does not know the `:popover-open`
 * selector and throws on it, so that counts as not open.
 */
export function isPopoverOpen(element: Element | null | undefined): boolean {
  if (!element) return false;
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

export class AnchoredPopover {
  private shown = false;

  constructor(
    private readonly host: HTMLElement,
    private readonly options: AnchoredPopoverOptions
  ) {}

  get isShown(): boolean {
    return this.shown;
  }

  show(): void {
    const popover = this.options.popover();
    if (this.shown || !popover) return;
    this.shown = true;
    popover.showPopover?.();
    this.position();
    window.addEventListener('scroll', this.position, true);
    window.addEventListener('resize', this.position);
    document.addEventListener('pointerdown', this.handlePress, true);
  }

  hide(): void {
    if (!this.shown) return;
    this.shown = false;
    const popover = this.options.popover();
    if (isPopoverOpen(popover)) popover?.hidePopover();
    window.removeEventListener('scroll', this.position, true);
    window.removeEventListener('resize', this.position);
    document.removeEventListener('pointerdown', this.handlePress, true);
  }

  /** Below the anchor, or above it when there is more room there. */
  readonly position = (): void => {
    const anchor = this.options.anchor();
    const popover = this.options.popover();
    if (!anchor || !popover) return;

    const rect = anchor.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - GAP;
    const above = rect.top - GAP;
    const wanted = popover.scrollHeight;
    const openUp = below < Math.min(wanted, 160) && above > below;
    const style = popover.style;

    style.position = 'fixed';
    style.margin = '0';
    style.right = 'auto';
    style.left = `${Math.max(0, Math.min(rect.left, window.innerWidth - popover.offsetWidth))}px`;
    style.top = openUp ? 'auto' : `${rect.bottom + GAP}px`;
    style.bottom = openUp ? `${window.innerHeight - rect.top + GAP}px` : 'auto';
    if (this.options.matchWidth) {
      style.width = `${rect.width}px`;
      style.left = `${rect.left}px`;
    }
    if (this.options.heightProperty) {
      style.setProperty(
        this.options.heightProperty,
        `${Math.max(80, (openUp ? above : below) - 8)}px`
      );
    }
  };

  private readonly handlePress = (event: Event): void => {
    if (!event.composedPath().includes(this.host)) {
      this.options.onOutsidePress();
    }
  };
}
