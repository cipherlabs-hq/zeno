/**
 * The Zeno mark. This is the one place it is named: the navigation bar, the
 * favicon and the home page all read from here. To change the mark, replace
 * the files in static/img or point these paths at new ones.
 *
 * The word in the lockups is Baloo 2 Bold (SIL Open Font License), converted
 * to outlines. The site does not load that typeface.
 */
export const brand = {
  name: 'Zeno',
  /** The head in a circle. Used small: the favicon. */
  avatar: 'img/zeno-avatar.svg',
  /** The dog beside the word "Zeno", for a light background. */
  lockup: 'img/zeno-lockup.svg',
  /** The whole dog. Used large, on a light background. */
  mascot: 'img/zeno-mascot.svg',
  /** The whole dog with a white keyline, for a dark background. */
  mascotOnDark: 'img/zeno-mascot-sticker.svg',
  footLine: 'Zeno is named after a dog, a small black Yorkie poodle mix.',
} as const;

export const links = {
  site: 'https://zeno.thecipherlabs.com',
  repository: 'https://github.com/cipherlabs-hq/zeno',
  issues: 'https://github.com/cipherlabs-hq/zeno/issues',
  security: 'https://github.com/cipherlabs-hq/zeno/security/advisories/new',
  npm: 'https://www.npmjs.com/org/usezeno',
} as const;
