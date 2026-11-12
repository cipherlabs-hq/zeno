import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import ZAvatar from './ZAvatar.vue';
import { mountWithLandmark } from '../test-utils/accessibility-wrapper';

expect.extend(toHaveNoViolations as any);

describe('ZAvatar', () => {
  it('renders initials when name is provided', () => {
    const wrapper = mount(ZAvatar, {
      props: { name: 'John Doe' },
    });

    expect(wrapper.find('.z-avatar__initials').text()).toBe('JD');
  });

  it('renders image when src is provided', () => {
    const wrapper = mount(ZAvatar, {
      props: { src: 'test.jpg', alt: 'Test' },
    });

    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('src')).toBe('test.jpg');
  });

  it('renders fallback icon when no src or name', () => {
    const wrapper = mount(ZAvatar);

    expect(wrapper.find('.z-avatar__fallback').exists()).toBe(true);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('applies correct size styles', () => {
    const wrapper = mount(ZAvatar, {
      props: { size: 'lg', name: 'Test' },
    });

    expect(wrapper.find('.z-avatar--lg').exists()).toBe(true);
    const avatarElement = wrapper.find('.z-avatar');
    expect(avatarElement.attributes('style')).toContain('width: 64px');
    expect(avatarElement.attributes('style')).toContain('height: 64px');
  });

  it('has no accessibility violations', async () => {
    const wrapper = mountWithLandmark(ZAvatar, {
      props: { name: 'John Doe', alt: 'User avatar' },
    });

    const results = await axe(wrapper.element);
    expect(results).toHaveNoViolations();
  });
});
