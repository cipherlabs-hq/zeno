import { ref, computed, type Ref } from 'vue';

/**
 * Valid input value types for validation
 */
export type ValidatableValue =
  string | number | boolean | File | FileList | Date | null | undefined;

export type ValidationRule = (_value: ValidatableValue) => string | null;

export interface UseValidateOptions {
  /** Validate immediately on setup */
  immediate?: boolean;
  /** Debounce validation (ms) */
  debounce?: number;
}

export interface UseValidateReturn {
  /** Current errors object */
  errors: Ref<Record<string, string | null>>;
  /** Whether form is valid */
  isValid: Ref<boolean>;
  /** Validate a specific field */
  validateField: (_field: string, _value: ValidatableValue) => string | null;
  /** Validate all fields */
  validateAll: (
    _values: Record<string, ValidatableValue>
  ) => Record<string, string | null>;
  /** Clear errors for a field */
  clearError: (_field: string) => void;
  /** Clear all errors */
  clearAllErrors: () => void;
  /** Set error for a field */
  setError: (_field: string, _error: string) => void;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required:
    (message = 'This field is required'): ValidationRule =>
    value => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return null;
    },

  email:
    (message = 'Please enter a valid email address'): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : message;
    },

  minLength:
    (min: number, message?: string): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      const actualMessage = message || `Must be at least ${min} characters`;
      return value.length >= min ? null : actualMessage;
    },

  maxLength:
    (max: number, message?: string): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      const actualMessage = message || `Must be no more than ${max} characters`;
      return value.length <= max ? null : actualMessage;
    },

  pattern:
    (regex: RegExp, message = 'Invalid format'): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      return regex.test(value) ? null : message;
    },

  min:
    (minimum: number, message?: string): ValidationRule =>
    value => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      const actualMessage = message || `Must be at least ${minimum}`;
      return num >= minimum ? null : actualMessage;
    },

  max:
    (maximum: number, message?: string): ValidationRule =>
    value => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      const actualMessage = message || `Must be no more than ${maximum}`;
      return num <= maximum ? null : actualMessage;
    },

  fileType:
    (allowedTypes: string[], message?: string): ValidationRule =>
    value => {
      const file = value as File | FileList | null;
      if (!file) return null;

      const files = file instanceof FileList ? Array.from(file) : [file];
      const actualMessage =
        message || `Allowed types: ${allowedTypes.join(', ')}`;

      for (const f of files) {
        const extension = f.name.split('.').pop()?.toLowerCase();
        const mimeType = f.type.toLowerCase();

        const isValidExtension =
          extension &&
          allowedTypes.some(
            type =>
              type.toLowerCase() === extension ||
              type.toLowerCase() === `.${extension}`
          );
        const isValidMimeType = allowedTypes.some(type =>
          mimeType.includes(type.toLowerCase())
        );

        if (!isValidExtension && !isValidMimeType) {
          return actualMessage;
        }
      }

      return null;
    },

  fileSize:
    (maxSizeBytes: number, message?: string): ValidationRule =>
    value => {
      const file = value as File | FileList | null;
      if (!file) return null;

      const files = file instanceof FileList ? Array.from(file) : [file];
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      const actualMessage =
        message || `File size must be less than ${maxSizeMB}MB`;

      for (const f of files) {
        if (f.size > maxSizeBytes) {
          return actualMessage;
        }
      }

      return null;
    },

  range:
    (min: number, max: number, message?: string): ValidationRule =>
    value => {
      if (value === null || value === undefined || value === '') return null;
      const num = Number(value);
      const actualMessage = message || `Must be between ${min} and ${max}`;
      return num >= min && num <= max ? null : actualMessage;
    },

  date:
    (message = 'Please enter a valid date'): ValidationRule =>
    value => {
      if (!value) return null;
      if (value instanceof Date) {
        return !isNaN(value.getTime()) ? null : message;
      }
      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        return !isNaN(date.getTime()) ? null : message;
      }
      return message;
    },

  dateRange:
    (minDate?: Date, maxDate?: Date, message?: string): ValidationRule =>
    value => {
      if (!value) return null;

      let date: Date;
      if (value instanceof Date) {
        date = value;
      } else if (typeof value === 'string' || typeof value === 'number') {
        date = new Date(value);
      } else {
        return 'Please enter a valid date';
      }

      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }

      if (minDate && date < minDate) {
        return message || `Date must be after ${minDate.toLocaleDateString()}`;
      }

      if (maxDate && date > maxDate) {
        return message || `Date must be before ${maxDate.toLocaleDateString()}`;
      }

      return null;
    },

  url:
    (message = 'Please enter a valid URL'): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },

  phone:
    (message = 'Please enter a valid phone number'): ValidationRule =>
    value => {
      if (!value || typeof value !== 'string') return null;
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-()]/g, '')) ? null : message;
    },
};

/**
 * Validation composable for form fields
 *
 * @param rules - Validation rules object
 * @param options - Validation options
 * @returns Validation utilities
 *
 * @example
 * ```ts
 * const { errors, isValid, validateField } = useValidate({
 *   email: [validationRules.required(), validationRules.email()],
 *   password: [validationRules.required(), validationRules.minLength(8)]
 * });
 *
 * // Validate single field
 * const emailError = validateField('email', 'test@example.com');
 *
 * // Check if form is valid
 * if (isValid.value) {
 *   // Submit form
 * }
 * ```
 */
export function useValidate(
  rules: Record<string, ValidationRule[]>,
  options: UseValidateOptions = {}
): UseValidateReturn {
  const { immediate = false, debounce = 0 } = options;

  const errors = ref<Record<string, string | null>>({});

  // Initialize errors object
  Object.keys(rules).forEach(field => {
    errors.value[field] = null;
  });

  const isValid = computed(() => {
    return Object.values(errors.value).every(error => error === null);
  });

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const validateField = (
    field: string,
    value: ValidatableValue
  ): string | null => {
    const fieldRules = rules[field];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) {
        errors.value[field] = error;
        return error;
      }
    }

    errors.value[field] = null;
    return null;
  };

  const validateFieldDebounced = (
    field: string,
    value: ValidatableValue
  ): string | null => {
    if (debounce > 0) {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      debounceTimer = setTimeout(() => {
        validateField(field, value);
      }, debounce);

      return errors.value[field];
    } else {
      return validateField(field, value);
    }
  };

  const validateAll = (
    values: Record<string, ValidatableValue>
  ): Record<string, string | null> => {
    const newErrors: Record<string, string | null> = {};

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field]);
      newErrors[field] = error;
    });

    return newErrors;
  };

  const clearError = (field: string): void => {
    errors.value[field] = null;
  };

  const clearAllErrors = (): void => {
    Object.keys(errors.value).forEach(field => {
      errors.value[field] = null;
    });
  };

  const setError = (field: string, error: string): void => {
    errors.value[field] = error;
  };

  // Immediate validation if requested
  if (immediate) {
    Object.keys(rules).forEach(field => {
      validateField(field, undefined);
    });
  }

  return {
    errors,
    isValid,
    validateField: debounce > 0 ? validateFieldDebounced : validateField,
    validateAll,
    clearError,
    clearAllErrors,
    setError,
  };
}
