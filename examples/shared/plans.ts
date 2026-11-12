import type { SelectOption } from '@usezeno/core/web-components';

export const plans: SelectOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team' },
  { value: 'company', label: 'Company' },
];

/** What a form would send, as `name=value` pairs. */
export function submission(form: HTMLFormElement): string {
  return [...new FormData(form)]
    .map(([name, value]) => `${name}=${String(value)}`)
    .join('&');
}
