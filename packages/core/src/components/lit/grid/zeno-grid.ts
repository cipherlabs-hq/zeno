import { html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { ResponsiveValue } from '../../../types/base.js';

/**
 * A grid layout with a column count that can change per breakpoint.
 *
 * @slot - The grid items.
 * @csspart base
 */
@customElement('zeno-grid')
export class ZenoGrid extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        display: block;
        width: 100%;
      }

      /* Grid container */
      .grid {
        display: grid;
        width: 100%;
      }

      /* Default responsive behavior */
      @media (min-width: 640px) {
        .grid {
          grid-template-columns: var(--grid-cols-sm, var(--grid-cols));
          gap: var(--grid-gap-sm, var(--grid-gap));
        }
      }

      @media (min-width: 768px) {
        .grid {
          grid-template-columns: var(
            --grid-cols-md,
            var(--grid-cols-sm, var(--grid-cols))
          );
          gap: var(--grid-gap-md, var(--grid-gap-sm, var(--grid-gap)));
        }
      }

      @media (min-width: 1024px) {
        .grid {
          grid-template-columns: var(
            --grid-cols-lg,
            var(--grid-cols-md, var(--grid-cols-sm, var(--grid-cols)))
          );
          gap: var(
            --grid-gap-lg,
            var(--grid-gap-md, var(--grid-gap-sm, var(--grid-gap)))
          );
        }
      }

      @media (min-width: 1280px) {
        .grid {
          grid-template-columns: var(
            --grid-cols-xl,
            var(
              --grid-cols-lg,
              var(--grid-cols-md, var(--grid-cols-sm, var(--grid-cols)))
            )
          );
          gap: var(
            --grid-gap-xl,
            var(
              --grid-gap-lg,
              var(--grid-gap-md, var(--grid-gap-sm, var(--grid-gap)))
            )
          );
        }
      }
    `,
  ];

  @property({ type: Object }) cols: ResponsiveValue<number> = 1;
  @property({ type: Object }) gap: ResponsiveValue<string | number> = 4;
  @property() align: 'start' | 'center' | 'end' | 'stretch' = 'stretch';
  @property() justify:
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly' = 'start';
  @property() flow: 'row' | 'column' | 'row-dense' | 'column-dense' = 'row';
  @property({ type: Boolean }) inline = false;

  @state() private gridStyles: Record<string, string> = {};

  /**
   * Generate grid template columns value
   */
  private generateGridColumns(cols: number): string {
    if (cols === 0) return 'none';
    return `repeat(${cols}, minmax(0, 1fr))`;
  }

  /**
   * Generate gap value
   */
  private generateGapValue(gap: string | number): string {
    if (typeof gap === 'number') {
      // Assume number is spacing token index
      return `var(--zeno-spacing-${gap})`;
    }
    return gap;
  }

  /**
   * Generate responsive styles
   */
  private generateResponsiveStyles(): Record<string, string> {
    const styles: Record<string, string> = {};

    // Handle columns
    if (typeof this.cols === 'object' && this.cols !== null) {
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      breakpoints.forEach(bp => {
        const value = (this.cols as Record<string, number>)[bp];
        if (value !== undefined) {
          styles[`--grid-cols-${bp}`] = this.generateGridColumns(value);
        }
      });
      // Set base value from xs or first available
      const baseCol =
        (this.cols as Record<string, number>).xs || Object.values(this.cols)[0];
      if (baseCol !== undefined) {
        styles['--grid-cols'] = this.generateGridColumns(baseCol);
      }
    } else {
      styles['--grid-cols'] = this.generateGridColumns(this.cols as number);
    }

    // Handle gap
    if (typeof this.gap === 'object' && this.gap !== null) {
      const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      breakpoints.forEach(bp => {
        const value = (this.gap as Record<string, string | number>)[bp];
        if (value !== undefined) {
          styles[`--grid-gap-${bp}`] = this.generateGapValue(value);
        }
      });
      // Set base value from xs or first available
      const baseGap =
        (this.gap as Record<string, string | number>).xs ||
        Object.values(this.gap)[0];
      if (baseGap !== undefined) {
        styles['--grid-gap'] = this.generateGapValue(baseGap);
      }
    } else {
      styles['--grid-gap'] = this.generateGapValue(this.gap as string | number);
    }

    // Base grid styles
    styles['grid-template-columns'] = 'var(--grid-cols)';
    styles['gap'] = 'var(--grid-gap)';
    styles['align-items'] = this.align;
    styles['justify-content'] = this.justify;
    styles['grid-auto-flow'] = this.flow;

    if (this.inline) {
      styles['display'] = 'inline-grid';
    }

    return styles;
  }

  /**
   * Update lifecycle
   */
  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('cols') ||
      changedProperties.has('gap') ||
      changedProperties.has('align') ||
      changedProperties.has('justify') ||
      changedProperties.has('flow') ||
      changedProperties.has('inline')
    ) {
      this.gridStyles = this.generateResponsiveStyles();
    }
  }

  /**
   * First update lifecycle
   */
  protected override firstUpdated(): void {
    this.gridStyles = this.generateResponsiveStyles();
  }

  /**
   * Render the component
   */
  override render() {
    return html`
      <div
        part="base"
        class="grid"
        style=${styleMap(this.gridStyles)}
        role="group"
        aria-label=${this.ariaLabel || 'Grid layout'}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-grid': ZenoGrid;
  }
}
