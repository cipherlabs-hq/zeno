import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { Props } from '@theme/Logo';
import { type ReactNode } from 'react';
import { brand } from '../../brand';
import mark from '../../generated/brand.json';

/**
 * The brand link in the navigation bar: the Zeno lockup, the dog beside the
 * word.
 *
 * The word in both lockup files is drawn in `currentColor`. As a plain image
 * that is black, which suits the light theme. On the dark theme the markup of
 * the file is put in the page itself, unchanged, so the word takes the text
 * colour. scripts/generate.mjs reads it from static/img.
 */
export default function Logo({
  imageClassName,
  titleClassName: _titleClassName,
  ...rest
}: Props): ReactNode {
  return (
    <Link to={useBaseUrl('/')} {...rest} aria-label={`${brand.name}, home`}>
      <span className={imageClassName}>
        <img
          className="site-lockup site-lockup--light"
          src={useBaseUrl(brand.lockup)}
          alt=""
          width={96}
          height={32}
        />
        <span
          className="site-lockup site-lockup--dark"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: mark.lockupOnDark }}
        />
      </span>
    </Link>
  );
}
