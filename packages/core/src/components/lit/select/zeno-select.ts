import { html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AnchoredPopover } from '../base/anchored-popover.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import '../spinner/zeno-spinner.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { InputVariant, InputSize, SelectOption } from '../types.js';

/**
 * A field that picks one or several options from a list that opens beside it.
 *
 * @fires {CustomEvent<{ value: FormValue; selected: SelectOption[] }>} input - The selection changed.
 * @fires {CustomEvent<{ value: FormValue; selected: SelectOption[] }>} change - The selection changed.
 * @fires {CustomEvent} clear - The clear button was pressed.
 * @fires {CustomEvent} open - The dropdown opened.
 * @fires {CustomEvent} close - The dropdown closed.
 * @csspart base
 * @csspart clear
 * @csspart dropdown
 * @csspart empty
 * @csspart error
 * @csspart icon
 * @csspart label
 * @csspart loading
 * @csspart option
 * @csspart options
 * @csspart search
 * @csspart trigger
 * @csspart value
 */
@customElement('zeno-select')
export class ZenoSelect extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --select-height-sm: 32px;
        --select-height-md: 40px;
        --select-height-lg: 48px;
        --select-padding-x: var(--zeno-spacing-3);
        --select-border-width: 1px;
        --select-border-radius: var(--zeno-radius-md);
        --select-font-size: var(--zeno-font-size-md);
        --select-background: var(--zeno-color-background-surface);
        --select-border-color: var(--zeno-color-border-control);
        --select-text-color: var(--zeno-color-text-primary);
        --select-placeholder-color: var(--zeno-color-text-tertiary);
        --select-focus-ring: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
        --select-dropdown-shadow: var(--zeno-shadow-md);
        --select-dropdown-max-height: 300px;

        display: block;
        position: relative;
      }

      /* Select wrapper */
      .select {
        position: relative;
        width: 100%;
      }

      /* Select trigger button */
      .select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 var(--select-padding-x);
        border: var(--select-border-width) solid var(--select-border-color);
        border-radius: var(--select-border-radius);
        background: var(--select-background);
        color: var(--select-text-color);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--select-font-size);
        line-height: 1.5;
        cursor: pointer;
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
        text-align: left;
      }

      /* Size variants */
      .select__trigger--sm {
        height: var(--select-height-sm);
        font-size: var(--zeno-font-size-sm);
      }

      .select__trigger--md {
        height: var(--select-height-md);
      }

      .select__trigger--lg {
        height: var(--select-height-lg);
        font-size: var(--zeno-font-size-lg);
      }

      /* Variant styles */
      .select__trigger--outlined {
        background: transparent;
      }

      .select__trigger--filled {
        background: var(--zeno-color-background-subtle);
        border-color: transparent;
      }

      .select__trigger--ghost {
        background: transparent;
        border-color: transparent;
        padding-left: 0;
        padding-right: 0;
      }

      /* Placeholder */
      .select__trigger--placeholder {
        color: var(--select-placeholder-color);
      }

      /* Icons */
      .select__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: var(--zeno-spacing-2);
        color: var(--zeno-color-text-secondary);
        transition: transform var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .select--open .select__icon {
        transform: rotate(180deg);
      }

      /* Focus states */
      .select__trigger:focus {
        outline: none;
        border-color: var(--zeno-color-accent-solid);
        box-shadow: var(--select-focus-ring);
      }

      .select__trigger--filled:focus {
        border-color: var(--zeno-color-accent-solid);
        background: var(--zeno-color-background-subtle);
      }

      .select__trigger--ghost:focus {
        border-color: var(--zeno-color-border-control);
        padding-left: var(--select-padding-x);
        padding-right: var(--select-padding-x);
      }

      /* Hover states */
      .select__trigger:hover:not(:focus):not(:disabled) {
        border-color: var(--zeno-color-border-control-hover);
      }

      .select__trigger--filled:hover:not(:focus):not(:disabled) {
        background: var(--zeno-color-background-muted);
      }

      /* Disabled state */
      .select__trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--zeno-color-background-disabled);
      }

      /* Invalid state */
      .select__trigger--invalid {
        border-color: var(--zeno-color-danger-solid);
      }

      .select__trigger--invalid:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-danger-subtle-hover);
      }

      /* Success state */
      .select__trigger--success {
        border-color: var(--zeno-color-success-solid);
      }

      .select__trigger--success:focus {
        box-shadow: 0 0 0 3px var(--zeno-color-success-subtle-hover);
      }

      /* Loading state */
      .select--loading .select__trigger {
        pointer-events: none;
      }

      .select__loading {
        position: absolute;
        right: var(--select-padding-x);
        top: 50%;
        transform: translateY(-50%);
      }

      /* Dropdown */
      /*
       * The dropdown is a popover, so it sits in the top layer and no
       * ancestor can clip it. Its place and width are set from the trigger.
       */
      .select__dropdown {
        position: fixed;
        inset: auto;
        margin: 0;
        padding: 0;
        z-index: var(--zeno-z-index-dropdown);
        background: var(--zeno-color-background-surface);
        color: var(--zeno-color-text-primary);
        border: 1px solid var(--zeno-color-border-subtle);
        border-radius: var(--select-border-radius);
        box-shadow: var(--select-dropdown-shadow);
        max-height: min(
          var(--select-dropdown-max-height),
          var(--select-available-height, 100vh)
        );
        overflow: auto;
        font-family: var(--zeno-font-family-sans);
        font-size: var(--select-font-size);
      }

      .select__dropdown:not([data-open]) {
        display: none;
      }

      .select__search {
        display: block;
        width: 100%;
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        border: 0;
        border-bottom: 1px solid var(--zeno-color-border-subtle);
        background: transparent;
        color: inherit;
        font: inherit;
      }

      .select__clear {
        position: absolute;
        top: 50%;
        right: var(--select-padding-x);
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border: 0;
        border-radius: var(--zeno-radius-sm);
        background: none;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
      }

      .select__clear:hover {
        color: var(--zeno-color-text-primary);
      }

      .select__trigger--with-clear {
        padding-right: calc(var(--select-padding-x) + 28px);
      }

      .select__options {
        list-style: none;
        margin: 0;
        padding: var(--zeno-spacing-1);
      }

      /* Option */
      .select__option {
        display: flex;
        align-items: center;
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);
      }

      .select__option:hover,
      .select__option--active {
        background: var(--zeno-color-background-hover);
      }

      .select__option--selected {
        background: var(--zeno-color-accent-subtle);
        color: var(--zeno-color-accent-text);
        font-weight: var(--zeno-font-weight-medium);
      }

      .select__option--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .select__option--disabled:hover {
        background: transparent;
      }

      /* Option group */
      .select__group {
        padding: var(--zeno-spacing-2) var(--zeno-spacing-3)
          var(--zeno-spacing-1);
        font-size: var(--zeno-font-size-sm);
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Empty state */
      .select__empty {
        padding: var(--zeno-spacing-4);
        text-align: center;
        color: var(--zeno-color-text-tertiary);
        font-size: var(--zeno-font-size-sm);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .select__trigger {
          border-width: 2px;
        }

        .select__trigger:focus {
          outline: 2px solid ButtonText;
          outline-offset: 2px;
          box-shadow: none;
        }

        .select__dropdown {
          border-width: 2px;
        }

        .select__option--selected {
          outline: 2px solid ButtonText;
          outline-offset: -2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .select__trigger,
        .select__icon,
        .select__dropdown,
        .select__option {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .select__trigger {
          border: 1px solid #000;
        }

        .select__dropdown {
          display: none;
        }
      }
    `,
  ];

  @property({ type: Array }) options: SelectOption[] = [];
  @property({ reflect: true }) variant: InputVariant = 'outlined';
  @property({ reflect: true }) size: InputSize = 'md';
  @property() placeholder = 'Select an option';
  /** Several options can be chosen. `value` is then a comma-separated list. */
  @property({ type: Boolean, reflect: true }) multiple = false;
  /** Shows a field in the dropdown that filters the options. */
  @property({ type: Boolean, reflect: true }) searchable = false;
  @property({ type: Boolean, reflect: true }) clearable = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true }) success = false;
  @property({ attribute: 'empty-text' }) emptyText = 'No options available';

  @state() private isOpen = false;
  @state() private searchValue = '';
  @state() private activeIndex = -1;

  @query('.select__trigger') private trigger!: HTMLButtonElement;
  @query('.select__dropdown') private dropdown!: HTMLElement;
  @query('.select__search') private search?: HTMLInputElement;

  private overlay = new AnchoredPopover(this, {
    anchor: () => this.trigger,
    popover: () => this.dropdown,
    onOutsidePress: () => this.close(),
    matchWidth: true,
    heightProperty: '--select-available-height',
  });

  constructor() {
    super();
    // Focus that moves inside the shadow tree never reaches this listener, so
    // it runs only when focus leaves the element.
    this.addEventListener('focusout', () => {
      this.close();
      this.markTouched();
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.isOpen = false;
    this.overlay.hide();
  }

  protected override updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('isOpen')) {
      if (this.isOpen) {
        this.overlay.show();
        this.search?.focus();
      } else {
        this.overlay.hide();
      }
    }
    if (this.isOpen && changedProperties.has('activeIndex')) {
      this.shadowRoot
        ?.querySelector('.select__option--active')
        ?.scrollIntoView({ block: 'nearest' });
    }
  }

  private get selectedValues(): string[] {
    const raw = String(this.value ?? '');
    if (raw === '') return [];
    return this.multiple ? raw.split(',').filter(Boolean) : [raw];
  }

  private get selectedOptions(): SelectOption[] {
    const values = this.selectedValues;
    return this.options.filter(option => values.includes(option.value));
  }

  // A multiple select submits one entry per chosen option, as the native
  // element does.
  protected override formSubmitValue(): string | FormData | null {
    if (!this.multiple) return String(this.value ?? '');
    const data = new FormData();
    if (this.name) {
      for (const value of this.selectedValues) data.append(this.name, value);
    }
    return data;
  }

  protected override formState(): string {
    return String(this.value ?? '');
  }

  protected override valueMissingMessage(): string {
    return 'Please select an item in the list.';
  }

  protected override validationAnchor(): HTMLElement | undefined {
    return this.trigger ?? undefined;
  }

  override focus(options?: FocusOptions): void {
    this.trigger?.focus(options);
  }

  override blur(): void {
    this.trigger?.blur();
    this.close();
  }

  /** Opens the dropdown. */
  open(): void {
    if (this.isOpen || this.isDisabled || this.loading) return;
    const options = this.getFilteredOptions();
    const selected = this.selectedValues;
    const first = options.findIndex(option => selected.includes(option.value));
    this.activeIndex =
      first >= 0 ? first : options.findIndex(option => !option.disabled);
    this.isOpen = true;
    this.emitEvent('open');
  }

  /** Closes the dropdown. */
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.searchValue = '';
    this.activeIndex = -1;
    this.emitEvent('close');
  }

  /** Opens the dropdown when it is closed and closes it when it is open. */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  // A press on an option must not take focus away from the trigger.
  private keepFocus(event: MouseEvent): void {
    if (event.target !== this.search) event.preventDefault();
  }

  private selectOption(option: SelectOption): void {
    if (option.disabled) return;

    if (this.multiple) {
      const values = this.selectedValues;
      const next = values.includes(option.value)
        ? values.filter(value => value !== option.value)
        : [...values, option.value];
      this.value = this.options
        .filter(candidate => next.includes(candidate.value))
        .map(candidate => candidate.value)
        .join(',');
    } else {
      this.value = option.value;
      this.close();
      this.trigger.focus();
    }

    this.markDirty();
    const detail = { value: this.value, selected: this.selectedOptions };
    this.emitValueEvent('input', detail);
    this.emitValueEvent('change', detail);
  }

  private handleClear(): void {
    this.value = '';
    this.markDirty();
    this.emitEvent('clear');
    this.emitValueEvent('input', { value: '', selected: [] });
    this.emitValueEvent('change', { value: '', selected: [] });
    this.trigger.focus();
  }

  private handleSearch(event: Event): void {
    event.stopPropagation();
    this.searchValue = (event.target as HTMLInputElement).value;
    this.activeIndex = this.getFilteredOptions().findIndex(
      option => !option.disabled
    );
  }

  private moveActive(step: number): void {
    const options = this.getFilteredOptions();
    let index = this.activeIndex;
    for (let tries = 0; tries < options.length; tries++) {
      index = (index + step + options.length) % options.length;
      if (!options[index].disabled) {
        this.activeIndex = index;
        return;
      }
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const origin = event.composedPath()[0] as HTMLElement;
    if (origin.classList.contains('select__clear')) return;
    const inSearch = origin === this.search;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
        } else {
          this.open();
        }
        break;
      case 'Home':
      case 'End': {
        if (!this.isOpen || inSearch) break;
        event.preventDefault();
        this.activeIndex = event.key === 'Home' ? -1 : 0;
        this.moveActive(event.key === 'Home' ? 1 : -1);
        break;
      }
      case 'Enter':
      case ' ': {
        if (event.key === ' ' && inSearch) break;
        event.preventDefault();
        if (!this.isOpen) {
          this.open();
          break;
        }
        const option = this.getFilteredOptions()[this.activeIndex];
        if (option) {
          this.selectOption(option);
        } else {
          this.close();
        }
        break;
      }
      case 'Escape':
        if (!this.isOpen) break;
        // Cancelled so that a dialog around the select stays open.
        event.preventDefault();
        this.close();
        this.trigger.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  private getDisplayText(): string {
    const selected = this.selectedOptions;
    return selected.length === 0
      ? this.placeholder
      : selected.map(option => option.label).join(', ');
  }

  private getFilteredOptions(): SelectOption[] {
    if (!this.searchable || !this.searchValue) {
      return this.options;
    }

    const search = this.searchValue.toLowerCase();
    return this.options.filter(
      option =>
        option.label.toLowerCase().includes(search) ||
        option.value.toLowerCase().includes(search)
    );
  }

  override render() {
    const options = this.getFilteredOptions();
    const selected = this.selectedValues;
    const hasValue = this.selectedOptions.length > 0;
    const showClear =
      this.clearable && hasValue && !this.isDisabled && !this.loading;
    const activeId =
      this.isOpen && options[this.activeIndex]
        ? `option-${this.activeIndex}`
        : undefined;
    const name =
      this.accessibleLabel ?? (this.label ? undefined : this.placeholder);

    const triggerClasses = {
      select__trigger: true,
      [`select__trigger--${this.variant}`]: true,
      [`select__trigger--${this.size}`]: true,
      'select__trigger--invalid': this.invalid,
      'select__trigger--success': this.success && !this.invalid,
      'select__trigger--placeholder': !hasValue,
      'select__trigger--with-clear': showClear,
    };

    const selectClasses = {
      select: true,
      'select--open': this.isOpen,
      'select--loading': this.loading,
    };

    return html`
      ${this.renderFieldLabel('control')}
      <div
        class=${classMap(selectClasses)}
        part="base"
        @keydown=${this.handleKeyDown}
      >
        <button
          id="control"
          class=${classMap(triggerClasses)}
          part="trigger"
          type="button"
          role="combobox"
          ?disabled=${this.isDisabled || this.loading}
          aria-haspopup="listbox"
          aria-controls="listbox"
          aria-expanded=${this.isOpen ? 'true' : 'false'}
          aria-activedescendant=${ifDefined(
            this.searchable ? undefined : activeId
          )}
          aria-label=${ifDefined(name)}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-required=${this.required ? 'true' : 'false'}
          aria-invalid=${this.invalid ? 'true' : 'false'}
          @click=${this.toggle}
        >
          <span class="select__value" part="value"
            >${this.getDisplayText()}</span
          >
          ${
            this.loading
              ? html`
                  <span class="select__loading" part="loading">
                    <zeno-spinner size="sm"></zeno-spinner>
                  </span>
                `
              : showClear
                ? nothing
                : html`
                    <span class="select__icon" part="icon">
                      <zeno-icon name="chevron-down" size="16"></zeno-icon>
                    </span>
                  `
          }
        </button>
        ${
          showClear
            ? html`
                <button
                  type="button"
                  class="select__clear"
                  part="clear"
                  aria-label="Clear selection"
                  @click=${this.handleClear}
                >
                  <zeno-icon name="x" size="16"></zeno-icon>
                </button>
              `
            : nothing
        }

        <div
          class="select__dropdown"
          part="dropdown"
          popover="manual"
          ?data-open=${this.isOpen}
          @mousedown=${this.keepFocus}
        >
          ${
            this.searchable
              ? html`
                  <input
                    class="select__search"
                    part="search"
                    type="text"
                    role="combobox"
                    autocomplete="off"
                    aria-label="Filter options"
                    aria-autocomplete="list"
                    aria-expanded="true"
                    aria-controls="listbox"
                    aria-activedescendant=${ifDefined(activeId)}
                    .value=${this.searchValue}
                    @input=${this.handleSearch}
                    @change=${(event: Event) => event.stopPropagation()}
                  />
                `
              : nothing
          }
          ${
            options.length > 0
              ? html`
                  <div
                    id="listbox"
                    class="select__options"
                    part="options"
                    role="listbox"
                    aria-label=${name ?? this.label ?? 'Options'}
                    aria-multiselectable=${ifDefined(
                      this.multiple ? 'true' : undefined
                    )}
                  >
                    ${options.map((option, index) => {
                      const isSelected = selected.includes(option.value);
                      return html`
                        <div
                          id="option-${index}"
                          class=${classMap({
                            select__option: true,
                            'select__option--selected': isSelected,
                            'select__option--active':
                              index === this.activeIndex,
                            'select__option--disabled':
                              option.disabled ?? false,
                          })}
                          part="option"
                          role="option"
                          aria-selected=${isSelected ? 'true' : 'false'}
                          aria-disabled=${ifDefined(
                            option.disabled ? 'true' : undefined
                          )}
                          @click=${() => this.selectOption(option)}
                        >
                          ${option.label}
                        </div>
                      `;
                    })}
                  </div>
                `
              : html`
                  <div class="select__empty" part="empty">
                    ${this.emptyText}
                  </div>
                `
          }
        </div>
      </div>
      ${this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-select': ZenoSelect;
  }
}
