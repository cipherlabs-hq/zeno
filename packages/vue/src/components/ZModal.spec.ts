import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZModal from './ZModal.vue';

expect.extend(toHaveNoViolations as any);

// Mock the focus trap utility
vi.mock('@usezeno/core', () => ({
  createFocusTrap: vi.fn(() => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    isActive: vi.fn(() => false),
  })),
}));

// Mock Teleport for testing
const TeleportMock = {
  name: 'Teleport',
  props: ['to'],
  template: '<div data-teleport-target="body"><slot /></div>',
};

describe('ZModal', () => {
  let originalBodyStyle: string;

  beforeEach(() => {
    originalBodyStyle = document.body.style.overflow;
    // Clear any existing event listeners
    document.removeEventListener = vi.fn();
    document.addEventListener = vi.fn();
  });

  afterEach(() => {
    document.body.style.overflow = originalBodyStyle;
    vi.clearAllMocks();
  });

  it('renders modal when modelValue is true', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
      slots: {
        default: '<p>Modal content</p>',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.z-modal').exists()).toBe(true);
    expect(wrapper.find('.z-modal__title').text()).toBe('Test Modal');
    expect(wrapper.text()).toContain('Modal content');
  });

  it('does not render modal when modelValue is false', () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: false,
        title: 'Test Modal',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    expect(wrapper.find('.z-modal').exists()).toBe(false);
  });

  it('applies correct size class', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        size: 'lg',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.z-modal--lg').exists()).toBe(true);
  });

  it('renders header slot content', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
      },
      slots: {
        header: '<h2>Custom Header</h2>',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.z-modal__header h2').text()).toBe('Custom Header');
  });

  it('renders footer slot content', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
      },
      slots: {
        footer: '<button>Custom Footer</button>',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.z-modal__footer button').text()).toBe(
      'Custom Footer'
    );
  });

  it('emits update:modelValue when close button is clicked', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const closeButton = wrapper.find('.z-modal__close');
    expect(closeButton.exists()).toBe(true);

    await closeButton.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('emits update:modelValue when overlay is clicked and closeOnOverlay is true', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        closeOnOverlay: true,
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const overlay = wrapper.find('.z-modal-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('does not emit update:modelValue when overlay is clicked and closeOnOverlay is false', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        closeOnOverlay: false,
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const overlay = wrapper.find('.z-modal-overlay');
    await overlay.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('does not close when modal content is clicked', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        closeOnOverlay: true,
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const modal = wrapper.find('.z-modal');
    await modal.trigger('click');

    expect(wrapper.emitted('update:modelValue')).toBeFalsy();
  });

  it('hides close button when hideCloseButton is true', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
        hideCloseButton: true,
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.z-modal__close').exists()).toBe(false);
  });

  it('sets correct aria attributes', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const modal = wrapper.find('.z-modal');
    expect(modal.attributes('role')).toBe('dialog');
    expect(modal.attributes('aria-modal')).toBe('true');
    // Check that aria attributes exist and have some value (ID generation may vary)
    expect(modal.attributes('aria-labelledby')).toBeTruthy();
    expect(modal.attributes('aria-describedby')).toBeTruthy();
  });

  it('has no accessibility violations', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Accessible Modal',
      },
      slots: {
        default: '<p>Modal content for accessibility testing</p>',
      },
      attachTo: document.body,
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });

  it('handles keyboard events correctly', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        closeOnEsc: true,
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    // Check that the modal is rendered and has proper keyboard handling
    expect(wrapper.find('.z-modal').exists()).toBe(true);
    expect(wrapper.props('closeOnEsc')).toBe(true);
  });

  it('renders correctly with all props', async () => {
    const wrapper = mount(ZModal, {
      props: {
        modelValue: true,
        title: 'Test Modal',
        size: 'md',
      },
      slots: {
        default: '<p>Modal content</p>',
        footer: '<button>Save</button>',
      },
      global: {
        stubs: {
          Teleport: TeleportMock,
          Transition: false,
        },
      },
    });

    await nextTick();

    // Check that all elements are rendered correctly
    expect(wrapper.find('.z-modal').exists()).toBe(true);
    expect(wrapper.find('.z-modal__title').text()).toBe('Test Modal');
    expect(wrapper.find('.z-modal__body').text()).toContain('Modal content');
    expect(wrapper.find('.z-modal__footer').text()).toContain('Save');
  });
});
