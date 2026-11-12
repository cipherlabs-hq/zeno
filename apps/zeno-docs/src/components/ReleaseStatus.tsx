import Link from '@docusaurus/Link';
import { type ReactNode, useEffect } from 'react';
import site from '../generated/site.json';
import { loadZeno } from '../zeno';

/**
 * Says whether Zeno can be installed yet. It reads the changelog through the
 * generated site data, so it changes by itself with the first release.
 */
export function ReleaseStatus(): ReactNode {
  useEffect(() => {
    void loadZeno();
  }, []);

  if (site.published) {
    return (
      <div className="status-note">
        <zeno-badge variant="warning">Pre-release</zeno-badge>
        <p>
          The current version is {site.version}. Until 1.0, a minor release can
          change names and behaviour. See{' '}
          <Link to="/versioning">Versioning and support</Link>.
        </p>
      </div>
    );
  }
  return (
    <div className="status-note">
      <zeno-badge variant="warning">Pre-release</zeno-badge>
      <p>
        Nothing is published to npm yet, so the install commands on this site do
        not work today. The first release will be 0.1.0. See{' '}
        <Link to="/releases">Releases</Link>.
      </p>
    </div>
  );
}
