import { html, css, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { ZenoElement } from '../base/zeno-element.js';
import { FormFieldMixin, formFieldStyles } from '../mixins/form-field.js';
import type { FileUploadSize } from '../types.js';

/** A file in the list, with the state of its upload. */
export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * A drop zone and file list. In a form it submits the chosen files under its
 * `name`.
 *
 * @fires {CustomEvent<{ files: File[] }>} input - The list of files changed.
 * @fires {CustomEvent<{ files: File[] }>} change - The list of files changed.
 * @fires {CustomEvent<{ files: UploadedFile[] }>} files-added - Files were added.
 * @fires {CustomEvent<{ file: UploadedFile }>} file-removed - A file was removed.
 * @fires {CustomEvent<{ file: File; error: string }>} file-error - A file was refused.
 * @fires {CustomEvent<{ file: UploadedFile }>} upload-success - An upload finished.
 * @fires {CustomEvent<{ file: UploadedFile; error: unknown }>} upload-error - An upload failed.
 * @csspart base
 * @csspart browse
 * @csspart dropzone
 * @csspart error
 * @csspart file-error
 * @csspart file-icon
 * @csspart file-info
 * @csspart file-item
 * @csspart file-name
 * @csspart file-progress
 * @csspart file-progress-bar
 * @csspart file-remove
 * @csspart file-size
 * @csspart files
 * @csspart hint
 * @csspart icon
 * @csspart label
 * @csspart text
 */
@customElement('zeno-file-upload')
export class ZenoFileUpload extends FormFieldMixin(ZenoElement) {
  static override styles = [
    ZenoElement.baseStyles,
    formFieldStyles,
    css`
      :host {
        --upload-border-width: 2px;
        --upload-border-style: dashed;
        --upload-border-color: var(--zeno-color-border-control);
        --upload-border-radius: var(--zeno-radius-lg);
        --upload-background: var(--zeno-color-background-surface);
        --upload-hover-background: var(--zeno-color-background-hover);
        --upload-active-background: var(--zeno-color-accent-subtle);
        --upload-padding-sm: var(--zeno-spacing-4);
        --upload-padding-md: var(--zeno-spacing-6);
        --upload-padding-lg: var(--zeno-spacing-8);
        --upload-transition: all var(--zeno-motion-duration-sm)
          var(--zeno-motion-easing-ease-out);

        display: block;
        width: 100%;
      }

      /* Upload area */
      .upload {
        position: relative;
        width: 100%;
      }

      .upload__dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--zeno-spacing-3);
        padding: var(--upload-padding);
        border: var(--upload-border-width) var(--upload-border-style)
          var(--upload-border-color);
        border-radius: var(--upload-border-radius);
        background: var(--upload-background);
        text-align: center;
        cursor: pointer;
        transition: var(--upload-transition);
      }

      /* Size variants */
      .upload--sm .upload__dropzone {
        padding: var(--upload-padding-sm);
      }

      .upload--md .upload__dropzone {
        padding: var(--upload-padding-md);
      }

      .upload--lg .upload__dropzone {
        padding: var(--upload-padding-lg);
      }

      /* States */
      .upload__dropzone:hover {
        background: var(--upload-hover-background);
        border-color: var(--zeno-color-accent-solid);
      }

      .upload__dropzone--active {
        background: var(--upload-active-background);
        border-color: var(--zeno-color-accent-solid);
      }

      .upload--disabled .upload__dropzone {
        opacity: 0.5;
        cursor: not-allowed;
        background: var(--zeno-color-background-disabled);
      }

      .upload--invalid .upload__dropzone {
        border-color: var(--zeno-color-danger-solid);
      }

      /* Upload icon */
      .upload__icon {
        color: var(--zeno-color-text-secondary);
      }

      /* Upload text */
      .upload__text {
        color: var(--zeno-color-text-primary);
        font-size: var(--zeno-font-size-md);
        font-weight: var(--zeno-font-weight-medium);
      }

      .upload__hint {
        color: var(--zeno-color-text-tertiary);
        font-size: var(--zeno-font-size-sm);
      }

      /* Browse button */
      .upload__browse {
        color: var(--zeno-color-accent-text);
        text-decoration: underline;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        transition: var(--upload-transition);
      }

      .upload__browse:hover {
        color: var(--zeno-color-accent-solid-hover);
      }

      .upload__browse:focus-visible {
        outline: 2px solid var(--zeno-color-accent-solid);
        outline-offset: 2px;
        border-radius: var(--zeno-radius-sm);
      }

      /* Hidden input */
      .upload__input {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* File list */
      .upload__files {
        margin-top: var(--zeno-spacing-4);
        display: flex;
        flex-direction: column;
        gap: var(--zeno-spacing-2);
      }

      /* File item */
      .file-item {
        display: flex;
        align-items: center;
        gap: var(--zeno-spacing-3);
        padding: var(--zeno-spacing-3);
        background: var(--zeno-color-background-subtle);
        border-radius: var(--zeno-radius-md);
        transition: var(--upload-transition);
      }

      .file-item--error {
        background: var(--zeno-color-danger-subtle);
      }

      .file-item__icon {
        flex-shrink: 0;
        color: var(--zeno-color-text-secondary);
      }

      .file-item--success .file-item__icon {
        color: var(--zeno-color-success-text);
      }

      .file-item--error .file-item__icon {
        color: var(--zeno-color-danger-text);
      }

      /* File info */
      .file-item__info {
        flex: 1;
        min-width: 0;
      }

      .file-item__name {
        font-size: var(--zeno-font-size-sm);
        font-weight: var(--zeno-font-weight-medium);
        color: var(--zeno-color-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-item__size {
        font-size: var(--zeno-font-size-xs);
        color: var(--zeno-color-text-tertiary);
      }

      .file-item__error {
        font-size: var(--zeno-font-size-xs);
        color: var(--zeno-color-danger-text);
      }

      /* Progress bar */
      .file-item__progress {
        width: 100%;
        height: 4px;
        background: var(--zeno-color-background-muted);
        border-radius: 2px;
        overflow: hidden;
        margin-top: var(--zeno-spacing-1);
      }

      .file-item__progress-bar {
        height: 100%;
        background: var(--zeno-color-accent-solid);
        transition: width var(--zeno-motion-duration-md)
          var(--zeno-motion-easing-ease-out);
      }

      /* Remove button */
      .file-item__remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--zeno-color-text-secondary);
        cursor: pointer;
        border-radius: var(--zeno-radius-sm);
        transition: var(--upload-transition);
      }

      .file-item__remove:hover {
        background: var(--zeno-color-background-hover);
        color: var(--zeno-color-danger-text);
      }

      .file-item__remove:focus-visible {
        outline: 2px solid var(--zeno-color-danger-solid);
        outline-offset: 2px;
      }

      /* Compact variant */
      .upload--compact .upload__dropzone {
        flex-direction: row;
        padding: var(--zeno-spacing-3) var(--zeno-spacing-4);
      }

      .upload--compact .upload__icon {
        margin-right: var(--zeno-spacing-2);
      }

      /* High contrast mode */
      @media (prefers-contrast: more) {
        .upload__dropzone {
          border-width: 3px;
        }

        .upload--invalid .upload__dropzone {
          border-color: ButtonText;
          outline: 2px solid ButtonText;
          outline-offset: -4px;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .upload__dropzone,
        .file-item,
        .file-item__progress-bar,
        .file-item__remove {
          transition: none;
        }
      }

      /* Print styles */
      @media print {
        .upload__dropzone {
          display: none;
        }

        .file-item__remove {
          display: none;
        }
      }
    `,
  ];

  @property() accept?: string;
  @property({ type: Boolean }) multiple = false;
  /** The largest file accepted, in bytes. */
  @property({ type: Number, attribute: 'max-size' }) maxSize?: number;
  @property({ type: Number, attribute: 'max-files' }) maxFiles?: number;
  @property({ reflect: true }) size: FileUploadSize = 'md';
  @property({ type: Boolean, reflect: true }) compact = false;
  @property({ type: Boolean, attribute: 'hide-file-list' })
  hideFileList = false;
  /** Send each file to `uploadUrl` as soon as it is added. */
  @property({ type: Boolean, reflect: true, attribute: 'auto-upload' })
  autoUpload = false;
  @property({ attribute: 'upload-url' }) uploadUrl?: string;
  @property({ attribute: 'upload-text' }) uploadText = 'Drop files here or';
  @property({ attribute: 'browse-text' }) browseText = 'browse';
  @property() hint?: string;

  @state() private isDragging = false;
  @state() private entries: UploadedFile[] = [];

  @query('.upload__input') private fileInput!: HTMLInputElement;
  @query('.upload__browse') private browseButton!: HTMLButtonElement;

  private fileIdCounter = 0;

  /** The files chosen so far. */
  get files(): File[] {
    return this.entries.map(entry => entry.file);
  }

  // One form entry per file, as a native file input submits them.
  protected override formSubmitValue(): FormData | null {
    if (!this.name) return null;
    const data = new FormData();
    for (const file of this.files) data.append(this.name, file);
    return data;
  }

  // Files cannot be put back after navigation, so nothing is kept.
  protected override formState(): null {
    return null;
  }

  protected override captureDefaults(): void {}

  protected override resetToDefaults(): void {
    this.entries = [];
    this.value = '';
  }

  protected override restoreState(): void {}

  protected override isEmpty(): boolean {
    return this.entries.length === 0;
  }

  protected override valueMissingMessage(): string {
    return 'Please select a file.';
  }

  protected override validationAnchor(): HTMLElement | undefined {
    return this.browseButton ?? undefined;
  }

  override focus(options?: FocusOptions): void {
    this.browseButton?.focus(options);
  }

  /** Opens the browser's file chooser. */
  selectFiles(): void {
    if (this.isDisabled || this.readonly) return;
    this.fileInput?.click();
  }

  /**
   * Upload all pending files
   */
  async uploadFiles(): Promise<void> {
    if (!this.uploadUrl) return;

    const pendingFiles = this.entries.filter(f => f.status === 'pending');

    for (const file of pendingFiles) {
      await this.uploadFile(file);
    }
  }

  /**
   * Upload single file
   */
  private async uploadFile(uploadedFile: UploadedFile): Promise<void> {
    if (!this.uploadUrl) return;

    uploadedFile.status = 'uploading';
    this.requestUpdate();

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      const xhr = new XMLHttpRequest();

      // Track progress
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) {
          uploadedFile.progress = (e.loaded / e.total) * 100;
          this.requestUpdate();
        }
      });

      // Handle completion
      await new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            uploadedFile.status = 'success';
            uploadedFile.progress = 100;
            resolve(xhr.response);
          } else {
            uploadedFile.status = 'error';
            uploadedFile.error = `Upload failed: ${xhr.statusText}`;
            reject(new Error(xhr.statusText));
          }
          this.requestUpdate();
        });

        xhr.addEventListener('error', () => {
          uploadedFile.status = 'error';
          uploadedFile.error = 'Upload failed';
          this.requestUpdate();
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', this.uploadUrl!);
        xhr.send(formData);
      });

      this.emitEvent('upload-success', { file: uploadedFile });
    } catch (error) {
      this.emitEvent('upload-error', { file: uploadedFile, error });
    }
  }

  /**
   * Handle file selection
   */
  private handleFileSelect(event: Event): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
    // Reset input to allow selecting same file again
    input.value = '';
  }

  /**
   * Add files
   */
  private addFiles(newFiles: File[]): void {
    const validFiles: UploadedFile[] = [];
    // A single-file control keeps the newest file.
    const kept = this.multiple ? this.entries : [];
    if (!this.multiple) newFiles = newFiles.slice(-1);

    for (const file of newFiles) {
      // Validate file
      const error = this.validateFile(file);
      if (error) {
        this.emitEvent('file-error', { file, error });
        continue;
      }

      // Check max files
      if (this.maxFiles && kept.length + validFiles.length >= this.maxFiles) {
        this.emitEvent('file-error', {
          file,
          error: `Maximum ${this.maxFiles} files allowed`,
        });
        break;
      }

      const uploadedFile: UploadedFile = {
        id: `file-${this.fileIdCounter++}`,
        file,
        progress: 0,
        status: 'pending',
      };

      validFiles.push(uploadedFile);
    }

    if (validFiles.length > 0) {
      this.entries = [...kept, ...validFiles];
      this.updateValue();
      this.emitEvent('files-added', { files: validFiles });
      this.emitChange();

      if (this.autoUpload) {
        validFiles.forEach(f => this.uploadFile(f));
      }
    }
  }

  /**
   * Validate file
   */
  private validateFile(file: File): string | null {
    // Check file size
    if (this.maxSize && file.size > this.maxSize) {
      return `File size exceeds ${this.formatFileSize(this.maxSize)}`;
    }

    // Check file type
    if (this.accept) {
      const accepts = this.accept.split(',').map(a => a.trim());
      const isValid = accepts.some(accept => {
        if (accept.startsWith('.')) {
          return file.name.toLowerCase().endsWith(accept.toLowerCase());
        }
        if (accept.includes('/*')) {
          const [type] = accept.split('/');
          return file.type.startsWith(type);
        }
        return file.type === accept;
      });

      if (!isValid) {
        return `File type not allowed. Accepted: ${this.accept}`;
      }
    }

    return null;
  }

  /**
   * Remove file
   */
  private removeFile(fileId: string): void {
    const file = this.entries.find(f => f.id === fileId);
    if (!file) return;

    this.entries = this.entries.filter(f => f.id !== fileId);
    this.updateValue();

    this.emitEvent('file-removed', { file });
    this.emitChange();
    this.browseButton.focus();
  }

  private emitChange(): void {
    const detail = { files: this.files };
    this.emitValueEvent('input', detail);
    this.emitValueEvent('change', detail);
  }

  /**
   * Update form value
   */
  private updateValue(): void {
    // The names, for display. The form receives the files themselves.
    this.value = this.entries.map(f => f.file.name).join(',');
    this.markDirty();
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  /**
   * Handle drag over
   */
  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDisabled || this.readonly) return;

    this.isDragging = true;

    // Set drop effect
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  /**
   * Handle drag leave
   */
  private handleDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Check if leaving the dropzone entirely
    const rect = this.getBoundingClientRect();
    if (
      event.clientX <= rect.left ||
      event.clientX >= rect.right ||
      event.clientY <= rect.top ||
      event.clientY >= rect.bottom
    ) {
      this.isDragging = false;
    }
  }

  /**
   * Handle drop
   */
  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    if (this.isDisabled || this.readonly) return;

    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  /**
   * Get file icon
   */
  private getFileIcon(file: File): string {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'film';
      case 'audio':
        return 'music';
      case 'text':
        return 'file-text';
      default:
        return 'file';
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: UploadedFile['status']): string {
    switch (status) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'uploading':
        return 'upload';
      default:
        return 'file';
    }
  }

  /**
   * Render file item
   */
  private renderFileItem(file: UploadedFile) {
    const fileClasses = {
      'file-item': true,
      'file-item--error': file.status === 'error',
    };

    return html`
      <div class=${classMap(fileClasses)} part="file-item">
        <span class="file-item__icon" part="file-icon">
          <zeno-icon
            name=${
              file.status === 'pending'
                ? this.getFileIcon(file.file)
                : this.getStatusIcon(file.status)
            }
            size="20"
          ></zeno-icon>
        </span>

        <div class="file-item__info" part="file-info">
          <div class="file-item__name" part="file-name">${file.file.name}</div>
          <div class="file-item__size" part="file-size">
            ${this.formatFileSize(file.file.size)}
          </div>
          ${
            file.error
              ? html`<div class="file-item__error" part="file-error">
                  ${file.error}
                </div>`
              : nothing
          }
          ${
            file.status === 'uploading'
              ? html`
                  <div class="file-item__progress" part="file-progress">
                    <div
                      class="file-item__progress-bar"
                      part="file-progress-bar"
                      style="width: ${file.progress}%"
                    ></div>
                  </div>
                `
              : nothing
          }
        </div>

        <button
          class="file-item__remove"
          part="file-remove"
          type="button"
          aria-label="Remove ${file.file.name}"
          @click=${() => this.removeFile(file.id)}
        >
          <zeno-icon name="x" size="16"></zeno-icon>
        </button>
      </div>
    `;
  }

  /**
   * Render the component
   */
  override render() {
    const uploadClasses = {
      upload: true,
      [`upload--${this.size}`]: true,
      'upload--compact': this.compact,
      'upload--disabled': this.isDisabled,
      'upload--invalid': this.invalid,
    };

    const dropzoneClasses = {
      upload__dropzone: true,
      'upload__dropzone--active': this.isDragging,
    };

    const defaultHint = this.multiple
      ? `${this.accept ? `Accepted: ${this.accept}` : 'All file types accepted'}`
      : 'Single file only';
    const name = this.accessibleLabel ?? this.label;
    const action = `${this.uploadText} ${this.browseText}`;
    const describedBy = ['hint', this.describedBy].filter(Boolean).join(' ');

    return html`
      ${this.renderFieldLabel('control')}
      <div
        class=${classMap(uploadClasses)}
        part="base"
        role="group"
        aria-disabled=${this.isDisabled ? 'true' : 'false'}
      >
        <!--
          The browse button is the control. The area around it only adds a
          larger target for the pointer and for dropped files.
        -->
        <div
          class=${classMap(dropzoneClasses)}
          part="dropzone"
          @click=${this.selectFiles}
          @dragover=${this.handleDragOver}
          @dragleave=${this.handleDragLeave}
          @drop=${this.handleDrop}
        >
          <span class="upload__icon" part="icon">
            <zeno-icon name="upload-cloud" size="48"></zeno-icon>
          </span>

          <div class="upload__text" part="text">
            ${this.uploadText}
            <button
              id="control"
              class="upload__browse"
              part="browse"
              type="button"
              ?disabled=${this.isDisabled || this.readonly}
              aria-label=${name ? `${name}: ${action}` : action}
              aria-describedby=${describedBy}
              @click=${(e: Event) => {
                e.stopPropagation();
                this.selectFiles();
              }}
              @blur=${() => this.markTouched()}
            >
              ${this.browseText}
            </button>
          </div>

          <div id="hint" class="upload__hint" part="hint">
            ${this.hint || defaultHint}
            ${
              this.maxSize
                ? html`<br />Max size: ${this.formatFileSize(this.maxSize)}`
                : nothing
            }
          </div>
        </div>

        <input
          class="upload__input"
          type="file"
          hidden
          accept=${ifDefined(this.accept)}
          ?multiple=${this.multiple}
          ?disabled=${this.isDisabled || this.readonly}
          @change=${this.handleFileSelect}
          @input=${(event: Event) => event.stopPropagation()}
        />

        ${
          !this.hideFileList && this.entries.length > 0
            ? html`
                <div class="upload__files" part="files">
                  ${repeat(
                    this.entries,
                    file => file.id,
                    file => this.renderFileItem(file)
                  )}
                </div>
              `
            : nothing
        }
      </div>
      ${this.renderFieldError()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'zeno-file-upload': ZenoFileUpload;
  }
}
