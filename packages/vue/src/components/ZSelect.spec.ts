import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe } from 'jest-axe';
import { nextTick } from 'vue';
import ZSelect from './ZSelect.vue';
import { validationRules } from '@usezeno/composables';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';

// Helper function to wait for validation
const waitForValidation = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 50));
};

const mockOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom', disabled: true },
  { value: 'fr', label: 'France' },
];

const simpleOptions = ['Option 1', 'Option 2', 'Option 3'];

describe('ZSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render successfully with default props', () => {
      const wrapper = mount(ZSelect);
      const select = wrapper.find('select');
      expect(select.exists()).toBe(true);
    });

    it('should render with label', () => {
      const wrapper = mount(ZSelect, {
        props: { label: 'Country', options: mockOptions },
      });
      expect(wrapper.text()).toContain('Country');
    });

    it('should render with placeholder', () => {
      const wrapper = mount(ZSelect, {
        props: { placeholder: 'Select a country', options: mockOptions },
      });
      expect(wrapper.text()).toContain('Select a country');
    });

    it('should render with help text', () => {
      const wrapper = mount(ZSelect, {
        props: { helpText: 'Choose your country', options: mockOptions },
      });
      expect(wrapper.text()).toContain('Choose your country');
    });

    it('should show required indicator', () => {
      const wrapper = mount(ZSelect, {
        props: { label: 'Country', required: true, options: mockOptions },
      });
      expect(wrapper.text()).toContain('*');
    });
  });

  describe('Options Handling', () => {
    it('should render object options correctly', () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });

      mockOptions.forEach(option => {
        expect(wrapper.text()).toContain(option.label);
      });
    });

    it('should render string options correctly', () => {
      const wrapper = mount(ZSelect, {
        props: { options: simpleOptions },
      });

      simpleOptions.forEach(option => {
        expect(wrapper.text()).toContain(option);
      });
    });

    it('should render number options correctly', () => {
      const numberOptions = [1, 2, 3, 4, 5];
      const wrapper = mount(ZSelect, {
        props: { options: numberOptions },
      });

      numberOptions.forEach(option => {
        expect(wrapper.text()).toContain(option.toString());
      });
    });

    it('should disable options when specified', () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });

      const options = wrapper.findAll('option');
      const ukOption = options.find(opt => opt.text() === 'United Kingdom');
      expect(ukOption?.attributes('disabled')).toBeDefined();
    });

    it('should render placeholder as disabled option', () => {
      const wrapper = mount(ZSelect, {
        props: { placeholder: 'Select country', options: mockOptions },
      });

      const placeholderOption = wrapper.find('option[value=""]');
      expect(placeholderOption.exists()).toBe(true);
      expect(placeholderOption.attributes('disabled')).toBeDefined();
      expect(placeholderOption.text()).toBe('Select country');
    });
  });

  describe('Model Value', () => {
    it('should bind model value correctly', () => {
      const wrapper = mount(ZSelect, {
        props: { modelValue: 'ca', options: mockOptions },
      });
      const select = wrapper.find('select');
      expect(select.element.value).toBe('ca');
    });

    it('should emit update:modelValue on change', async () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });
      const select = wrapper.find('select');

      await select.setValue('us');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['us']);
    });

    it('should emit change event with value and option', async () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });
      const select = wrapper.find('select');

      await select.setValue('us');

      expect(wrapper.emitted('change')).toBeTruthy();
      const changeEvent = wrapper.emitted('change')![0];
      expect(changeEvent[0]).toBe('us');
      expect(changeEvent[1]).toEqual(mockOptions[0]);
    });
  });

  describe('States', () => {
    it('should handle disabled state', () => {
      const wrapper = mount(ZSelect, {
        props: { disabled: true, options: mockOptions },
      });
      const select = wrapper.find('select');
      expect(select.attributes('disabled')).toBeDefined();
    });

    it('should handle required state', () => {
      const wrapper = mount(ZSelect, {
        props: { required: true, options: mockOptions },
      });
      const select = wrapper.find('select');
      expect(select.attributes('required')).toBeDefined();
    });

    it('should show error state with validation', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          label: 'Country',
          validator: validationRules.required(),
          modelValue: '',
          options: mockOptions,
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('This field is required');

      const select = wrapper.find('select');
      expect(select.attributes('aria-invalid')).toBe('true');
    });
  });

  describe('Validation', () => {
    it('should validate on change when validateOnBlur is false', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          validator: validationRules.required(),
          validateOnBlur: false,
          options: mockOptions,
        },
      });

      const select = wrapper.find('select');
      await select.setValue('us');
      await waitForValidation();

      expect(wrapper.text()).not.toContain('This field is required');
    });

    it('should validate on blur when validateOnBlur is true', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          validator: validationRules.required(),
          validateOnBlur: true,
          modelValue: '',
          options: mockOptions,
        },
      });

      // Error should not show initially
      expect(wrapper.text()).not.toContain('This field is required');

      // Trigger blur
      const select = wrapper.find('select');
      await select.trigger('blur');
      await waitForValidation();

      expect(wrapper.text()).toContain('This field is required');
    });

    it('should handle custom validation rules', async () => {
      const customValidator = (value: any) => {
        if (value === 'uk') {
          return 'UK is not available';
        }
        return null;
      };

      const wrapper = mount(ZSelect, {
        props: {
          validator: customValidator,
          modelValue: 'uk',
          options: mockOptions,
        },
      });

      await waitForValidation();

      expect(wrapper.text()).toContain('UK is not available');
    });

    it('should clear validation error when value becomes valid', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          validator: validationRules.required(),
          modelValue: '',
          options: mockOptions,
        },
      });

      await waitForValidation();
      expect(wrapper.text()).toContain('This field is required');

      await wrapper.setProps({ modelValue: 'us' });
      await waitForValidation();

      expect(wrapper.text()).not.toContain('This field is required');
    });
  });

  describe('Event Handling', () => {
    it('should emit focus event', async () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });
      const select = wrapper.find('select');

      await select.trigger('focus');

      expect(wrapper.emitted('focus')).toBeTruthy();
    });

    it('should emit blur event', async () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });
      const select = wrapper.find('select');

      await select.trigger('blur');

      expect(wrapper.emitted('blur')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const wrapper = mountWithLandmark(ZSelect, {
        props: {
          label: 'Country',
          helpText: 'Select your country',
          placeholder: 'Choose a country',
          options: mockOptions,
          required: true,
        },
      });

      const results = await axe(wrapper.html());
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper ARIA attributes when valid', () => {
      const wrapper = mount(ZSelect, {
        props: {
          label: 'Country',
          modelValue: 'us',
          options: mockOptions,
        },
      });

      const select = wrapper.find('select');
      expect(select.attributes('aria-invalid')).toBe('false');
    });

    it('should have proper ARIA attributes when invalid', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          label: 'Country',
          validator: validationRules.required(),
          modelValue: '',
          options: mockOptions,
        },
      });

      await waitForValidation();

      const select = wrapper.find('select');
      expect(select.attributes('aria-invalid')).toBe('true');

      const describedBy = select.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('should associate help text with select', () => {
      const wrapper = mount(ZSelect, {
        props: {
          label: 'Country',
          helpText: 'Help text',
          options: mockOptions,
        },
      });

      const select = wrapper.find('select');
      const describedBy = select.attributes('aria-describedby');
      expect(describedBy).toBeTruthy();
    });

    it('should have proper label association', () => {
      const wrapper = mount(ZSelect, {
        props: {
          label: 'Country',
          options: mockOptions,
        },
      });

      const label = wrapper.find('label');
      const select = wrapper.find('select');

      expect(label.attributes('for')).toBe(select.attributes('id'));
    });
  });

  describe('Visual Elements', () => {
    it('should render dropdown icon', () => {
      const wrapper = mount(ZSelect, {
        props: { options: mockOptions },
      });

      const icon = wrapper.find('.z-select__icon svg');
      expect(icon.exists()).toBe(true);
    });

    it('should apply placeholder styling', () => {
      const wrapper = mount(ZSelect, {
        props: {
          placeholder: 'Select option',
          modelValue: '',
          options: mockOptions,
        },
      });

      const select = wrapper.find('select');
      expect(select.classes()).toContain('z-select--placeholder');
    });
  });

  describe('CSS Classes', () => {
    it('should apply error classes when invalid', async () => {
      const wrapper = mount(ZSelect, {
        props: {
          validator: validationRules.required(),
          modelValue: '',
          options: mockOptions,
        },
      });

      await waitForValidation();

      const select = wrapper.find('select');
      expect(select.classes()).toContain('z-select--error');
    });

    it('should apply disabled classes', () => {
      const wrapper = mount(ZSelect, {
        props: {
          disabled: true,
          options: mockOptions,
        },
      });

      const select = wrapper.find('select');
      expect(select.classes()).toContain('z-select--disabled');
    });
  });

  describe('Integration', () => {
    it('should work with v-model', async () => {
      const TestComponent = {
        template: `
          <ZSelect 
            v-model="value" 
            label="Test Select"
            :options="options"
            :validator="validator"
          />
        `,
        components: { ZSelect },
        data() {
          return {
            value: '',
            options: mockOptions,
            validator: validationRules.required(),
          };
        },
      };

      const wrapper = mount(TestComponent);
      const select = wrapper.find('select');

      await select.setValue('us');

      expect(wrapper.vm.value).toBe('us');
    });

    it('should work in form context', async () => {
      const TestForm = {
        template: `
          <form @submit.prevent="onSubmit">
            <ZSelect 
              v-model="country" 
              label="Country"
              :options="options"
              :validator="countryValidator"
              required
            />
            <button type="submit" :disabled="!isValid">Submit</button>
          </form>
        `,
        components: { ZSelect },
        data() {
          return {
            country: '',
            options: mockOptions,
            countryValidator: validationRules.required(),
          };
        },
        computed: {
          isValid(): boolean {
            const vm = this as any;
            return vm.country.length > 0 && !vm.countryValidator(vm.country);
          },
        },
        methods: {
          onSubmit() {
            const vm = this as any;
            vm.$emit('submit', { country: vm.country });
          },
        },
      };

      const wrapper = mount(TestForm);
      const select = wrapper.find('select');
      const button = wrapper.find('button');

      // Initially disabled
      expect(button.attributes('disabled')).toBeDefined();

      // Select a country
      await select.setValue('us');
      await nextTick();

      expect(button.attributes('disabled')).toBeUndefined();
    });

    it('should handle mixed option types', () => {
      const stringOptions = ['String Option'];
      const objectOptions = [{ value: 'obj', label: 'Object Option' }];
      const numberOptions = [42];

      // Test string options
      const stringWrapper = mount(ZSelect, {
        props: { options: stringOptions },
      });
      expect(stringWrapper.text()).toContain('String Option');

      // Test object options
      const objectWrapper = mount(ZSelect, {
        props: { options: objectOptions },
      });
      expect(objectWrapper.text()).toContain('Object Option');

      // Test number options
      const numberWrapper = mount(ZSelect, {
        props: { options: numberOptions },
      });
      expect(numberWrapper.text()).toContain('42');
    });
  });
});
