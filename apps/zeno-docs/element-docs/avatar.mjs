export default {
  category: 'Data display',

  examples: [
    {
      title: 'Initials',
      description:
        'Without an image, the avatar shows initials. They come from `name`: the first and last word, or the first two letters of a single word. `initials` sets them directly.',
      html: `<zeno-avatar name="Ada Lovelace"></zeno-avatar>
<zeno-avatar name="Grace Brewster Hopper"></zeno-avatar>
<zeno-avatar name="Katherine"></zeno-avatar>
<zeno-avatar name="Quality team" initials="QA"></zeno-avatar>`,
    },
    {
      title: 'Sizes',
      html: `<zeno-avatar size="xs" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar size="sm" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar size="md" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar size="lg" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar size="xl" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar size="2xl" name="Ada Lovelace"></zeno-avatar>`,
    },
    {
      title: 'Shapes and border',
      html: `<zeno-avatar shape="circle" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar shape="rounded" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar shape="square" name="Ada Lovelace"></zeno-avatar>
<zeno-avatar bordered name="Ada Lovelace"></zeno-avatar>`,
    },
    {
      title: 'Icon',
      description:
        '`icon` shows a registered icon in place of initials. With no image, icon, name or initials, the avatar shows a person icon. `alt` gives the accessible name.',
      html: `<zeno-avatar icon="settings" alt="Settings"></zeno-avatar>
<zeno-avatar icon="star" alt="Favourites" shape="rounded"></zeno-avatar>
<zeno-avatar alt="Unknown user"></zeno-avatar>`,
    },
    {
      title: 'Clickable',
      description:
        'With `clickable` the avatar can take focus, and Enter or Space fire a click.',
      html: `<zeno-avatar clickable name="Ada Lovelace"></zeno-avatar>
<p data-result>Not opened yet.</p>`,
      script: `let count = 0;
document.querySelector('zeno-avatar').addEventListener('click', () => {
  count += 1;
  document.querySelector('[data-result]').textContent = 'Opened ' + count + ' times.';
});`,
    },
  ],

  keyboard: [
    {
      keys: ['Tab'],
      action: 'Moves focus to the avatar, only when it is `clickable`.',
    },
    {
      keys: ['Enter', 'Space'],
      action: 'Fires a click on the avatar, only when it is `clickable`.',
    },
  ],

  accessibility: [
    'The avatar has `role="img"`. With `clickable` it has `role="button"` and `tabindex="0"`.',
    'The accessible name is the first of these that is set: `aria-label`, `alt`, `name`. With none of them it is “Avatar”.',
    'The initials and the icon are not announced. Only the name is.',
    'An image set with `src` is a native `<img>`. If it fails to load, the avatar falls back to the icon or the initials.',
  ],

  gaps: [
    // zeno-avatar.ts:307 against 112-140: the class is avatar--solid/soft/outlined/plain, the CSS styles avatar--primary/secondary/success/warning/error/info.
    '`variant` does nothing. Its values are `solid`, `soft`, `outlined` and `plain`, but the styles are written for `primary`, `secondary`, `success`, `warning`, `error` and `info`, which the type does not allow. Every avatar is grey.',
    // zeno-avatar.ts:63 against 181-192 and 211-226: both sit inside .avatar, which has overflow: hidden.
    'The `status` dot and the `badge` count are cut off. They are placed on the edge of the avatar, and the avatar clips everything outside its shape. On a round avatar only a small part of each is visible.',
    // zeno-avatar.ts:436, 452-472: aria-label on spans without a role, inside role="img".
    '`status` and `badge` are not announced. Their labels are on elements without a role, inside `role="img"`, which hides its children. The status is shown by colour only.',
    // zeno-avatar.ts:390, 445, 455, 466: literals 'Avatar', 'Status: …', '… notifications'.
    'The texts “Avatar”, “Status: …” and “… notifications” are English and cannot be changed.',
    // zeno-avatar.ts:313, 358-362: imageError is set to true on error and never set back.
    'After one image fails to load, the avatar never tries an image again, also when `src` changes to a good address.',
    // zeno-avatar.ts:229-231 against 55-56, 69-84: --avatar-size is set on the inner .avatar, not on the host.
    'The `.avatar-group-item` host style uses `--avatar-size`, which is only defined on the inner element. The overlap margin it should give is never applied, and there is no avatar group element.',
  ],
};
