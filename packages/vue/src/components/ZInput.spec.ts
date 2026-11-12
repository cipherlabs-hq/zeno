import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import { nextTick } from 'vue';
import ZInput from './ZInput.vue';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';
import { validationRules } from '@usezeno/composables';

// Helper function to wait for validation
const waitForValidation = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 50));
};

describe('ZInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render successfully with default props', () => {
      const wrapper = mount(ZInput);
      const input = wrapper.find('input');
      expect(input.exists()).toBe(true);
    });

    it('should render with label', () => {
      const wrapper = mount(ZInput, {
        props: { label: 'Email Address' },
      });
      expect(wrapper.text()).toContain('Email Address');
    });

    it('should render with placeholder', () => {
      const wrapper = mount(ZInput, {
        props: { placeholder: 'Enter your email' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('placeholder')).toBe('Enter your email');
    });

    it('should render with help text', () => {
      const wrapper = mount(ZInput, {
        props: { helpText: "We'll never share your email" },
      });
      expect(wrapper.text()).toContain("We'll never share your email");
    });

    it('should show required indicator', () => {
      const wrapper = mount(ZInput, {
        props: { label: 'Email', required: true },
      });
      expect(wrapper.text()).toContain('*');
    });
  });

  describe('Input Types', () => {
    it('should render email input type', () => {
      const wrapper = mount(ZInput, {
        props: { type: 'email' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('type')).toBe('email');
    });

    it('should render password input type', () => {
      const wrapper = mount(ZInput, {
        props: { type: 'password' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('type')).toBe('password');
    });

    it('should render number input type', () => {
      const wrapper = mount(ZInput, {
        props: { type: 'number' },
      });
      const input = wrapper.find('input');
      expect(input.attributes('type')).toBe('number');
    });
  });

  describe('Model Value', () => {
    it('should bind model value correctly', () => {
      const wrapper = mount(ZInput, {
        props: { modelValue: 'test value' },
      });
      const input = wrapper.find('input');
      expect(input.element.value).toBe('test value');
    });

    it('should emit update:modelValue on input', async () => {
      const wrapper = mount(ZInput);
      const input = wrapper.find('input');

      await input.setValue('new value');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value']);
    });

    it('should handle number input correctly', async () => {
      const wrapper = mount(ZInput, {
        props: { type: 'number' },
      });
      const input = wrapper.find('input');

      await input.setValue('123');

      expect(wrapper.emitted('update:modelValue')![0]).toEqual([123]);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      const wrapper = mount(ZInput, {
        props: { disabled: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('disabled')).toBeDefined();
    });

    it('should handle required state', () => {
      const wrapper = mount(ZInput, {
        props: { required: true },
      });
      const input = wrapper.find('input');
      expect(input.attributes('required')).toBeDefined();
    });

    it('should show error state with validation', async () => {
      const wrapper = mount(ZInput, {
        props: {
          label: 'Email',
          validator: validationRules.email(),
          modelValue: 'invalid-email',
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('Please enter a valid email address');

      const input = wrapper.find('input');
      expect(input.attributes('aria-invalid')).toBe('true');
    });
  });

  describe('Validation', () => {
    it('should validate on input when validateOnBlur is false', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: validationRules.email(),
          validateOnBlur: false,
        },
      });

      const input = wrapper.find('input');
      await input.setValue('invalid-email');
      await waitForValidation();

      expect(wrapper.text()).toContain('Please enter a valid email address');
    });

    it('should validate on blur when validateOnBlur is true', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: validationRules.email(),
          validateOnBlur: true,
          modelValue: 'invalid-email',
        },
      });

      // Error should not show initially
      expect(wrapper.text()).not.toContain(
        'Please enter a valid email address'
      );

      // Trigger blur
      const input = wrapper.find('input');
      await input.trigger('blur');
      await waitForValidation();

      expect(wrapper.text()).toContain('Please enter a valid email address');
    });

    it('should handle multiple validation rules', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: [validationRules.required(), validationRules.minLength(8)],
          modelValue: 'abc',
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('Must be at least 8 characters');
    });

    it('should handle required validation', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: validationRules.required(),
          modelValue: '',
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('This field is required');
    });

    it('should clear validation error when value becomes valid', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: validationRules.email(),
          modelValue: 'invalid-email',
        },
      });

      await waitForValidation();
      expect(wrapper.text()).toContain('Please enter a valid email address');

      await wrapper.setProps({ modelValue: 'valid@example.com' });
      await waitForValidation();

      expect(wrapper.text()).not.toContain(
        'Please enter a valid email address'
      );
    });

    it('should handle number validation', async () => {
      const wrapper = mount(ZInput, {
        props: {
          type: 'number',
          validator: validationRules.min(18),
          modelValue: 16,
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('Must be at least 18');
    });
  });

  describe('Event Handling', () => {
    it('should emit focus event', async () => {
      const wrapper = mount(ZInput);
      const input = wrapper.find('input');

      await input.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('should emit blur event', async () => {
      const wrapper = mount(ZInput);
      const input = wrapper.find('input');

      await input.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const wrapper = mountWithLandmark(ZInput, {
        props: {
          label: 'Email Address',
          helpText: 'Enter a valid email',
          placeholder: 'user@example.com',
          required: true,
        },
      });

      const results = await axe(wrapper.element);
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper ARIA attributes when valid', () => {
      const wrapper = mount(ZInput, {
        props: {
          label: 'Email',
          modelValue: 'test@example.com',
        },
      });

      const input = wrapper.find('input');
      expect(input.attributes('aria-invalid')).toBe('false');
    });

    it('should have proper ARIA attributes when invalid', async () => {
      const wrapper = mount(ZInput, {
        props: {
          label: 'Email',
          validator: validationRules.email(),
          modelValue: 'invalid-email',
        },
      });

      await waitForValidation();

      const input = wrapper.find('input');
      expect(input.attributes('aria-invalid')).toBe('true');

      const describedBy = input.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('should associate help text with input', () => {
      const wrapper = mount(ZInput, {
        props: {
          label: 'Email',
          helpText: 'Help text',
        },
      });

      const input = wrapper.find('input');
      const describedBy = input.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('should have proper label association', () => {
      const wrapper = mount(ZInput, {
        props: { label: 'Email Address' },
      });

      const label = wrapper.find('label');
      const input = wrapper.find('input');

      expect(label.attributes('for')).toBe(input.attributes('id'));
    });
  });

  describe('CSS Classes', () => {
    it('should apply error classes when invalid', async () => {
      const wrapper = mount(ZInput, {
        props: {
          validator: validationRules.required(),
          modelValue: '',
        },
      });

      await waitForValidation();

      const input = wrapper.find('input');
      expect(input.classes()).toContain('z-input--error');
    });

    it('should apply disabled classes', () => {
      const wrapper = mount(ZInput, {
        props: { disabled: true },
      });

      const input = wrapper.find('input');
      expect(input.classes()).toContain('z-input--disabled');
    });
  });

  describe('Integration', () => {
    it('should work with v-model', async () => {
      const TestComponent = {
        template: `
          <ZInput 
            v-model="value" 
            label="Test Input"
            :validator="validator"
          />
        `,
        components: { ZInput },
        data() {
          return {
            value: '',
            validator: validationRules.required(),
          };
        },
      };

      const wrapper = mount(TestComponent);
      const input = wrapper.find('input');

      await input.setValue('test value');

      expect(wrapper.vm.value).toBe('test value');
    });

    it('should work in form context', async () => {
      const TestForm = {
        template: `
          <form @submit.prevent="onSubmit">
            <ZInput 
              v-model="email" 
              label="Email"
              :validator="emailValidator"
              required
            />
            <button type="submit" :disabled="!isValid">Submit</button>
          </form>
        `,
        components: { ZInput },
        data() {
          return {
            email: '',
            emailValidator: validationRules.email(),
          };
        },
        computed: {
          isValid(): boolean {
            return (
              (this as any).email.length > 0 &&
              !(this as any).emailValidator((this as any).email)
            );
          },
        },
        methods: {
          onSubmit() {
            (this as any).$emit('submit', { email: (this as any).email });
          },
        },
      };

      const wrapper = mount(TestForm);
      const input = wrapper.find('input');
      const button = wrapper.find('button');

      // Initially disabled
      expect(button.attributes('disabled')).toBeDefined();

      // Enter valid email
      await input.setValue('test@example.com');
      await nextTick();

      expect(button.attributes('disabled')).toBeUndefined();
    });
  });
});
