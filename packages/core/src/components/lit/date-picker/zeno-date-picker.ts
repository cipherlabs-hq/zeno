import { html, css, nothing, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { AnchoredPopover } from '../base/anchored-popover.js';
import { ZenoElement } from '../base/zeno-element.js';
// Elements this one renders, so that importing it alone is enough.
import '../icon/zeno-icon.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { DatePickerSize } from '../types.js';

/**
 * A date field with a calendar that opens beside it. Its value is an ISO date,
 * `YYYY-MM-DD`.
 *
 * @fires {CustomEvent<{ value: FormValue; date: Date }>} input - A date was picked.
 * @fires {CustomEvent<{ value: FormValue; date: Date }>} change - A date was picked.
 * @fires {CustomEvent} open - The calendar opened.
 * @fires {CustomEvent} close - The calendar closed.
 * @csspart base
 * @csspart calendar
 * @csspart calendar-header
 * @csspart day
 * @csspart days
 * @csspart error
 * @csspart icon
 * @csspart input
 * @csspart label
 * @csspart month-year
 * @csspart today-button
 * @csspart value
 * @csspart weekday
 * @csspart weekdays
 */
@customElement('zeno-date-picker')
export class ZenoDatePicker extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --picker-input-height-sm: 32px;
        --picker-input-height-md: 40px;
        --picker-input-height-lg: 48px;
        --picker-input-padding: var(--zeno-spacing-3);
        --picker-border-radius: var(--zeno-radius-md);
        --picker-background: var(--zeno-color-background-surface);
        --picker-border-color: var(--zeno-color-border-control);
        --picker-shadow: var(--zeno-shadow-md);
        --picker-calendar-padding: var(--zeno-spacing-3);
        --picker-day-size: 36px;
        --picker-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: inline-block;
        position: relative;
      }

      /* Input wrapper */
      .date-picker {
        position: relative;
        width: 100%;
      }

      /* Input field */
      .date-picker__input {
        display: flex;
        align-items: center;
        width: 100%;
        height: var(--picker-input-height);
        padding: 0 var(--picker-input-padding);
        border: 1px solid var(--picker-border-color);
        border-radius: var(--picker-border-radius);
        background: var(--picker-background);
        color: var(--zeno-color-text-primary);
        font-family: var(--zeno-font-family-sans);
        font-size: var(--zeno-font-size-md);
        cursor: pointer;
        transition: var(--picker-transition);
        gap: var(--zeno-spacing-2);
        text-align: left;
      }

      /* Size variants */
      .date-picker--sm .date-picker__input {
        height: var(--picker-input-height-sm);
        font-size: var(--zeno-font-size-sm);
      }

      .date-picker--md .date-picker__input {
        height: var(--picker-input-height-md);
      }

      .date-picker--lg .date-picker__input {
        height: var(--picker-input-height-lg);
        font-size: var(--zeno-font-size-lg);
      }

      /* Input states */
      .date-picker__input:hover {
        border-color: var(--zeno-color-border-control-hover);
      }

      .date-picker__input:focus {
        outline: none;
        border-color: var(--zeno-color-accent-solid);
        box-shadow: 0 0 0 3px var(--zeno-color-accent-subtle-hover);
      }

      .date-picker__input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--zeno-color-background-disabled);
      }

      .date-picker--invalid .date-picker__input {
        border-color: var(--zeno-color-danger-solid);
      }

      /* Input value */
      .date-picker__value {
        flex: 1;
        color: var(--zeno-color-text-primary);
      }

      .date-picker__value--placeholder {
        color: var(--zeno-color-text-tertiary);
      }

      /* Input icon */
      .date-picker__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--zeno-color-text-secondary);
      }

      /* The calendar is a popover placed against the field. */
      .date-picker__calendar {
        position: fixed;
        inset: auto;
        margin: 0;
        z-index: var(--zeno-z-index-dropdown);
        background: var(--picker-background);
        color: var(--zeno-color-text-primary);
        border: 1px solid var(--zeno-color-border-subtle);
        border-radius: var(--picker-border-radius);
        box-shadow: var(--picker-shadow);
        padding: var(--picker-calendar-padding);
        font-family: var(--zeno-font-family-sans);
      }

      .date-picker__calendar:not([data-open]) {
        display: none;
      }

      /* Calendar header */
      .calendar__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--zeno-spacing-3);
      }

      .calendar__nav {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-1);
      }

      .calendar__nav-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: var(--picker-transition);
      }

      .calendar__nav-button:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-text-primary);
      }

      .calendar__nav-button:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      .calendar__month-year {
        font-weight: var(--zeno-font-weight-semibold);
        color: var(--zeno-color-text-primary);
      }

      /* Calendar grid */
      .calendar__weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--zeno-spacing-1);
        margin-bottom: var(--zeno-spacing-2);
      }

      .calendar__weekday {
        display: flex;
        align-items: center;
        justify-content: center;
        height: var(--picker-day-size);
        font-size: var(--zeno-font-size-xs);
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-tertiary);
        text-transform: uppercase;
      }

      .calendar__days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: var(--zeno-spacing-1);
      }

      .calendar__day {
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--picker-day-size);
        height: var(--picker-day-size);
        padding: 0;
        border: none;
        background: transparent;
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-sm);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: var(--picker-transition);
      }

      .calendar__day:hover:not(:disabled) {
        background: var(--zeno-color-background-hover);
      }

      .calendar__day:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      .calendar__day--today {
        font-weight: var(--zeno-font-weight-semibold);
        color: var(--zeno-color-accent-text);
      }

      .calendar__day--selected {
        background: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-on-solid);
      }

      .calendar__day--selected:hover {
        background: var(--zeno-color-accent-solid-hover);
      }

      .calendar__day--outside {
        color: var(--zeno-color-text-tertiary);
      }

      .calendar__day:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Today button */
      .calendar__today {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: var(--zeno-spacing-3);
        padding: var(--zeno-spacing-2);
        border: 1px solid var(--zeno-color-border-control);
        background: transparent;
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-sm);
        font-weight: var(--zeno-font-weight-medium);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: var(--picker-transition);
      }

      .calendar__today:hover {
        background: var(--zeno-color-background-hover);
        border-color: var(--zeno-color-accent-solid);
        color: var(--zeno-color-accent-text);
      }

      .calendar__today:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .date-picker__input {
          border-width: 2px;
        }

        .date-picker__calendar {
          border-width: 2px;
        }

        .calendar__day--selected {
          outline: 2px solid ButtonText;
          outline-offset: -2px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .date-picker__input,
        .date-picker__calendar,
        .calendar__nav-button,
        .calendar__day,
        .calendar__today {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .date-picker__calendar {
          display: none;
        }
      }
    `,
  ];

  @property() placeholder = 'Select date';
  /** How the chosen date is shown: any order of `MM`, `DD` and `YYYY`. */
  @property() format = 'MM/DD/YYYY';
  /** The earliest date that can be chosen, as `YYYY-MM-DD`. */
  @property() min?: string;
  /** The latest date that can be chosen, as `YYYY-MM-DD`. */
  @property() max?: string;
  @property({ reflect: true }) size: DatePickerSize = 'md';
  @property({ type: Boolean, attribute: 'hide-today-button' })
  hideTodayButton = false;
  /** Dates that cannot be chosen, each as `YYYY-MM-DD`. */
  @property({ type: Array, attribute: 'disabled-dates' })
  disabledDates: string[] = [];
  /** 0 is Sunday, 1 is Monday. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek = 0;

  @state() private isOpen = false;
  /** The first day of the month on show. */
  @state() private viewDate = startOfMonth(new Date());
  /** The day that holds keyboard focus in the grid. */
  @state() private focusedDate = toISO(new Date());

  @query('.date-picker__input') private trigger!: HTMLButtonElement;
  @query('.date-picker__calendar') private calendar!: HTMLElement;

  private moveFocusToGrid = false;

  private overlay = new AnchoredPopover(this, {
    anchor: () => this.trigger,
    popover: () => this.calendar,
    onOutsidePress: () => this.close(),
  });

  constructor() {
    super();
    // Runs only when focus leaves the element, calendar included.
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
      } else {
        this.overlay.hide();
      }
    }
    if (this.isOpen && this.moveFocusToGrid) {
      this.moveFocusToGrid = false;
      this.shadowRoot
        ?.querySelector<HTMLElement>('.calendar__day[tabindex="0"]')
        ?.focus();
    }
  }

  /** The chosen date, or undefined when the value is empty or not a date. */
  get valueAsDate(): Date | undefined {
    return parseISO(String(this.value ?? ''));
  }

  protected override valueMissingMessage(): string {
    return 'Please choose a date.';
  }

  protected override ownValidity(): [ValidityStateFlags, string] | undefined {
    const value = String(this.value ?? '');
    if (value === '') return undefined;
    const date = parseISO(value);
    if (!date) {
      return [{ badInput: true }, 'Please enter a date as YYYY-MM-DD.'];
    }
    const min = parseISO(this.min);
    if (min && date < min) {
      return [
        { rangeUnderflow: true },
        `Please choose ${this.formatDate(min)} or a later date.`,
      ];
    }
    const max = parseISO(this.max);
    if (max && date > max) {
      return [
        { rangeOverflow: true },
        `Please choose ${this.formatDate(max)} or an earlier date.`,
      ];
    }
    return undefined;
  }

  protected override validationAnchor(): HTMLElement | undefined {
    return this.trigger ?? undefined;
  }

  override focus(options?: FocusOptions): void {
    this.trigger?.focus(options);
  }

  /** Opens the calendar and moves focus to the chosen day, or to today. */
  open(): void {
    if (this.isOpen || this.isDisabled || this.readonly) return;
    const start = this.valueAsDate ?? new Date();
    this.focusedDate = toISO(start);
    this.viewDate = startOfMonth(start);
    this.moveFocusToGrid = true;
    this.isOpen = true;
    this.emitEvent('open');
  }

  /** Closes the calendar. */
  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.emitEvent('close');
  }

  /** Opens the calendar when it is closed and closes it when it is open. */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private navigateMonth(direction: -1 | 1): void {
    const next = new Date(this.viewDate);
    next.setMonth(next.getMonth() + direction);
    this.viewDate = next;
    // Keep one day of the month on show reachable with Tab.
    const focused = parseISO(this.focusedDate) ?? next;
    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0
    ).getDate();
    this.focusedDate = toISO(
      new Date(
        next.getFullYear(),
        next.getMonth(),
        Math.min(focused.getDate(), lastDay)
      )
    );
  }

  private moveFocusedDay(days: number, months = 0): void {
    const date = parseISO(this.focusedDate) ?? new Date();
    if (months) {
      const day = date.getDate();
      date.setDate(1);
      date.setMonth(date.getMonth() + months);
      const lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      ).getDate();
      date.setDate(Math.min(day, lastDay));
    }
    date.setDate(date.getDate() + days);
    this.focusedDate = toISO(date);
    this.viewDate = startOfMonth(date);
    this.moveFocusToGrid = true;
  }

  private handleGridKeyDown(event: KeyboardEvent): void {
    const weekday =
      ((parseISO(this.focusedDate) ?? new Date()).getDay() -
        this.firstDayOfWeek +
        7) %
      7;
    const moves: Record<string, () => void> = {
      ArrowLeft: () => this.moveFocusedDay(-1),
      ArrowRight: () => this.moveFocusedDay(1),
      ArrowUp: () => this.moveFocusedDay(-7),
      ArrowDown: () => this.moveFocusedDay(7),
      Home: () => this.moveFocusedDay(-weekday),
      End: () => this.moveFocusedDay(6 - weekday),
      PageUp: () => this.moveFocusedDay(0, event.shiftKey ? -12 : -1),
      PageDown: () => this.moveFocusedDay(0, event.shiftKey ? 12 : 1),
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      move();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      // Cancelled so that a dialog around the picker stays open.
      event.preventDefault();
      this.close();
      this.trigger.focus();
    } else if (
      event.key === 'ArrowDown' &&
      !this.isOpen &&
      event.composedPath()[0] === this.trigger
    ) {
      event.preventDefault();
      this.open();
    }
  }

  private selectDate(date: Date): void {
    if (this.isDateDisabled(date)) return;

    this.value = toISO(date);
    this.markDirty();
    this.close();
    this.trigger.focus();

    const detail = { value: this.value, date };
    this.emitValueEvent('input', detail);
    this.emitValueEvent('change', detail);
  }

  private selectToday(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.selectDate(today);
  }

  private formatDate(date: Date): string {
    return this.format
      .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
      .replace('DD', String(date.getDate()).padStart(2, '0'))
      .replace('YYYY', String(date.getFullYear()));
  }

  private isDateDisabled(date: Date): boolean {
    const iso = toISO(date);
    // ISO dates sort as text.
    if (this.min && iso < this.min) return true;
    if (this.max && iso > this.max) return true;
    return this.disabledDates.includes(iso);
  }

  private getCalendarDays(): Date[] {
    const first = this.viewDate;
    const lead = (first.getDay() - this.firstDayOfWeek + 7) % 7;
    // Six weeks, so the calendar keeps its height from month to month.
    return Array.from(
      { length: 42 },
      (_, index) =>
        new Date(first.getFullYear(), first.getMonth(), 1 - lead + index)
    );
  }

  private get locale(): string | undefined {
    return (
      this.closest<HTMLElement>('[lang]')?.lang ||
      document.documentElement.lang ||
      undefined
    );
  }

  override render() {
    const selected = this.valueAsDate;
    const selectedISO = selected ? toISO(selected) : '';
    const todayISO = toISO(new Date());
    const formattedValue = selected ? this.formatDate(selected) : '';
    const name = this.accessibleLabel ?? this.label ?? this.placeholder;
    // The name carries the text on show, so speech input can target it.
    const shown = formattedValue || this.placeholder;
    const locale = this.locale;
    const monthTitle = new Intl.DateTimeFormat(locale, {
      month: 'long',
      year: 'numeric',
    }).format(this.viewDate);
    const weekdayName = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const days = this.getCalendarDays();
    // The focused day when it is on show, otherwise the first of the month.
    const tabStop = days.some(day => toISO(day) === this.focusedDate)
      ? this.focusedDate
      : toISO(this.viewDate);

    const pickerClasses = {
      'date-picker': true,
      [`date-picker--${this.size}`]: true,
      'date-picker--invalid': this.invalid,
    };

    return html`
      ${this.renderFieldLabel('control')}
      <div
        class=${classMap(pickerClasses)}
        part="base"
        @keydown=${this.handleKeyDown}
      >
        <button
          id="control"
          class="date-picker__input"
          part="input"
          type="button"
          ?disabled=${this.isDisabled}
          aria-label=${shown === name ? name : `${name}, ${shown}`}
          aria-haspopup="dialog"
          aria-expanded=${this.isOpen ? 'true' : 'false'}
          aria-controls="calendar"
          aria-describedby=${ifDefined(this.describedBy)}
          @click=${this.toggle}
        >
          <span
            class=${classMap({
              'date-picker__value': true,
              'date-picker__value--placeholder': !formattedValue,
            })}
            part="value"
            >${formattedValue || this.placeholder}</span
          >
          <span class="date-picker__icon" part="icon">
            <zeno-icon name="calendar" size="20"></zeno-icon>
          </span>
        </button>

        <div
          id="calendar"
          class="date-picker__calendar"
          part="calendar"
          popover="manual"
          role="dialog"
          aria-label="Choose a date"
          ?data-open=${this.isOpen}
        >
          <div class="calendar__header" part="calendar-header">
            <button
              class="calendar__nav-button"
              type="button"
              aria-label="Previous month"
              @click=${() => this.navigateMonth(-1)}
            >
              <zeno-icon name="chevron-left" size="16"></zeno-icon>
            </button>
            <div
              class="calendar__month-year"
              part="month-year"
              aria-live="polite"
            >
              ${monthTitle}
            </div>
            <button
              class="calendar__nav-button"
              type="button"
              aria-label="Next month"
              @click=${() => this.navigateMonth(1)}
            >
              <zeno-icon name="chevron-right" size="16"></zeno-icon>
            </button>
          </div>

          <div class="calendar__weekdays" part="weekdays" aria-hidden="true">
            ${days
              .slice(0, 7)
              .map(
                day => html`
                  <div class="calendar__weekday" part="weekday">
                    ${weekdayName.format(day)}
                  </div>
                `
              )}
          </div>

          <div
            class="calendar__days"
            part="days"
            @keydown=${this.handleGridKeyDown}
          >
            ${days.map(day => {
              const iso = toISO(day);
              const isSelected = iso === selectedISO;
              const dayClasses = {
                calendar__day: true,
                'calendar__day--outside':
                  day.getMonth() !== this.viewDate.getMonth(),
                'calendar__day--today': iso === todayISO,
                'calendar__day--selected': isSelected,
              };

              return html`
                <button
                  class=${classMap(dayClasses)}
                  part="day"
                  type="button"
                  data-date=${iso}
                  tabindex=${iso === tabStop ? 0 : -1}
                  ?disabled=${this.isDateDisabled(day)}
                  aria-label=${fullDate.format(day)}
                  aria-current=${ifDefined(iso === todayISO ? 'date' : undefined)}
                  aria-pressed=${isSelected ? 'true' : 'false'}
                  @click=${() => this.selectDate(day)}
                >
                  ${day.getDate()}
                </button>
              `;
            })}
          </div>

          ${
            this.hideTodayButton
              ? nothing
              : html`
                  <button
                    class="calendar__today"
                    part="today-button"
                    type="button"
                    ?disabled=${this.isDateDisabled(new Date())}
                    @click=${this.selectToday}
                  >
                    Today
                  </button>
                `
          }
        </div>
      </div>
      ${this.renderFieldError()}
    `;
  }
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** A local date as `YYYY-MM-DD`. */
function toISO(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${month}-${day}`;
}

/** Reads `YYYY-MM-DD` as a local date. Anything else gives undefined. */
function parseISO(value: string | undefined): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-date-picker': ZenoDatePicker;
  }
}
