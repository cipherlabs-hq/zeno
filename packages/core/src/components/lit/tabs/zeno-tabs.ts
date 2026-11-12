import { html, css, nothing, type PropertyValues } from 'lit';
import {
  customElement,
  property,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ZenoElement } from '../base/zeno-element.js';
import type { TabsVariant, TabsSize, TabItem } from '../types.js';

/**
 * A row of tabs that shows one panel at a time.
 *
 * @slot - The panels, one per tab.
 * @fires {CustomEvent<{ value: string; tab: TabItem }>} change - A different tab was selected.
 * @csspart badge
 * @csspart base
 * @csspart icon
 * @csspart label
 * @csspart list
 * @csspart panels
 * @csspart tab
 */
@customElement('zeno-tabs')
export class ZenoTabs extends ZenoElement {
  static override styles = [
    ZenoElement.baseStyles,
    css`
      :host {
        --tabs-border-width: 2px;
        --tabs-indicator-height: 2px;
        --tabs-padding-sm: var(--zeno-spacing-2) var(--zeno-spacing-3);
        --tabs-padding-md: var(--zeno-spacing-3) var(--zeno-spacing-4);
        --tabs-padding-lg: var(--zeno-spacing-4) var(--zeno-spacing-5);
        --tabs-font-size-sm: var(--zeno-font-size-sm);
        --tabs-font-size-md: var(--zeno-font-size-md);
        --tabs-font-size-lg: var(--zeno-font-size-lg);
        --tabs-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
      }

      /* Tabs container */
      .tabs {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      /* Tab list */
      .tabs__list {
        display: flex;
        position: relative;
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .tabs__list::-webkit-scrollbar {
        display: none;
      }

      /* Line variant */
      .tabs--line .tabs__list {
        border-bottom: 1px solid var(--zeno-color-border-subtle);
      }

      /* Card variant */
      .tabs--card .tabs__list {
        gap: var(--zeno-spacing-2);
        padding: var(--zeno-spacing-2);
        background: var(--zeno-color-background-subtle);
        border-radius: var(--zeno-radius-lg);
      }

      /* Pills variant */
      .tabs--pills .tabs__list {
        gap: var(--zeno-spacing-2);
      }

      /* Tab button */
      .tabs__tab {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-2);
        padding: var(--tabs-padding);
        border: none;
        background: transparent;
        color: var(--zeno-color-text-secondary);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--tabs-font-size);
        font-weight: var(--zeno-font-weight-medium);
        line-height: 1;
        cursor: pointer;
        transition: var(--tabs-transition);
        white-space: nowrap;
        user-select: none;
      }

      /* Size variants */
      .tabs--sm .tabs__tab {
        padding: var(--tabs-padding-sm);
        font-size: var(--tabs-font-size-sm);
      }

      .tabs--md .tabs__tab {
        padding: var(--tabs-padding-md);
        font-size: var(--tabs-font-size-md);
      }

      .tabs--lg .tabs__tab {
        padding: var(--tabs-padding-lg);
        font-size: var(--tabs-font-size-lg);
      }

      /* Hover state */
      .tabs__tab:hover:not(:disabled) {
        color: var(--zeno-color-text-primary);
      }

      /* Focus state */
      .tabs__tab:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
        border-radius: var(--zeno-radius-sm);
      }

      /* Active state */
      .tabs__tab--active {
        color: var(--zeno-color-accent-text);
      }

      /* Disabled state */
      .tabs__tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Line variant styles */
      .tabs--line .tabs__tab {
        padding-bottom: calc(
          var(--zeno-spacing-3) + var(--tabs-indicator-height)
        );
        margin-bottom: calc(-1 * var(--tabs-indicator-height));
      }

      .tabs--line .tabs__tab--active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: var(--tabs-indicator-height);
        background: var(--zeno-color-accent-solid);
        border-radius: var(--tabs-indicator-height);
      }

      /* Card variant styles */
      .tabs--card .tabs__tab {
        border-radius: var(--zeno-radius-md);
      }

      .tabs--card .tabs__tab:hover:not(:disabled) {
        background: var(--zeno-color-background-hover);
      }

      .tabs--card .tabs__tab--active {
        background: var(--zeno-color-background-surface);
        box-shadow: var(--zeno-shadow-xs);
      }

      /* Pills variant styles */
      .tabs--pills .tabs__tab {
        border-radius: var(--zeno-radius-full);
        border: 1px solid transparent;
      }

      .tabs--pills .tabs__tab:hover:not(:disabled) {
        background: var(--zeno-color-background-hover);
      }

      .tabs--pills .tabs__tab--active {
        background: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      /* Tab icon */
      .tabs__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      /* Tab badge */
      .tabs__badge {
        margin-left: var(--zeno-spacing-2);
      }

      /* Tab panels container */
      .tabs__panels {
        position: relative;
        flex: 1;
      }

      /* Tab panel */
      .tabs__panel {
        padding: var(--zeno-spacing-4);
        animation: fadeIn var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Vertical orientation */
      .tabs--vertical {
        flex-direction: row;
      }

      .tabs--vertical .tabs__list {
        flex-direction: column;
        border-bottom: none;
        border-right: 1px solid var(--zeno-color-border-subtle);
        overflow-x: visible;
        overflow-y: auto;
      }

      .tabs--vertical.tabs--line .tabs__tab {
        padding-bottom: var(--tabs-padding);
        padding-right: calc(
          var(--zeno-spacing-4) + var(--tabs-indicator-height)
        );
        margin-bottom: 0;
        margin-right: calc(-1 * var(--tabs-indicator-height));
      }

      .tabs--vertical.tabs--line .tabs__tab--active::after {
        top: 0;
        bottom: 0;
        left: auto;
        right: 0;
        width: var(--tabs-indicator-height);
        height: auto;
      }

      /* Full width */
      .tabs--full-width .tabs__tab {
        flex: 1;
        justify-content: center;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .tabs__list {
          border-color: ButtonText;
        }

        .tabs__tab--active {
          outline: 2px solid ButtonText;
          outline-offset: -2px;
        }

        .tabs--line .tabs__tab--active::after {
          background: ButtonText;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .tabs__tab {
          transition: none;
        }

        .tabs__panel {
          animation: none;
        }
      }

      /* Print styles */
      @media print {
        .tabs__list {
          border-color: #000;
        }

        .tabs__tab {
          border: 1px solid #000;
        }

        .tabs__tab--active {
          background: #000;
          color: white;
        }
      }
    `,
  ];

  @property({ type: Array }) tabs: TabItem[] = [];
  @property() value = '';
  @property({ reflect: true }) variant: TabsVariant = 'line';
  @property({ reflect: true }) size: TabsSize = 'md';
  @property({ type: Boolean, reflect: true }) vertical = false;
  @property({ type: Boolean, reflect: true, attribute: 'full-width' })
  fullWidth = false;

  @state() private activeTab = '';

  @queryAssignedElements() private panels!: HTMLElement[];

  /**
   * First updated lifecycle
   */
  protected override firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    // Set initial active tab
    if (!this.activeTab && this.tabs.length > 0) {
      this.activeTab =
        this.value || this.tabs.find(tab => !tab.disabled)?.value || '';
    }

    this.updatePanels();
  }

  /**
   * Updated lifecycle
   */
  protected override updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.activeTab = this.value;
      this.updatePanels();
    }

    if (changedProperties.has('tabs')) {
      this.updatePanels();
    }
  }

  /**
   * Select a tab
   */
  selectTab(value: string): void {
    const tab = this.tabs.find(t => t.value === value);
    if (!tab || tab.disabled) return;

    this.activeTab = value;
    this.value = value;
    this.updatePanels();

    this.emitEvent('change', {
      value,
      tab,
    });
  }

  /**
   * Update panel visibility
   */
  private updatePanels(): void {
    this.panels.forEach((panel, index) => {
      const tab = this.tabs[index];
      if (tab) {
        panel.hidden = tab.value !== this.activeTab;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tab-${tab.value}`);
      }
    });
  }

  /**
   * Handle tab click
   */
  private handleTabClick(tab: TabItem): void {
    if (tab.disabled) return;
    this.selectTab(tab.value);
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeyDown(event: KeyboardEvent, currentIndex: number): void {
    const enabledTabs = this.tabs.filter(tab => !tab.disabled);
    const enabledIndexes = this.tabs
      .map((tab, index) => ({ tab, index }))
      .filter(({ tab }) => !tab.disabled)
      .map(({ index }) => index);

    if (enabledTabs.length === 0) return;

    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        const nextEnabledIndex = enabledIndexes.find(i => i > currentIndex);
        nextIndex =
          nextEnabledIndex !== undefined ? nextEnabledIndex : enabledIndexes[0];
        break;
      }

      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        const prevEnabledIndex = [...enabledIndexes]
          .reverse()
          .find(i => i < currentIndex);
        nextIndex =
          prevEnabledIndex !== undefined
            ? prevEnabledIndex
            : enabledIndexes[enabledIndexes.length - 1];
        break;
      }

      case 'Home':
        event.preventDefault();
        nextIndex = enabledIndexes[0];
        break;

      case 'End':
        event.preventDefault();
        nextIndex = enabledIndexes[enabledIndexes.length - 1];
        break;

      default:
        return;
    }

    if (nextIndex !== currentIndex) {
      this.selectTab(this.tabs[nextIndex].value);
      // Focus the new tab button
      const tabButtons = this.shadowRoot?.querySelectorAll('.tabs__tab');
      (tabButtons?.[nextIndex] as HTMLElement)?.focus();
    }
  }

  /**
   * Handle slot change
   */
  private handleSlotChange(): void {
    this.updatePanels();
  }

  /**
   * Render the component
   */
  override render() {
    const classes = {
      tabs: true,
      [`tabs--${this.variant}`]: true,
      [`tabs--${this.size}`]: true,
      'tabs--vertical': this.vertical,
      'tabs--full-width': this.fullWidth,
    };

    return html`
      <div class=${classMap(classes)} part="base">
        <div class="tabs__list" part="list" role="tablist">
          ${repeat(
            this.tabs,
            tab => tab.value,
            (tab, index) => {
              const isActive = tab.value === this.activeTab;
              const tabClasses = {
                tabs__tab: true,
                'tabs__tab--active': isActive,
              };

              return html`
                <button
                  id="tab-${tab.value}"
                  class=${classMap(tabClasses)}
                  part="tab"
                  type="button"
                  role="tab"
                  aria-selected=${isActive ? 'true' : 'false'}
                  aria-controls="panel-${tab.value}"
                  ?disabled=${tab.disabled}
                  @click=${() => this.handleTabClick(tab)}
                  @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, index)}
                >
                  ${
                    tab.icon
                      ? html`
                          <span class="tabs__icon" part="icon">
                            <zeno-icon name=${tab.icon} size="20"></zeno-icon>
                          </span>
                        `
                      : nothing
                  }

                  <span part="label">${tab.label}</span>

                  ${
                    tab.badge !== undefined
                      ? html`
                          <span class="tabs__badge" part="badge">
                            <zeno-badge size="sm">${tab.badge}</zeno-badge>
                          </span>
                        `
                      : nothing
                  }
                </button>
              `;
            }
          )}
        </div>

        <div class="tabs__panels" part="panels">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-tabs': ZenoTabs;
  }
}
